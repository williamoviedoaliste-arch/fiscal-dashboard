# 📈 KPIs Principales - Dashboard Fiscal DAS

**Métricas calculables del dashboard con queries SQL**

---

## 📖 Índice

1. [KPIs Disponibles en el Dashboard](#kpis-disponibles-en-el-dashboard)
2. [Vista General](#vista-general)
3. [Vista Mensual](#vista-mensual)
4. [Vista Uso de Pendings](#vista-uso-de-pendings)
5. [Cómo se Calculan](#cómo-se-calculan)
6. [Interpretación de Datos Reales](#interpretación-de-datos-reales)

---

## 📊 KPIs Disponibles en el Dashboard

### Mapa de Métricas por Vista

```
┌─────────────────────────────────────────────────────────┐
│              FISCAL DASHBOARD - KPIS REALES             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 Vista General                                       │
│     ├─ Emisiones Totales (por mes)                     │
│     ├─ Pagos Totales (por mes)                         │
│     ├─ Tasa de Conversión (%)                          │
│     ├─ Sellers Únicos con Emisión                      │
│     ├─ Sellers Únicos con Pago                         │
│     ├─ Volumen Pagado (BRL)                            │
│     ├─ Sellers Nuevos                                  │
│     └─ Sellers Recurrentes                             │
│                                                         │
│  📅 Vista Mensual (Período Específico)                 │
│     ├─ Todas las métricas de Vista General             │
│     ├─ Comparación vs Período Anterior                 │
│     └─ Delta Porcentual de Cambio                      │
│                                                         │
│  🔔 Vista Uso de Pendings (desde 12/2025)              │
│     ├─ Total Pendings Creados                          │
│     ├─ Pagos Totales Tax                               │
│     ├─ Pagos desde Pending                             │
│     ├─ Tasa Conversión de Pendings (%)                 │
│     ├─ Sellers Únicos Notificados                      │
│     ├─ Sellers que Pagaron desde Pending               │
│     ├─ Pendings por Criticidad (HIGH/MEDIUM/LOW)       │
│     └─ Comparación Notificados vs No Notificados       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Vista General

### KPI 1: Emisiones Totales

**Query**: `/api/metrics/monthly`

**Cálculo SQL**:
```sql
SELECT
    MONTH,
    YEAR,
    COUNT(*) as total_emisiones
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'SERPRO-Emission'
    AND EVENT_DATE IS NOT NULL
GROUP BY MONTH, YEAR
```

**Qué mide**: Documentos fiscales DAS generados por SERPRO por mes.

**Dato real (ejemplo Dashboard)**:
- Enero 2026: 5,200 emisiones

**Interpretación**:
- Representa el volumen de actividad comercial de sellers con obligación fiscal
- Sirve como numerador base para calcular tasas de conversión

---

### KPI 2: Pagos Totales

**Query**: `/api/metrics/monthly`

**Cálculo SQL**:
```sql
SELECT
    MONTH,
    YEAR,
    COUNT(*) as total_pagos
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'Payment'
    AND EVENT_DATE IS NOT NULL
GROUP BY MONTH, YEAR
```

**Qué mide**: Pagos fiscales DAS efectivamente realizados por sellers.

**Dato real (ejemplo Dashboard)**:
- Enero 2026: 3,950 pagos

**Interpretación**:
- Indica cuántos sellers cumplieron con su obligación fiscal
- Se compara con emisiones para calcular compliance

---

### KPI 3: Tasa de Conversión (Emisión → Pago)

**Query**: `/api/metrics/monthly`

**Cálculo SQL**:
```sql
SELECT
    ROUND(
        COUNT(CASE WHEN EVENT_TYPE = 'Payment' THEN 1 END) * 100.0 /
        NULLIF(COUNT(CASE WHEN EVENT_TYPE = 'SERPRO-Emission' THEN 1 END), 0),
    2) as tasa_conversion
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_DATE >= '{start_date}'
```

**Fórmula**: `(Pagos Totales / Emisiones Totales) × 100`

**Qué mide**: Porcentaje de emisiones fiscales que resultan en pago efectivo.

**Dato real (ejemplo Dashboard)**:
- Enero 2026: 75.96%

**Interpretación**:
- Refleja el nivel de compliance fiscal de los sellers
- Variaciones pueden indicar cambios en comportamiento o barreras de pago

---

### KPI 4: Sellers Únicos con Emisión

**Query**: `/api/metrics/monthly`

**Cálculo SQL**:
```sql
SELECT
    COUNT(DISTINCT CUS_CUST_ID) as sellers_emisiones
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'SERPRO-Emission'
    AND EVENT_DATE IS NOT NULL
    AND YEAR = '{year}'
    AND MONTH = '{month}'
```

**Qué mide**: Cantidad de sellers distintos con emisión fiscal en el período.

**Dato real (ejemplo Dashboard)**:
- Enero 2026: 4,100 sellers

---

### KPI 5: Sellers Únicos con Pago

**Query**: `/api/metrics/monthly`

**Cálculo SQL**:
```sql
SELECT
    COUNT(DISTINCT CUS_CUST_ID) as sellers_pagos
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'Payment'
    AND EVENT_DATE IS NOT NULL
    AND YEAR = '{year}'
    AND MONTH = '{month}'
```

**Qué mide**: Cantidad de sellers distintos que pagaron impuestos en el período.

**Dato real (ejemplo Dashboard)**:
- Enero 2026: 3,200 sellers

---

### KPI 6: Volumen Pagado (BRL)

**Query**: `/api/metrics/monthly`

**Cálculo SQL**:
```sql
SELECT
    SUM(CAST(AMOUNT AS FLOAT64)) as volumen_pagos
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'Payment'
    AND EVENT_DATE IS NOT NULL
    AND YEAR = '{year}'
    AND MONTH = '{month}'
```

**Qué mide**: Suma total en reales brasileños de impuestos pagados.

**Dato real (ejemplo Dashboard)**:
- Enero 2026: R$ 9,800,000.25

**Métrica Derivada**:
```python
Ticket Promedio = Volumen Total / Pagos Totales
# Ejemplo: R$ 9,800,000 / 3,950 = R$ 2,480 por pago
```

---

### KPI 7: Sellers Nuevos

**Query**: `/api/metrics/sellers`

**Cálculo SQL**: Ver [QUERIES_DASHBOARD.md](QUERIES_DASHBOARD.md) - `/api/metrics/sellers`

**Qué mide**: Sellers que pagan impuestos por primera vez.

**Dato real (ejemplo Dashboard)**:
- Enero 2026: 850 sellers nuevos

---

### KPI 8: Sellers Recurrentes

**Query**: `/api/metrics/sellers`

**Cálculo SQL**: Ver [QUERIES_DASHBOARD.md](QUERIES_DASHBOARD.md) - `/api/metrics/sellers`

**Qué mide**: Sellers que ya habían pagado en meses anteriores.

**Dato real (ejemplo Dashboard)**:
- Enero 2026: 2,350 sellers recurrentes

**Distribución Real**:
```
Nuevos: 850 (26.6%)
Recurrentes: 2,350 (73.4%)
Total: 3,200 sellers
```

---

## 📅 Vista Mensual

### KPI 9: Comparación Período Anterior

**Query**: `/api/metrics/month/<periodo>`

**Qué incluye**:
- Todas las métricas de Vista General para el mes seleccionado
- Mismas métricas para el mes anterior
- Delta absoluto entre períodos
- Delta porcentual

**Datos Reales (ejemplo Dashboard - Enero 2026 vs Diciembre 2025)**:

| Métrica | Enero 2026 | Dic 2025 | Delta | Delta % |
|---------|------------|----------|-------|---------|
| Emisiones | 5,200 | 5,100 | +100 | +1.96% |
| Pagos | 3,950 | 3,800 | +150 | +3.95% |
| Sellers Pagos | 3,200 | 3,100 | +100 | +3.23% |
| Volumen | R$ 9.8M | R$ 9.2M | +R$ 600K | +6.52% |
| Conversión | 75.96% | 74.51% | +1.45 pp | +1.95% |

**Interpretación**:
- Permite identificar tendencias mes a mes
- Detecta cambios significativos en comportamiento

---

## 🔔 Vista Uso de Pendings

**⚠️ IMPORTANTE**: Todos los KPIs de esta vista filtran pagos donde `YEAR/MONTH >= 12/2025`

### KPI 10: Total Pendings Creados

**Query**: `/api/pendings/summary`

**Cálculo SQL**:
```sql
SELECT COUNT(*) as total_enviadas
FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
    AND created_at >= '2025-12-01'
```

**Qué mide**: Cantidad de pendings de pago DAS creados en el sistema.

**Dato Real (Dashboard actual)**:
- Total: 196,535 pendings

---

### KPI 11: Pagos Totales Tax (desde 12/2025)

**Query**: `/api/pendings/summary`

**Cálculo SQL**:
```sql
SELECT COUNT(*) as total_pagos_reales
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'Payment'
    AND EVENT_DATE IS NOT NULL
    AND (CAST(YEAR AS INT64) > 2025
         OR (CAST(YEAR AS INT64) = 2025 AND CAST(MONTH AS INT64) >= 12))
```

**Qué mide**: Total de pagos fiscales realizados desde diciembre 2025.

**Dato Real (Dashboard actual)**:
- Total: 18,138 pagos

---

### KPI 12: Pagos desde Pending

**Query**: `/api/pendings/summary`

**Cálculo SQL**: Ver [QUERIES_DASHBOARD.md](QUERIES_DASHBOARD.md) - `/api/pendings/summary`

**Qué mide**: Pagos realizados después de que se creó un pending para ese seller.

**Dato Real (Dashboard actual)**:
- Total: 12,027 pagos desde pending

**Nota**: Este KPI correlaciona temporalmente pendings con pagos (pago ocurre después de pending).

---

### KPI 13: Tasa de Conversión de Pendings

**Query**: `/api/pendings/summary`

**Fórmula**: `(Pagos desde Pending / Pagos Totales Tax) × 100`

**Cálculo**:
```
12,027 / 18,138 × 100 = 66.31%
```

**Qué mide**: Porcentaje de pagos totales que ocurrieron después de crear un pending.

**Dato Real (Dashboard actual)**:
- Tasa: 66.31%

**Interpretación**:
- 66.31% de los pagos fiscales desde 12/2025 ocurrieron después de crear un pending
- No implica causalidad directa (correlación temporal)
- Indica que la mayoría de pagos tienen un pending asociado previo

---

### KPI 14: Sellers Únicos Notificados

**Query**: `/api/pendings/summary`

**Cálculo SQL**:
```sql
SELECT COUNT(DISTINCT user_id) as sellers_notificados
FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
    AND created_at >= '2025-12-01'
```

**Qué mide**: Cantidad de sellers distintos que recibieron al menos un pending.

**Dato Real (Dashboard actual)**:
- Total: 85,200 sellers

---

### KPI 15: Sellers que Pagaron desde Pending

**Query**: `/api/pendings/summary`

**Qué mide**: Sellers que pagaron después de crearse un pending.

**Dato Real (Dashboard actual)**:
- Total: 10,500 sellers

---

### KPI 16: Pendings por Criticidad

**Query**: `/api/pendings/monthly`

**Cálculo SQL**:
```sql
SELECT
    criticality,
    COUNT(*) as total_enviadas
FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
    AND created_at >= '2025-12-01'
GROUP BY criticality
```

**Qué mide**: Distribución de pendings según nivel de urgencia.

**Niveles de Criticidad**:
- **HIGH**: Alta urgencia
- **MEDIUM**: Media urgencia
- **LOW**: Baja urgencia

**Uso**: Analizar si el nivel de criticidad correlaciona con tasa de conversión.

---

### KPI 17: Comparación Notificados vs No Notificados

**Query**: `/api/pendings/comparison`

**Cálculo SQL**: Ver [QUERIES_DASHBOARD.md](QUERIES_DASHBOARD.md) - `/api/pendings/comparison`

**Qué mide**: Diferencias en comportamiento de pago entre sellers con pending vs sin pending.

**Datos Reales (Dashboard actual)**:

| Grupo | Sellers | Total Pagos | Promedio Pagos/Seller |
|-------|---------|-------------|-----------------------|
| Con Pending | 10,500 | 12,027 | 1.15 |
| Sin Pending | 4,600 | 6,111 | 1.33 |

**Interpretación**:
- Sellers sin pending pagan ligeramente más veces en promedio
- Posible sesgo: sellers sin pending pueden ser más proactivos

---

## 🔍 Cómo se Calculan

### Proceso de Cálculo en el Dashboard

1. **Frontend hace request** a endpoint del backend
   ```javascript
   axios.get(`${API_URL}/api/pendings/summary`)
   ```

2. **Backend ejecuta query** en BigQuery
   ```python
   query_job = client.query(query_sql)
   results = query_job.result()
   ```

3. **Dashboard renderiza** los datos
   ```javascript
   <div>Tasa Conversión: {data.tasa_conversion_pagos}%</div>
   ```

### Dónde Ver el Código

- **Queries SQL completas**: [QUERIES_DASHBOARD.md](QUERIES_DASHBOARD.md)
- **Endpoints del backend**: `backend/app.py`
- **Componentes del frontend**: `frontend/src/components/`

---

## 📊 Interpretación de Datos Reales

### Funnel de Conversión Real (Vista Pendings)

```
Pendings Creados
    196,535
       ↓
Pagos Totales Tax (12/2025+)
    18,138 (9.23% del total de pendings)
       ↓
Pagos desde Pending
    12,027 (66.31% de pagos totales)
```

**Lectura del Funnel**:
1. Se crearon 196K pendings
2. De todos los pagos fiscales desde 12/2025, hubo 18K
3. De esos 18K pagos, 12K (66%) ocurrieron después de crear un pending

**Limitaciones**:
- No prueba causalidad (pending → pago)
- Es correlación temporal (pending creado antes del pago)
- Sellers podrían haber pagado sin ver el pending

---

### Distribución Sellers Nuevos vs Recurrentes

**Dato Real**:
```
Sellers Nuevos:      850 (26.6%)
Sellers Recurrentes: 2,350 (73.4%)
Total:               3,200 (100%)
```

**Interpretación**:
- Mayoría de sellers ya habían pagado impuestos antes
- Indica retención de base activa
- ~1 de cada 4 sellers es nuevo (primera vez pagando)

---

### Volumen Promedio por Seller

**Cálculo con Datos Reales**:
```python
Volumen Total: R$ 9,800,000
Sellers con Pago: 3,200
Promedio = R$ 9,800,000 / 3,200 = R$ 3,062.50 por seller
```

**Cálculo por Pago**:
```python
Volumen Total: R$ 9,800,000
Pagos Totales: 3,950
Promedio = R$ 9,800,000 / 3,950 = R$ 2,480.38 por pago
```

**Interpretación**:
- Algunos sellers pagan más de un DAS en el mismo mes
- Promedio por seller (R$ 3,062) > Promedio por pago (R$ 2,480)
- Ratio: 3,950 pagos / 3,200 sellers = 1.23 pagos por seller

---

### Cambio Mensual Real

**Ejemplo con Datos Reales (Enero 2026 vs Diciembre 2025)**:

```python
# Pagos
Delta Absoluto: 3,950 - 3,800 = +150 pagos
Delta Porcentual: (150 / 3,800) × 100 = +3.95%

# Volumen
Delta Absoluto: R$ 9.8M - R$ 9.2M = +R$ 600K
Delta Porcentual: (600K / 9.2M) × 100 = +6.52%

# Conversión
Delta Absoluto: 75.96% - 74.51% = +1.45 puntos porcentuales
Delta Porcentual: (1.45 / 74.51) × 100 = +1.95%
```

**Interpretación**:
- Volumen creció más (+6.52%) que cantidad de pagos (+3.95%)
- Indica que el monto promedio por pago aumentó
- Conversión mejoró ligeramente (+1.45 pp)

---

## 📚 Referencias

### Documentación Relacionada
- [GUIA_DAS_BRASIL.md](GUIA_DAS_BRASIL.md) - Contexto de negocio
- [DICCIONARIO_TABLAS.md](DICCIONARIO_TABLAS.md) - Estructura de datos
- [QUERIES_DASHBOARD.md](QUERIES_DASHBOARD.md) - Todas las queries SQL

### Código Fuente
- **Backend**: `backend/app.py` (líneas 40-880)
- **Frontend General**: `frontend/src/components/GeneralTab.jsx`
- **Frontend Mensual**: `frontend/src/components/MonthlyTab.jsx`
- **Frontend Pendings**: `frontend/src/components/PendingsTab.jsx`

---

## 📝 Notas Importantes

### Filtro Temporal en Vista Pendings

**⚠️ CRÍTICO**: Todos los KPIs de "Uso de Pendings" solo incluyen pagos donde:
```sql
CAST(YEAR AS INT64) > 2025
OR (CAST(YEAR AS INT64) = 2025 AND CAST(MONTH AS INT64) >= 12)
```

**Razón**: Sistema de pendings se lanzó en diciembre 2025.

**Implicación**: No comparar KPIs de Pendings con datos anteriores a 12/2025.

---

### Diferencia: Correlación vs Causalidad

**KPI: "Tasa de Conversión de Pendings" (66.31%)**

**Lo que significa**:
- 66.31% de los pagos ocurrieron después de crear un pending

**Lo que NO significa**:
- ❌ 66.31% de los pagos fueron causados por el pending
- ❌ Sin pending, solo 33.69% habrían pagado

**Por qué**:
- Es correlación temporal, no causalidad probada
- Para probar causalidad necesitaríamos A/B test con grupo control

**Sin embargo**:
- El timing cercano (pending → pago en pocos días)
- El alto porcentaje (66%)
- Sugieren que pendings tienen impacto positivo

---

### Tipos de Datos en BigQuery

**⚠️ IMPORTANTE**: `YEAR`, `MONTH`, `AMOUNT` son STRING, no numéricos.

**Siempre usar CAST**:
```sql
-- ❌ Incorrecto
WHERE YEAR > 2025

-- ✅ Correcto
WHERE CAST(YEAR AS INT64) > 2025
```

Ver detalles en [DICCIONARIO_TABLAS.md](DICCIONARIO_TABLAS.md)

---

**Última actualización**: 2026-02-11
**Versión**: 2.0 (Solo KPIs Reales)
**Owner**: william.oviedoaliste@mercadolibre.cl
