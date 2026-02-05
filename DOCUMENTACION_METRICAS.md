# 📊 Documentación Técnica del Dashboard de Métricas Fiscales

Este documento explica en detalle cada pantalla del dashboard, las métricas que muestra, y las fórmulas de cálculo utilizadas.

---

## 📋 Tabla de Contenidos

1. [Conceptos Base](#conceptos-base)
2. [Pestaña General](#pestaña-general)
3. [Pestaña Mensual](#pestaña-mensual)
4. [Pestaña Next Steps](#pestaña-next-steps)
5. [Glosario de Términos](#glosario-de-términos)

---

## Conceptos Base

### Estructura de Datos

La tabla `WHOWNER.BT_MP_DAS_TAX_EVENTS` contiene eventos fiscales con los siguientes campos clave:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `EVENT_TYPE` | Tipo de evento | `SERPRO-Emission`, `Payment` |
| `EVENT_DATE` | Fecha en que ocurrió el evento | `2026-01-15` |
| `YEAR` / `MONTH` | Período fiscal al que corresponde | `2025` / `12` |
| `CUS_CUST_ID` | ID único del seller | `123456789` |
| `SERPRO_STATUS` | Estado de la emisión | `success`, `error`, `already_paid` |
| `TOTAL_AMOUNT` | Monto del pago | `1500.50` |

### Diferencia Clave: EVENT_DATE vs YEAR/MONTH

**EVENT_DATE**: Cuándo el seller ejecutó la acción
- Ejemplo: El 15 de enero de 2026, el seller emitió su factura

**YEAR/MONTH**: Período fiscal al que corresponde esa acción
- Ejemplo: La factura emitida el 15/01/2026 es del período fiscal 12/2025 (Diciembre 2025)

**Caso Real Ilustrativo:**
```
Seller ID: 12345
├─ 05/01/2026 (EVENT_DATE) → Emitió período fiscal 12/2025
├─ 05/01/2026 (EVENT_DATE) → Emitió período fiscal 11/2025
├─ 10/01/2026 (EVENT_DATE) → Pagó período fiscal 12/2025
└─ 15/01/2026 (EVENT_DATE) → Pagó período fiscal 11/2025
```

### Tipos de Eventos Considerados

**Emisiones (SERPRO-Emission):**
- `success`: Emisión exitosa
- `error`: Error en la emisión
- `already_paid`: Período ya pagado previamente

**Pagos (Payment):**
- Se registra cuando el seller completa el pago del período fiscal

**Nota**: Los eventos `FTU` (First Time User) NO se consideran en el análisis. El funnel siempre es: **Emisión → Pago**

---

## Pestaña General

### Objetivo
Proporcionar una vista ejecutiva del producto con métricas agregadas de todo el período (Agosto 2025 - Febrero 2026).

### Secciones

#### 1. Resumen Ejecutivo

Tres tarjetas principales en la parte superior:

**📈 Total Emisiones**
```sql
SELECT COUNT(*) as total_emisiones
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'SERPRO-Emission'
  AND SERPRO_STATUS = 'success'
```
- **Qué muestra**: Cantidad total de emisiones exitosas en todo el período
- **Interpretación**: Representa el volumen total de facturas emitidas por el sistema

**💳 Total Pagos**
```sql
SELECT COUNT(*) as total_pagos
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'Payment'
```
- **Qué muestra**: Cantidad total de pagos procesados
- **Interpretación**: Cuántas facturas fiscales se pagaron efectivamente

**💰 Volumen Total**
```sql
SELECT ROUND(SUM(TOTAL_AMOUNT), 2) as volumen_total
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'Payment'
```
- **Qué muestra**: Suma monetaria de todos los pagos (en BRL)
- **Interpretación**: Total de dinero procesado por el sistema de pagos fiscales

---

#### 2. Gráfico: Evolución de Emisiones

**Visualización**: Gráfico de líneas
**Datos mostrados**:
- **Línea azul sólida**: Cantidad de emisiones por mes
- **Línea azul punteada**: Cantidad de sellers únicos que emitieron

**Consulta SQL Base**:
```sql
SELECT
  FORMAT_DATE('%Y-%m', EVENT_DATE) as periodo,
  COUNT(*) as cantidad_emisiones,
  COUNT(DISTINCT CUS_CUST_ID) as sellers_unicos
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'SERPRO-Emission'
  AND SERPRO_STATUS = 'success'
GROUP BY periodo
ORDER BY periodo
```

**Métricas adicionales**:
- **Mes con más emisiones**: Identifica el pico
- **Total de sellers que emitieron**: `COUNT(DISTINCT CUS_CUST_ID)`

**Interpretación**:
- Tendencia ascendente = Crecimiento del producto
- Diferencia entre cantidad y sellers = Sellers que emiten múltiples períodos

---

#### 3. Gráfico: Evolución de Pagos

**Visualización**: Gráfico de líneas
**Datos mostrados**:
- **Línea verde sólida**: Cantidad de pagos por mes
- **Línea verde punteada**: Cantidad de sellers únicos que pagaron

**Consulta SQL Base**:
```sql
SELECT
  FORMAT_DATE('%Y-%m', EVENT_DATE) as periodo,
  COUNT(*) as cantidad_pagos,
  COUNT(DISTINCT CUS_CUST_ID) as sellers_unicos,
  ROUND(SUM(TOTAL_AMOUNT), 2) as volumen
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'Payment'
GROUP BY periodo
ORDER BY periodo
```

**Interpretación**:
- Si pagos < emisiones: Existe una brecha de conversión (morosidad)
- Volumen procesado: Indica la salud financiera del producto

---

#### 4. Métricas de Sellers

**A. Sellers Nuevos vs Recurrentes**

**Definiciones**:
- **Seller Nuevo**: Primera vez que aparece en el sistema (primera emisión o pago)
- **Seller Recurrente**: Ya había tenido actividad en meses anteriores

**Consulta SQL**:
```sql
WITH seller_first_month AS (
  SELECT
    CUS_CUST_ID,
    FORMAT_DATE('%Y-%m', MIN(EVENT_DATE)) as primer_mes
  FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
  WHERE EVENT_TYPE IN ('SERPRO-Emission', 'Payment')
  GROUP BY CUS_CUST_ID
),
monthly_activity AS (
  SELECT
    FORMAT_DATE('%Y-%m', EVENT_DATE) as periodo,
    e.CUS_CUST_ID,
    s.primer_mes
  FROM WHOWNER.BT_MP_DAS_TAX_EVENTS e
  INNER JOIN seller_first_month s ON e.CUS_CUST_ID = s.CUS_CUST_ID
  WHERE EVENT_TYPE IN ('SERPRO-Emission', 'Payment')
  GROUP BY periodo, e.CUS_CUST_ID, s.primer_mes
)
SELECT
  periodo,
  COUNT(DISTINCT CASE WHEN periodo = primer_mes THEN CUS_CUST_ID END) as nuevos,
  COUNT(DISTINCT CASE WHEN periodo != primer_mes THEN CUS_CUST_ID END) as recurrentes
FROM monthly_activity
GROUP BY periodo
ORDER BY periodo
```

**Visualización**: Gráfico de área apilada
- **Área azul**: Sellers nuevos
- **Área verde**: Sellers recurrentes

**Interpretación**:
- % de nuevos alto = Fuerte adquisición
- % de recurrentes creciente = Buena retención

---

**B. Tasas de Conversión**

**Tasa de Conversión de Eventos**:
```
Tasa Conversión Eventos (%) = (Total Pagos / Total Emisiones) × 100
```

**Ejemplo**:
- Emisiones: 100,000
- Pagos: 45,000
- Tasa: (45,000 / 100,000) × 100 = 45%

**Tasa de Conversión de Sellers**:
```
Tasa Conversión Sellers (%) = (Sellers que Pagan / Sellers que Emiten) × 100
```

**Consulta SQL**:
```sql
SELECT
  FORMAT_DATE('%Y-%m', EVENT_DATE) as periodo,
  COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'SERPRO-Emission' THEN CUS_CUST_ID END) as sellers_emiten,
  COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'Payment' THEN CUS_CUST_ID END) as sellers_pagan
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE IN ('SERPRO-Emission', 'Payment')
GROUP BY periodo
```

Luego en el frontend:
```javascript
const tasaConversionEventos = (pagos / emisiones) * 100;
const tasaConversionSellers = (sellersPagan / sellersEmiten) * 100;
```

**Interpretación**:
- Tasa < 50%: Problema de morosidad o abandono
- Tasa > 80%: Excelente conversión
- Tendencia descendente: Requiere acción inmediata

---

#### 5. Volumen Monetario

**Visualización**: Gráfico de área
**Datos mostrados**: Evolución del volumen total procesado mensualmente

**Consulta SQL**:
```sql
SELECT
  FORMAT_DATE('%Y-%m', EVENT_DATE) as periodo,
  ROUND(SUM(TOTAL_AMOUNT), 2) as volumen
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'Payment'
GROUP BY periodo
ORDER BY periodo
```

**Métricas clave**:
- **Total del período**: Suma de todos los meses
- **Ticket promedio**: `Volumen Total / Total Pagos`

**Interpretación**:
- Crecimiento sostenido = Producto saludable
- Caídas abruptas = Investigar causas (estacionalidad, bugs, etc.)

---

## Pestaña Mensual

### Objetivo
Análisis detallado de un mes específico con capacidad de filtrado dual (fecha de evento vs período fiscal).

### Filtros Disponibles

#### 1. Selector de Mes
Dropdown con todos los meses del período (2025-08 a 2026-02)

#### 2. Tipo de Filtro

**📅 Fecha de Evento (EVENT_DATE)**
- Filtra por el mes en que ocurrió la acción
- **Ejemplo**: Todas las emisiones y pagos ejecutados durante Enero 2026
- **Consulta SQL**:
```sql
WHERE FORMAT_DATE('%Y-%m', EVENT_DATE) = '2026-01'
```

**📋 Período Fiscal (YEAR/MONTH)**
- Filtra por el mes fiscal al que corresponde
- **Ejemplo**: Todas las emisiones y pagos del período fiscal Diciembre 2025 (sin importar cuándo se ejecutaron)
- **Consulta SQL**:
```sql
WHERE CONCAT(YEAR, '-', LPAD(MONTH, 2, '0')) = '2025-12'
```

---

### Métricas Mostradas

#### 1. Tarjetas Principales

**📈 Emisiones**

```sql
-- Con filtro de Fecha de Evento
SELECT
  COUNT(*) as cantidad_emisiones,
  COUNT(DISTINCT CUS_CUST_ID) as sellers_emitieron
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'SERPRO-Emission'
  AND SERPRO_STATUS = 'success'
  AND FORMAT_DATE('%Y-%m', EVENT_DATE) = '2026-01'

-- Con filtro de Período Fiscal
SELECT
  COUNT(*) as cantidad_emisiones,
  COUNT(DISTINCT CUS_CUST_ID) as sellers_emitieron
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'SERPRO-Emission'
  AND SERPRO_STATUS = 'success'
  AND CONCAT(YEAR, '-', LPAD(MONTH, 2, '0')) = '2025-12'
```

**Muestra**:
- Cantidad total de emisiones
- Número de sellers únicos que emitieron

---

**💳 Pagos**

```sql
SELECT
  COUNT(*) as cantidad_pagos,
  COUNT(DISTINCT CUS_CUST_ID) as sellers_pagaron
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'Payment'
  AND FORMAT_DATE('%Y-%m', EVENT_DATE) = '2026-01'  -- o filtro fiscal
```

**Muestra**:
- Cantidad total de pagos
- Número de sellers únicos que pagaron

---

**💰 Volumen**

```sql
SELECT
  ROUND(SUM(TOTAL_AMOUNT), 2) as volumen_total,
  ROUND(AVG(TOTAL_AMOUNT), 2) as ticket_promedio
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'Payment'
  AND FORMAT_DATE('%Y-%m', EVENT_DATE) = '2026-01'
```

**Fórmulas**:
- **Volumen Total**: `SUM(TOTAL_AMOUNT)`
- **Ticket Promedio**: `Volumen Total / Cantidad Pagos`

---

**🎯 Conversión**

**Fórmulas**:
```javascript
// Tasa de Conversión de Eventos
tasaEventos = (cantidad_pagos / cantidad_emisiones) × 100

// Tasa de Conversión de Sellers
tasaSellers = (sellers_pagaron / sellers_emitieron) × 100
```

**Ejemplo**:
- Emisiones: 25,000
- Pagos: 12,500
- Sellers emiten: 20,000
- Sellers pagan: 9,000

Resultados:
- Tasa de Conversión de Eventos: (12,500 / 25,000) × 100 = **50%**
- Tasa de Conversión de Sellers: (9,000 / 20,000) × 100 = **45%**

**Interpretación**:
- Tasa de eventos > tasa de sellers = Algunos sellers pagan múltiples períodos
- Tasa baja = Problema de morosidad o experiencia de usuario

---

#### 2. Estados de Emisión

Desglose de todas las emisiones por su estado:

**Consulta SQL**:
```sql
SELECT
  COUNTIF(SERPRO_STATUS = 'success') as exitosas,
  COUNTIF(SERPRO_STATUS = 'error') as errores,
  COUNTIF(SERPRO_STATUS = 'already_paid') as ya_pagadas
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'SERPRO-Emission'
  AND FORMAT_DATE('%Y-%m', EVENT_DATE) = '2026-01'
```

**Estados**:
- ✅ **Exitosas**: Emisiones con status `success`
- ❌ **Errores**: Emisiones con status `error` (problemas técnicos o de validación)
- 💚 **Ya Pagadas**: Emisiones con status `already_paid` (período ya fue pagado antes)

**Interpretación**:
- % de errores alto (>10%) = Problema técnico o de integración
- % de ya_pagadas alto = Sellers intentando pagar múltiples veces el mismo período

---

#### 3. Top Períodos Fiscales

**Solo disponible con filtro de Fecha de Evento**

Muestra los 10 períodos fiscales más emitidos durante ese mes.

**Consulta SQL**:
```sql
SELECT
  CONCAT(YEAR, '-', LPAD(MONTH, 2, '0')) as periodo_fiscal,
  COUNT(*) as emisiones,
  COUNT(DISTINCT CUS_CUST_ID) as sellers,
  ROUND(COUNT(*) * 100.0 / total_emisiones_mes, 2) as porcentaje
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE EVENT_TYPE = 'SERPRO-Emission'
  AND SERPRO_STATUS = 'success'
  AND FORMAT_DATE('%Y-%m', EVENT_DATE) = '2026-01'
  AND YEAR IS NOT NULL
  AND MONTH IS NOT NULL
GROUP BY periodo_fiscal
ORDER BY emisiones DESC
LIMIT 10
```

**Tabla muestra**:
- Período Fiscal (ej: 2025-12)
- Cantidad de Emisiones
- Cantidad de Sellers
- % del Total de emisiones del mes

**Ejemplo Real**:
```
Mes seleccionado: Enero 2026 (filtro por fecha de evento)

Período Fiscal | Emisiones | Sellers | % del Total
---------------|-----------|---------|------------
2025-12        | 52,341    | 18,234  | 45.2%
2025-11        | 28,751    | 9,871   | 24.8%
2026-01        | 15,234    | 12,456  | 13.1%
2025-10        | 10,123    | 3,234   | 8.7%
...
```

**Interpretación**:
- En Enero 2026, el 45.2% de las emisiones corresponden al período fiscal de Diciembre 2025
- Esto indica que los sellers emiten sus facturas principalmente en el mes siguiente al período fiscal
- Es común ver el mes anterior (M-1) con mayor porcentaje

---

#### 4. Información Adicional

**Fechas de Actividad**:
```sql
SELECT
  MIN(EVENT_DATE) as fecha_primera_actividad,
  MAX(EVENT_DATE) as fecha_ultima_actividad
FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
WHERE FORMAT_DATE('%Y-%m', EVENT_DATE) = '2026-01'
```

- **Primera actividad del mes**: Primer evento registrado
- **Última actividad del mes**: Último evento registrado

**Utilidad**: Verificar cobertura completa del mes y detectar posibles gaps de datos

---

## Pestaña Next Steps

### Objetivo
Proporcionar métricas estratégicas para tomar decisiones de producto, marketing y retención.

---

### 1. Análisis de Retención por Cohorte

#### ¿Qué es una Cohorte?

Una **cohorte** es un grupo de sellers que tuvieron su primera actividad (emisión o pago) en el mismo mes.

**Ejemplo**:
- **Cohorte Sep 2025**: Todos los sellers que usaron el producto por primera vez en Septiembre 2025

#### Consulta SQL Base

```sql
-- Paso 1: Identificar el primer mes de cada seller
WITH seller_first_month AS (
  SELECT
    CUS_CUST_ID,
    FORMAT_DATE('%Y-%m', MIN(EVENT_DATE)) as cohort_mes
  FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
  WHERE EVENT_TYPE IN ('SERPRO-Emission', 'Payment')
  GROUP BY CUS_CUST_ID
),

-- Paso 2: Calcular en qué meses posteriores tuvo actividad
monthly_activity AS (
  SELECT DISTINCT
    e.CUS_CUST_ID,
    FORMAT_DATE('%Y-%m', DATE_TRUNC(e.EVENT_DATE, MONTH)) as mes_actividad,
    c.cohort_mes,
    DATE_DIFF(
      DATE_TRUNC(e.EVENT_DATE, MONTH),
      DATE_TRUNC(PARSE_DATE('%Y-%m', c.cohort_mes), MONTH),
      MONTH
    ) as meses_desde_cohort
  FROM WHOWNER.BT_MP_DAS_TAX_EVENTS e
  INNER JOIN seller_first_month c ON e.CUS_CUST_ID = c.CUS_CUST_ID
  WHERE e.EVENT_TYPE IN ('SERPRO-Emission', 'Payment')
)

-- Paso 3: Contar sellers activos en cada mes relativo
SELECT
  cohort_mes,
  COUNT(DISTINCT CUS_CUST_ID) as sellers_cohort,
  COUNT(DISTINCT CASE WHEN meses_desde_cohort = 0 THEN CUS_CUST_ID END) as mes_0,
  COUNT(DISTINCT CASE WHEN meses_desde_cohort = 1 THEN CUS_CUST_ID END) as mes_1,
  COUNT(DISTINCT CASE WHEN meses_desde_cohort = 2 THEN CUS_CUST_ID END) as mes_2,
  COUNT(DISTINCT CASE WHEN meses_desde_cohort = 3 THEN CUS_CUST_ID END) as mes_3
FROM monthly_activity
GROUP BY cohort_mes
ORDER BY cohort_mes DESC
LIMIT 6
```

#### Cálculo de Retención

**Fórmula de Retención por Mes**:
```
Retención Mes N (%) = (Sellers activos en Mes N / Total sellers de la cohorte) × 100
```

**Ejemplo Real**:
```
Cohorte: Septiembre 2025
Total sellers en la cohorte: 23,185

Mes 0 (Septiembre 2025): 23,185 activos → 100% (baseline)
Mes 1 (Octubre 2025):     2,807 activos → 12.11%
Mes 2 (Noviembre 2025):   1,234 activos → 5.32%
Mes 3 (Diciembre 2025):     856 activos → 3.69%
```

**Procesamiento en Backend**:
```python
retention_mes_1 = round(row.mes_1 * 100.0 / row.sellers_cohort, 2)
retention_mes_2 = round(row.mes_2 * 100.0 / row.sellers_cohort, 2)
retention_mes_3 = round(row.mes_3 * 100.0 / row.sellers_cohort, 2)
```

#### Visualizaciones

**A. Gráfico de Líneas - Retención**
- **Eje X**: Meses desde la cohorte (0, 1, 2, 3)
- **Eje Y**: % de retención
- **Líneas**: Una línea por cohorte (últimos 6 meses)

**B. Tabla de Cohortes**
Detalle numérico:
```
Cohorte    | Sellers | Mes 0 | Mes 1  | Mes 2 | Mes 3
-----------|---------|-------|--------|-------|-------
2025-09    | 23,185  | 100%  | 12.11% | 5.32% | 3.69%
2025-10    | 19,876  | 100%  | 20.59% | 14.9% | 8.45%
2025-11    | 10,445  | 100%  | 15.36% | 7.23% | 0%
...
```

#### Interpretación

**Retención Mes 1 (Critical)**:
- **< 10%**: Muy baja - Problema grave de onboarding
- **10-20%**: Baja - Necesita mejoras urgentes
- **20-40%**: Normal para productos de uso puntual
- **> 40%**: Excelente

**Tendencias**:
- **Retención descendente gradual**: Normal (uso mensual)
- **Caída abrupta en Mes 1**: Problema de experiencia inicial
- **Repunte en meses posteriores**: Sellers regresan (posible estacionalidad)

**Acción Recomendada**:
💡 Enfocarse en mejorar la retención del Mes 1 con:
- Campañas de email/push para recordar uso
- Incentivos para segundo uso
- Mejoras en UX del primer flujo

---

### 2. Nivel de Engagement (Días Activos)

#### Definición

Mide cuántos días diferentes un seller ha estado activo (emitió o pagó) durante todo el período.

#### Consulta SQL

```sql
SELECT
  COUNTIF(dias_activos = 1) as sellers_1_dia,
  COUNTIF(dias_activos BETWEEN 2 AND 3) as sellers_2_3_dias,
  COUNTIF(dias_activos BETWEEN 4 AND 7) as sellers_4_7_dias,
  COUNTIF(dias_activos >= 8) as sellers_8_plus_dias
FROM (
  SELECT
    CUS_CUST_ID,
    COUNT(DISTINCT DATE(EVENT_DATE)) as dias_activos
  FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
  WHERE EVENT_TYPE IN ('SERPRO-Emission', 'Payment')
  GROUP BY CUS_CUST_ID
)
```

#### Categorías de Engagement

**Segmentación**:
- **1 día**: One-time users (probaron el servicio una vez)
- **2-3 días**: Casual users (uso esporádico)
- **4-7 días**: Regular users (uso frecuente)
- **8+ días**: Power users (muy engaged, usuarios activos)

#### Visualización

**Gráfico de Barras Horizontales**:
```
8+ días       ████                 1,007 sellers
4-7 días      ████████████         8,520 sellers
2-3 días      ████████████████     26,273 sellers
1 día         ████████████████████ 55,259 sellers
```

#### Interpretación

**Distribución Típica**:
- Mayoría en 1-3 días: Normal para producto de uso mensual
- Alto % en 8+ días: Indica sellers muy comprometidos

**Ejemplo de Cálculo**:
```
Total sellers: 91,059
- 1 día: 55,259 (60.7%)
- 2-3 días: 26,273 (28.9%)
- 4-7 días: 8,520 (9.4%)
- 8+ días: 1,007 (1.1%)
```

**Insights**:
- **60.7% usa 1 día**: Mayoría son one-time users → Problema de retención
- **1.1% usa 8+ días**: Estos son los power users → ¿Qué los motiva?

**Acción Recomendada**:
💡 **Estrategia de Power Users**:
1. Identificar características comunes de sellers con 8+ días
2. Crear programa de referidos o embajadores
3. Replicar sus patrones de uso en campañas para casuales

---

### 3. Distribución de Períodos Pendientes

#### Definición

Un **período pendiente** es un período fiscal que fue emitido pero no pagado.

**Morosidad**: Cantidad de períodos fiscales que un seller tiene emitidos sin pagar.

#### Consulta SQL

```sql
WITH emisiones AS (
  -- Períodos fiscales emitidos por cada seller
  SELECT
    CUS_CUST_ID,
    CONCAT(YEAR, '-', LPAD(MONTH, 2, '0')) as periodo_fiscal
  FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
  WHERE EVENT_TYPE = 'SERPRO-Emission'
    AND SERPRO_STATUS = 'success'
    AND YEAR IS NOT NULL
    AND MONTH IS NOT NULL
  GROUP BY CUS_CUST_ID, periodo_fiscal
),
pagos AS (
  -- Períodos fiscales pagados por cada seller
  SELECT
    CUS_CUST_ID,
    CONCAT(YEAR, '-', LPAD(MONTH, 2, '0')) as periodo_fiscal
  FROM WHOWNER.BT_MP_DAS_TAX_EVENTS
  WHERE EVENT_TYPE = 'Payment'
    AND YEAR IS NOT NULL
    AND MONTH IS NOT NULL
  GROUP BY CUS_CUST_ID, periodo_fiscal
),
pendientes_por_seller AS (
  -- LEFT JOIN para encontrar emisiones sin pago
  SELECT
    e.CUS_CUST_ID,
    COUNT(*) as periodos_pendientes
  FROM emisiones e
  LEFT JOIN pagos p
    ON e.CUS_CUST_ID = p.CUS_CUST_ID
    AND e.periodo_fiscal = p.periodo_fiscal
  WHERE p.periodo_fiscal IS NULL  -- No existe pago
    AND e.periodo_fiscal <= FORMAT_DATE('%Y-%m', DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
  GROUP BY e.CUS_CUST_ID
)
SELECT
  COUNTIF(periodos_pendientes = 0) as sellers_0_pendientes,
  COUNTIF(periodos_pendientes = 1) as sellers_1_pendiente,
  COUNTIF(periodos_pendientes BETWEEN 2 AND 3) as sellers_2_3_pendientes,
  COUNTIF(periodos_pendientes BETWEEN 4 AND 6) as sellers_4_6_pendientes,
  COUNTIF(periodos_pendientes >= 7) as sellers_7_plus_pendientes,
  ROUND(AVG(periodos_pendientes), 2) as promedio_pendientes
FROM pendientes_por_seller
```

#### Lógica de Pendientes

**Criterios**:
1. Período fiscal fue emitido (`SERPRO-Emission` con `success`)
2. No existe un pago correspondiente (`LEFT JOIN` devuelve NULL)
3. El período es anterior al mes actual (no cuenta el mes en curso)

**Ejemplo**:
```
Seller ID: 12345
Períodos emitidos: 2025-08, 2025-09, 2025-10, 2025-11, 2025-12
Períodos pagados:  2025-08, 2025-09

Pendientes: 2025-10, 2025-11, 2025-12 → 3 períodos pendientes
```

#### Categorías de Morosidad

**Segmentación**:
- **0 pendientes**: Sin deuda (al día o nunca emitió)
- **1 pendiente**: Morosidad leve
- **2-3 pendientes**: Morosidad media
- **4-6 pendientes**: Morosidad alta
- **7+ pendientes**: Morosidad crítica (riesgo alto de churn)

#### Visualización

**Gráfico de Barras**:
```
7+ pendientes    ████████████     14,171 sellers
4-6 pendientes   ████████████     14,545 sellers
2-3 pendientes   ██████████████   16,858 sellers
1 pendiente      ███████████████  27,972 sellers
0 pendientes                            0 sellers
```

**Métrica Clave**:
```
Promedio de pendientes por seller: 3.85
```

#### Interpretación

**Ejemplo Real**:
```
Total sellers con emisiones: 73,546

Distribución:
- 0 pendientes: 0 (0%) - Nadie está al día
- 1 pendiente: 27,972 (38%)
- 2-3 pendientes: 16,858 (23%)
- 4-6 pendientes: 14,545 (20%)
- 7+ pendientes: 14,171 (19%)

Promedio: 3.85 períodos pendientes
```

**Análisis**:
- **0% sin pendientes**: TODOS los sellers que emitieron tienen deuda
- **38% con 1 pendiente**: Están relativamente al día
- **19% con 7+ pendientes**: Casi 1 de cada 5 está en morosidad crítica
- **Promedio 3.85**: En promedio, cada seller debe casi 4 meses

**Severidad del Problema**:
- Promedio < 2: Saludable
- Promedio 2-4: Moderado (revisar procesos)
- Promedio > 4: Crítico (acción inmediata)

**Acción Recomendada**:
⚠️ **Programa de Recuperación Urgente**:
1. **Prioridad 1**: Sellers con 7+ pendientes (riesgo de churn)
   - Contacto directo (teléfono/email)
   - Planes de pago especiales
   - Descuentos por regularización

2. **Prioridad 2**: Sellers con 4-6 pendientes
   - Campañas de email automatizado
   - Recordatorios por push/SMS
   - Facilidades de pago

3. **Prevención**: Sellers con 1-3 pendientes
   - Recordatorios proactivos
   - Educación sobre consecuencias
   - Incentivar pago temprano

---

### 4. Próximos Pasos Recomendados

Sección con 3 acciones concretas basadas en los datos:

#### 🔵 Campaña de Retención (Mes 1)

**Basado en**: Análisis de cohortes

**Problema identificado**:
- Retención en Mes 1 es baja (10-20%)
- La mayoría de sellers no regresa después del primer uso

**Acción**:
1. Crear campaña de email/push 15 días después del primer uso
2. Ofrecer incentivo (descuento en próximo pago, soporte prioritario)
3. Educar sobre beneficios de uso regular

**KPI a medir**:
- Retención Mes 1 antes vs después de campaña
- % de sellers que abren email
- % de sellers que regresan post-campaña

---

#### 🟢 Programa de Recuperación

**Basado en**: Distribución de períodos pendientes

**Problema identificado**:
- 19% de sellers con 7+ períodos pendientes
- Promedio de morosidad: 3.85 períodos

**Acción**:
1. Segmentar sellers por nivel de morosidad
2. Crear flujos diferenciados:
   - 7+ pendientes: Contacto humano directo
   - 4-6 pendientes: Email + SMS automatizado
   - 1-3 pendientes: Recordatorios suaves
3. Ofrecer planes de pago escalonado
4. Automatizar recordatorios recurrentes

**KPI a medir**:
- Reducción del promedio de pendientes
- % de sellers que regularizan
- Volumen recuperado (BRL)

---

#### 🟡 Engagement de Power Users

**Basado en**: Nivel de engagement (días activos)

**Problema identificado**:
- Solo 1.1% son power users (8+ días)
- 60.7% son one-time users

**Acción**:
1. **Investigación cualitativa**:
   - Entrevistar power users (8+ días)
   - Identificar qué los motiva
   - Descubrir patrones de uso

2. **Programa de embajadores**:
   - Invitar power users a programa de referidos
   - Ofrecer beneficios exclusivos
   - Crear comunidad de early adopters

3. **Replicar comportamiento**:
   - Aplicar aprendizajes a campañas masivas
   - Crear contenido educativo basado en best practices

**KPI a medir**:
- % de sellers que pasan de 1-3 días a 4-7 días
- Crecimiento de segmento 8+ días
- Tasa de referidos generados por power users

---

## Glosario de Términos

| Término | Definición |
|---------|------------|
| **Cohorte** | Grupo de sellers que tuvieron su primera actividad en el mismo mes |
| **Retención** | % de sellers de una cohorte que regresan en meses posteriores |
| **Engagement** | Nivel de uso medido por días activos |
| **Período Pendiente** | Período fiscal emitido pero no pagado |
| **Morosidad** | Cantidad de períodos pendientes que tiene un seller |
| **Tasa de Conversión de Eventos** | % de emisiones que resultan en pago |
| **Tasa de Conversión de Sellers** | % de sellers que emiten y luego pagan |
| **Ticket Promedio** | Monto promedio por pago |
| **Volumen** | Suma total de montos de pagos |
| **Seller Nuevo** | Primera vez que aparece en el sistema |
| **Seller Recurrente** | Ya había tenido actividad previa |
| **Power User** | Seller con 8+ días activos |
| **One-time User** | Seller con solo 1 día activo |

---

## Ejemplos de Análisis

### Caso 1: Detectar Problema de Conversión

**Síntomas en el Dashboard**:
- **General Tab**: Tasa de conversión de sellers = 31%
- **Mensual Tab**: Enero 2026 tiene conversión de 28% (peor que promedio)
- **Next Steps Tab**: Retención Mes 1 = 0.45%

**Diagnóstico**:
1. Solo 3 de cada 10 sellers que emiten terminan pagando
2. Enero fue particularmente malo
3. Casi nadie regresa después del primer uso

**Investigación**:
- Revisar **Estados de Emisión** en Mensual Tab
- Si % de errores es alto → Problema técnico
- Si % de ya_pagadas es alto → Confusión del usuario
- Revisar **Top Períodos Fiscales** → ¿Sellers emiten períodos viejos?

**Acción**:
- Mejorar UX del flujo de pago
- Simplificar proceso
- Agregar recordatorios automáticos

---

### Caso 2: Identificar Estacionalidad

**Síntomas en el Dashboard**:
- **General Tab**: Gráfico de emisiones muestra picos en meses específicos
- **Mensual Tab**: Ciertos meses tienen 3x más volumen

**Investigación**:
- Comparar filtro "Fecha de Evento" vs "Período Fiscal"
- Verificar si picos corresponden a deadlines fiscales
- Revisar **Top Períodos Fiscales** para entender timing

**Insight**:
- Sellers tienden a emitir en masa al inicio de cada mes
- El período fiscal más emitido es siempre M-1 (mes anterior)
- Esto es comportamiento esperado (pago de impuestos del mes pasado)

---

### Caso 3: Optimizar Recuperación

**Síntomas en el Dashboard**:
- **Next Steps Tab**: 19% de sellers con 7+ pendientes
- **Next Steps Tab**: Promedio de 3.85 períodos pendientes
- **General Tab**: Brecha grande entre emisiones y pagos

**Segmentación para Campaña**:
1. **Urgente** (7+ pendientes): 14,171 sellers
   - Volumen potencial a recuperar: Estimar `14,171 × ticket_promedio × 7`
   - Estrategia: Contacto directo + planes de pago

2. **Alta prioridad** (4-6 pendientes): 14,545 sellers
   - Estrategia: Campañas automatizadas + descuentos

3. **Monitoreo** (2-3 pendientes): 16,858 sellers
   - Estrategia: Recordatorios preventivos

**ROI Estimado**:
```
Ticket promedio: BRL 100
Sellers 7+ pendientes: 14,171
Promedio pendiente: 7 períodos

Volumen potencial: 14,171 × BRL 100 × 7 = BRL 9,919,700

Si recuperamos el 20%: BRL 1,983,940
```

---

## Mejores Prácticas de Uso

### 1. Rutina Semanal
- Lunes: Revisar **General Tab** para overview
- Miércoles: Analizar **Mensual Tab** del mes actual
- Viernes: Revisar **Next Steps Tab** para planning

### 2. Antes de Reunión Ejecutiva
1. Abrir **General Tab**
2. Preparar insights de:
   - Tendencias de emisiones/pagos
   - Evolución de conversión
   - Volumen procesado vs mes anterior

### 3. Para Planning Trimestral
1. Usar **Next Steps Tab**
2. Analizar cohortes para proyectar retención
3. Estimar volumen de recuperación de pendientes
4. Priorizar iniciativas basadas en datos

### 4. Para Diagnóstico de Problema
1. Empezar en **General Tab** para identificar anomalía
2. Ir a **Mensual Tab** del mes afectado
3. Alternar filtros (Evento vs Fiscal) para entender causa
4. Revisar estados de emisión y top períodos

---

## Soporte Técnico

**Endpoints de API**:
- `GET /api/metrics/monthly` - Datos para General Tab
- `GET /api/metrics/sellers` - Datos de sellers para General Tab
- `GET /api/metrics/month/<periodo>?filter=event|fiscal` - Datos para Mensual Tab
- `GET /api/metrics/nextsteps` - Datos para Next Steps Tab

**Logs de Backend**:
```bash
tail -f /Users/woviedoalist/fiscal-dashboard/backend/backend.log
```

**Reiniciar servicios**:
```bash
# Backend
cd /Users/woviedoalist/fiscal-dashboard/backend
python3 app.py

# Frontend
cd /Users/woviedoalist/fiscal-dashboard/frontend
npm start
```

---

## Changelog

**Versión 1.0** (2026-02-05)
- Documentación inicial completa
- Explicación de todas las métricas y cálculos
- Ejemplos de casos de uso

---

¿Preguntas? Consulta [README.md](README.md) o [QUICKSTART.md](QUICKSTART.md)
