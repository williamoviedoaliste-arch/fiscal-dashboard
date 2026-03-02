# 📋 Diccionario de Tablas BigQuery

**Estructura y definición de tablas usadas en el Fiscal Dashboard**

---

## 📖 Índice

1. [Información General](#información-general)
2. [Tabla: BT_MP_DAS_TAX_EVENTS](#tabla-bt_mp_das_tax_events)
3. [Tabla: DIM_PENDINGS](#tabla-dim_pendings)
4. [Relaciones entre Tablas](#relaciones-entre-tablas)
5. [Queries de Ejemplo](#queries-de-ejemplo)
6. [Consideraciones Técnicas](#consideraciones-técnicas)

---

## 🌐 Información General

### Proyecto BigQuery
```
Proyecto: meli-bi-data
Región: US (multi-región)
Acceso: Requiere Service Account o gcloud auth
```

### Permisos Necesarios
- `BigQuery Data Viewer` - Para leer tablas
- `BigQuery Job User` - Para ejecutar queries

### Cómo Conectar
```bash
# Autenticación con gcloud
gcloud auth application-default login
gcloud config set project meli-bi-data

# Verificar acceso
bq ls --project_id=meli-bi-data
```

---

## 📊 Tabla: BT_MP_DAS_TAX_EVENTS

### Descripción General

**Nombre Completo**: `WHOWNER.BT_MP_DAS_TAX_EVENTS`

**Propósito**: Almacena todos los eventos relacionados con el ciclo de vida fiscal DAS (emisiones y pagos).

**Dueño**: WHOWNER (Data Warehouse Owner)

**Actualización**: Tiempo casi real (latencia < 1 hora)

**Volumen**: ~50K-100K filas por mes

---

### Schema de la Tabla

| Campo | Tipo | Null | Descripción | Ejemplo |
|-------|------|------|-------------|---------|
| `EVENT_TYPE` | STRING | No | Tipo de evento fiscal | `SERPRO-Emission`, `Payment` |
| `EVENT_DATE` | DATE | Sí | **Fecha en que ocurrió REALMENTE el evento** (cuándo se ejecutó) | `2026-02-18` |
| `CUS_CUST_ID` | STRING | No | ID único del seller | `123456789` |
| `AMOUNT` | STRING | Sí | Monto del evento en BRL (como string) | `2500.50` |
| `TAX_PERIOD` | STRING | Sí | Período fiscal YYYY-MM | `2026-01` |
| `YEAR` | STRING | Sí | **Año fiscal al que CORRESPONDE** (no cuando ocurrió) | `2026` |
| `MONTH` | STRING | Sí | **Mes fiscal al que CORRESPONDE** (01-12) | `01` |
| `DOCUMENT_ID` | STRING | Sí | ID del documento DAS | `DAS-2026-01-123456` |
| `EMISSION_DATE` | DATE | Sí | Fecha de emisión del DAS | `2026-02-05` |
| `DUE_DATE` | DATE | Sí | Fecha de vencimiento | `2026-02-20` |
| `PAYMENT_DATE` | DATE | Sí | Fecha de pago efectivo | `2026-02-18` |
| `STATUS` | STRING | Sí | Estado del documento | `PAID`, `PENDING`, `OVERDUE` |
| `SOURCE_SYSTEM` | STRING | Sí | Sistema origen del evento | `SERPRO`, `MP_PAYMENT_GATEWAY` |
| `CREATED_AT` | TIMESTAMP | No | Timestamp de inserción en BQ | `2026-02-05 10:30:00 UTC` |
| `UPDATED_AT` | TIMESTAMP | Sí | Timestamp de última actualización | `2026-02-18 14:20:00 UTC` |

---

### ⚠️ CONCEPTO CRÍTICO: Diferencia entre EVENT_DATE y MONTH/YEAR

**MUY IMPORTANTE**: Esta tabla tiene **dos tipos de fechas** que significan cosas diferentes:

#### 1. EVENT_DATE - Cuándo ocurrió el evento
- **Qué es**: Fecha en que se **ejecutó** el Payment o Emission
- **Tipo**: DATE
- **Ejemplo**: `EVENT_DATE = '2026-02-18'` significa que el pago se realizó el 18 de febrero

#### 2. MONTH / YEAR - Período fiscal
- **Qué es**: Mes/año fiscal al que **corresponde** el pago o emisión
- **Tipo**: STRING
- **Ejemplo**: `MONTH = '01', YEAR = '2026'` significa que es el DAS del período enero 2026

#### Ejemplo Real Completo

```sql
-- Seller pagó el DAS de Enero 2026 el día 18 de Febrero
{
  "EVENT_TYPE": "Payment",
  "EVENT_DATE": "2026-02-18",     ← Cuándo pagó realmente
  "MONTH": "01",                   ← Mes fiscal que está pagando
  "YEAR": "2026",                  ← Año fiscal que está pagando
  "TAX_PERIOD": "2026-01",         ← Período fiscal
  "CUS_CUST_ID": "123456789",
  "AMOUNT": "2500.50"
}
```

**Lectura**:
- "El seller 123456789 pagó R$ 2,500.50 el **18 de febrero de 2026**"
- "Este pago corresponde al DAS del período fiscal **enero 2026**"

#### Por qué esta diferencia existe

**Calendario fiscal DAS**:
1. **Días 1-31 de Enero**: Seller factura durante el mes
2. **~5 de Febrero**: SERPRO emite DAS del período enero (`MONTH='01', YEAR='2026'`)
3. **5-20 de Febrero**: Seller puede pagar
4. **18 de Febrero**: Seller paga (`EVENT_DATE = '2026-02-18'`)

**Resultado**: El pago del **período enero** (`MONTH='01'`) ocurre en **fecha febrero** (`EVENT_DATE='2026-02-XX'`).

#### Implicaciones para Queries

❌ **Error Común**:
```sql
-- Esto NO filtra pagos de enero, filtra pagos REALIZADOS en enero
WHERE EVENT_DATE >= '2026-01-01' AND EVENT_DATE < '2026-02-01'
```

✅ **Correcto**:
```sql
-- Esto SÍ filtra pagos DEL PERÍODO FISCAL enero
WHERE YEAR = '2026' AND MONTH = '01'
```

**Cuándo usar cada una**:
- **EVENT_DATE**: Análisis temporal de cuándo ocurren los eventos (tendencias por fecha)
- **MONTH/YEAR**: Análisis por período fiscal (compliance de un mes específico)

---

### Valores Posibles

#### EVENT_TYPE

| Valor | Significado | Cuándo ocurre | Frecuencia Relativa |
|-------|-------------|---------------|---------------------|
| `SERPRO-Emission` | Emisión fiscal generada | Inicio del mes (día 1-5) | ~100% de sellers activos |
| `Payment` | Pago fiscal realizado | Antes del día 20 del mes | ~75-85% de emisiones |

#### STATUS

| Valor | Significado | Condición |
|-------|-------------|-----------|
| `PENDING` | Pendiente de pago | `EVENT_DATE < DUE_DATE AND PAYMENT_DATE IS NULL` |
| `PAID` | Pagado | `PAYMENT_DATE IS NOT NULL` |
| `OVERDUE` | Vencido sin pagar | `EVENT_DATE > DUE_DATE AND PAYMENT_DATE IS NULL` |
| `CANCELLED` | Cancelado | Corrección o ajuste fiscal |

---

### Reglas de Negocio

#### 1. **Relación Emisión-Pago**
```sql
-- Una emisión puede tener 0 o 1 pago
-- Un pago debe tener exactamente 1 emisión

-- Ejemplo de emisión sin pago (seller no pagó)
EVENT_TYPE = 'SERPRO-Emission'
DOCUMENT_ID = 'DAS-001'
PAYMENT_DATE = NULL

-- Ejemplo de pago correspondiente
EVENT_TYPE = 'Payment'
DOCUMENT_ID = 'DAS-001'  -- mismo ID
PAYMENT_DATE = '2026-02-18'
```

#### 2. **Campos Obligatorios por EVENT_TYPE**

**Para SERPRO-Emission**:
- ✅ `EVENT_TYPE`
- ✅ `CUS_CUST_ID`
- ✅ `EMISSION_DATE`
- ✅ `DUE_DATE`
- ✅ `AMOUNT`
- ✅ `TAX_PERIOD`

**Para Payment**:
- ✅ `EVENT_TYPE`
- ✅ `CUS_CUST_ID`
- ✅ `PAYMENT_DATE`
- ✅ `AMOUNT`
- ✅ `DOCUMENT_ID` (referencia a emisión)

#### 3. **Conversión de Tipos**

⚠️ **IMPORTANTE**: `AMOUNT`, `YEAR`, `MONTH` son STRING, no numéricos.

```sql
-- ❌ Incorrecto
WHERE AMOUNT > 1000

-- ✅ Correcto
WHERE CAST(AMOUNT AS FLOAT64) > 1000

-- ❌ Incorrecto
WHERE YEAR = 2026

-- ✅ Correcto
WHERE YEAR = '2026'
-- O mejor aún:
WHERE CAST(YEAR AS INT64) = 2026
```

---

### Índices y Particiones

**Particionado por**: `EVENT_DATE` (partición por día)

**Beneficio**: Queries filtradas por fecha son mucho más rápidas.

```sql
-- ✅ Query eficiente (usa partición)
WHERE EVENT_DATE >= '2025-12-01'

-- ❌ Query lenta (no usa partición)
WHERE YEAR = '2025'
```

**Clustering**: `EVENT_TYPE`, `CUS_CUST_ID`

**Beneficio**: Queries filtradas por tipo de evento o seller son optimizadas.

---

### Ejemplo de Datos

```sql
-- Emisión fiscal
{
  "EVENT_TYPE": "SERPRO-Emission",
  "EVENT_DATE": "2026-01-05",
  "CUS_CUST_ID": "987654321",
  "AMOUNT": "3250.75",
  "TAX_PERIOD": "2025-12",
  "YEAR": "2025",
  "MONTH": "12",
  "DOCUMENT_ID": "DAS-2025-12-987654321",
  "EMISSION_DATE": "2026-01-05",
  "DUE_DATE": "2026-01-20",
  "PAYMENT_DATE": null,
  "STATUS": "PENDING",
  "SOURCE_SYSTEM": "SERPRO",
  "CREATED_AT": "2026-01-05 08:15:30 UTC"
}

-- Pago correspondiente
{
  "EVENT_TYPE": "Payment",
  "EVENT_DATE": "2026-01-18",
  "CUS_CUST_ID": "987654321",
  "AMOUNT": "3250.75",
  "TAX_PERIOD": "2025-12",
  "YEAR": "2025",
  "MONTH": "12",
  "DOCUMENT_ID": "DAS-2025-12-987654321",
  "PAYMENT_DATE": "2026-01-18",
  "STATUS": "PAID",
  "SOURCE_SYSTEM": "MP_PAYMENT_GATEWAY",
  "CREATED_AT": "2026-01-18 14:22:10 UTC"
}
```

---

## 🔔 Tabla: DIM_PENDINGS

### Descripción General

**Nombre Completo**: `SBOX_SBOXMERCH.DIM_PENDINGS`

**Propósito**: Almacena todos los pendings (puntos de awareness en la home del seller) enviados a usuarios de Mercado Pago.

**Dueño**: SBOX_SBOXMERCH (Sandbox Merchant Team)

**Actualización**: Tiempo real (latencia < 5 minutos)

**Volumen**: ~1M-2M filas por mes (todos los tipos de notificaciones)

---

### Schema de la Tabla

| Campo | Tipo | Null | Descripción | Ejemplo |
|-------|------|------|-------------|---------|
| `id` | STRING | No | ID único de la notificación | `pending-12345678` |
| `content_id` | STRING | No | Tipo de notificación | `mp.sellers.generic_pendings.das_payment_pendings` |
| `user_id` | INT64 | No | ID del seller | `987654321` |
| `status` | STRING | No | Estado de la notificación | `created`, `deleted` |
| `substatus` | STRING | Sí | Detalle de cómo se cerró | `success`, `dismiss`, `success_web` |
| `criticality` | STRING | Sí | Nivel de urgencia | `HIGH`, `MEDIUM`, `LOW` |
| `created_at` | TIMESTAMP | No | Cuándo se envió la notificación | `2026-01-10 09:00:00 UTC` |
| `deleted_at` | TIMESTAMP | Sí | Cuándo se cerró/resolvió | `2026-01-18 15:30:00 UTC` |
| `payload` | STRING (JSON) | Sí | Datos adicionales de la notificación | `{"amount": "3250.75", "due_date": "2026-01-20"}` |
| `platform` | STRING | Sí | Dónde se mostró | `android`, `ios`, `web` |
| `country` | STRING | No | País del usuario | `BR` |

---

### Valores Posibles

#### content_id (Tipos de Notificaciones)

**Para DAS (lo que usamos)**:
```
mp.sellers.generic_pendings.das_payment_pendings
```

**Otros tipos** (no relevantes para nuestro dashboard):
- `mp.sellers.generic_pendings.payment_reminder`
- `mp.sellers.generic_pendings.kyc_verification`
- `mp.sellers.generic_pendings.dispute_action`

#### status

| Valor | Significado | Cuándo |
|-------|-------------|--------|
| `created` | Notificación enviada y visible | Al crear la notificación |
| `deleted` | Notificación cerrada/resuelta | Usuario interactúa o expira |

#### substatus (solo cuando status = 'deleted')

| Valor | Significado | Interpretación |
|-------|-------------|----------------|
| `success` | Acción completada | Seller pagó el DAS (mejor caso) |
| `success_web` | Completada desde web | Seller pagó desde web (vs app) |
| `dismiss` | Descartada sin acción | Seller ignoró/cerró notificación |
| `expired` | Expirada automáticamente | Sistema cerró por timeout |

#### criticality

| Valor | Condición | Ejemplo |
|-------|-----------|---------|
| `HIGH` | Vence en 1-3 días | DAS vence el 20, hoy es 18 |
| `MEDIUM` | Vence en 4-10 días | DAS vence el 20, hoy es 12 |
| `LOW` | Vence en >10 días | DAS vence el 20, hoy es 8 |

---

### Filtros Importantes

#### Solo Notificaciones DAS

```sql
WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
```

#### Solo Brasil

```sql
WHERE country = 'BR'
```

#### Solo Enviadas

```sql
WHERE status = 'created'
```

#### Solo Cerradas con Éxito

```sql
WHERE status = 'deleted'
  AND substatus IN ('success', 'success_web')
```

---

### Ejemplo de Datos

```sql
-- Notificación enviada
{
  "id": "pending-abc123",
  "content_id": "mp.sellers.generic_pendings.das_payment_pendings",
  "user_id": 987654321,
  "status": "created",
  "substatus": null,
  "criticality": "MEDIUM",
  "created_at": "2026-01-10 09:00:00 UTC",
  "deleted_at": null,
  "payload": "{\"das_amount\": \"3250.75\", \"due_date\": \"2026-01-20\", \"tax_period\": \"2025-12\"}",
  "platform": "android",
  "country": "BR"
}

-- Misma notificación después de que seller pagó
{
  "id": "pending-abc123",
  "content_id": "mp.sellers.generic_pendings.das_payment_pendings",
  "user_id": 987654321,
  "status": "deleted",
  "substatus": "success",
  "criticality": "MEDIUM",
  "created_at": "2026-01-10 09:00:00 UTC",
  "deleted_at": "2026-01-18 15:30:00 UTC",
  "payload": "{\"das_amount\": \"3250.75\", \"due_date\": \"2026-01-20\", \"tax_period\": \"2025-12\"}",
  "platform": "android",
  "country": "BR"
}
```

---

## 🔗 Relaciones entre Tablas

### Cómo se Relacionan

```
┌─────────────────────────────────────┐
│    DIM_PENDINGS                     │
│  (Notificaciones)                   │
│                                     │
│  user_id = 987654321                │
│  created_at = '2026-01-10'          │
│  status = 'deleted'                 │
│  substatus = 'success'              │
└────────────────┬────────────────────┘
                 │
                 │ JOIN ON
                 │ CAST(user_id AS STRING) = CUS_CUST_ID
                 │ AND
                 │ EVENT_DATE >= DATE(created_at)
                 │
┌────────────────▼────────────────────┐
│    BT_MP_DAS_TAX_EVENTS             │
│  (Eventos Fiscales)                 │
│                                     │
│  CUS_CUST_ID = '987654321'          │
│  EVENT_TYPE = 'Payment'             │
│  EVENT_DATE = '2026-01-18'          │
│  AMOUNT = '3250.75'                 │
└─────────────────────────────────────┘
```

### Query de Join

```sql
SELECT
  p.user_id as seller_id,
  p.created_at as notif_sent,
  e.EVENT_DATE as payment_date,
  CAST(e.AMOUNT AS FLOAT64) as amount_paid,
  DATE_DIFF(e.EVENT_DATE, DATE(p.created_at), DAY) as days_to_pay
FROM `SBOX_SBOXMERCH.DIM_PENDINGS` p
INNER JOIN `WHOWNER.BT_MP_DAS_TAX_EVENTS` e
  ON CAST(p.user_id AS STRING) = e.CUS_CUST_ID
  AND e.EVENT_TYPE = 'Payment'
  AND e.EVENT_DATE >= DATE(p.created_at)  -- pago después de notificación
WHERE p.content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
  AND p.status = 'deleted'
  AND p.substatus IN ('success', 'success_web')
LIMIT 100;
```

---

## 📊 Queries de Ejemplo

### 1. Total de Emisiones y Pagos

```sql
SELECT
  EVENT_TYPE,
  COUNT(*) as total,
  COUNT(DISTINCT CUS_CUST_ID) as sellers_unicos
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_DATE >= '2025-12-01'
GROUP BY EVENT_TYPE;
```

**Resultado esperado**:
```
EVENT_TYPE         | total  | sellers_unicos
-------------------+--------+---------------
SERPRO-Emission    | 24,500 | 18,200
Payment            | 18,138 | 15,100
```

---

### 2. Notificaciones Enviadas vs Cerradas

```sql
SELECT
  status,
  substatus,
  COUNT(*) as total
FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
  AND created_at >= '2025-12-01'
GROUP BY status, substatus
ORDER BY total DESC;
```

---

### 3. Tasa de Conversión por Criticidad

```sql
WITH notifs AS (
  SELECT
    criticality,
    COUNT(*) as total_enviadas,
    COUNT(CASE WHEN substatus = 'success' THEN 1 END) as total_exito
  FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
  WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
    AND created_at >= '2025-12-01'
  GROUP BY criticality
)
SELECT
  criticality,
  total_enviadas,
  total_exito,
  ROUND(total_exito * 100.0 / total_enviadas, 2) as tasa_conversion_pct
FROM notifs
ORDER BY criticality;
```

---

### 4. Sellers con Emisión pero Sin Pago

```sql
WITH emisiones AS (
  SELECT DISTINCT CUS_CUST_ID
  FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
  WHERE EVENT_TYPE = 'SERPRO-Emission'
    AND YEAR = '2026'
    AND MONTH = '01'
),
pagos AS (
  SELECT DISTINCT CUS_CUST_ID
  FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
  WHERE EVENT_TYPE = 'Payment'
    AND YEAR = '2026'
    AND MONTH = '01'
)
SELECT
  e.CUS_CUST_ID as seller_id
FROM emisiones e
LEFT JOIN pagos p ON e.CUS_CUST_ID = p.CUS_CUST_ID
WHERE p.CUS_CUST_ID IS NULL
LIMIT 1000;
```

---

## ⚠️ Consideraciones Técnicas

### Performance

#### ✅ Buenas Prácticas

1. **Siempre filtrar por fecha**:
```sql
WHERE EVENT_DATE >= '2025-12-01'  -- usa partición
```

2. **Limitar resultados**:
```sql
LIMIT 10000  -- especialmente en queries exploratorias
```

3. **Usar columnas específicas**:
```sql
SELECT EVENT_TYPE, CUS_CUST_ID  -- NO usar SELECT *
```

4. **Aprovechar clustering**:
```sql
WHERE EVENT_TYPE = 'Payment'  -- filtra primero por columna clustered
  AND CUS_CUST_ID = '123456'
```

#### ❌ Anti-Patrones

1. **Evitar scans completos**:
```sql
-- ❌ Muy lento (scan completo)
SELECT * FROM BT_MP_DAS_TAX_EVENTS

-- ✅ Rápido (usa partición)
SELECT * FROM BT_MP_DAS_TAX_EVENTS
WHERE EVENT_DATE >= CURRENT_DATE() - 30
```

2. **Cuidado con JOINs grandes**:
```sql
-- ❌ Muy costoso
SELECT *
FROM BT_MP_DAS_TAX_EVENTS e
JOIN DIM_PENDINGS p ON CAST(p.user_id AS STRING) = e.CUS_CUST_ID

-- ✅ Mejor (filtrar primero)
SELECT *
FROM (
  SELECT * FROM BT_MP_DAS_TAX_EVENTS
  WHERE EVENT_DATE >= '2025-12-01'
) e
JOIN (
  SELECT * FROM DIM_PENDINGS
  WHERE created_at >= '2025-12-01'
    AND content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
) p ON CAST(p.user_id AS STRING) = e.CUS_CUST_ID
```

---

### Costos

**BigQuery cobra por**:
- Bytes procesados (queries)
- Storage usado

**Tips para reducir costos**:
1. Usar `LIMIT` en queries exploratorias
2. Filtrar por fecha siempre (reduce bytes escaneados)
3. Evitar `SELECT *`
4. Cachear resultados cuando sea posible

**Estimación de costos**:
```sql
-- Query típica procesa ~100MB
-- Costo: $0.005 por GB = ~$0.0005 por query
-- 1000 queries/día = ~$0.50/día = ~$15/mes
```

---

### Calidad de Datos

#### Problemas Conocidos

1. **Valores NULL en AMOUNT**
   - ~0.1% de registros tienen AMOUNT NULL
   - Filtrar con `WHERE AMOUNT IS NOT NULL`

2. **YEAR/MONTH como STRING**
   - Siempre usar CAST para comparaciones numéricas
   - `CAST(YEAR AS INT64) > 2025`

3. **Duplicados en Pendings**
   - Mismo user_id puede tener múltiples notificaciones
   - Usar `DISTINCT` o `GROUP BY` cuando sea necesario

4. **Timezone en TIMESTAMPS**
   - Todos los timestamps están en UTC
   - Convertir a America/Sao_Paulo si es necesario:
   ```sql
   DATETIME(created_at, 'America/Sao_Paulo')
   ```

---

## 📚 Referencias

- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)
- [Standard SQL Reference](https://cloud.google.com/bigquery/docs/reference/standard-sql)
- [QUERIES_DASHBOARD.md](QUERIES_DASHBOARD.md) - Queries usadas en el dashboard
- [KPIS_PRINCIPALES.md](KPIS_PRINCIPALES.md) - Métricas calculadas

---

**Última actualización**: 2026-02-11
**Versión**: 1.0
**Owner**: william.oviedoaliste@mercadolibre.cl
