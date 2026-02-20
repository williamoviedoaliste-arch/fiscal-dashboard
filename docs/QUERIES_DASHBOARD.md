# 🔍 Queries del Dashboard

**Todas las queries SQL utilizadas en el Fiscal Dashboard**

---

## 📖 Índice

1. [Endpoints del Backend](#endpoints-del-backend)
2. [Queries de Vista General](#queries-de-vista-general)
3. [Queries de Vista Mensual](#queries-de-vista-mensual)
4. [Queries de Uso de Pendings](#queries-de-uso-de-pendings)
5. [Queries Personalizadas](#queries-personalizadas)
6. [Optimizaciones](#optimizaciones)

---

## 🌐 Endpoints del Backend

### Mapa de Endpoints

| Endpoint | Método | Propósito | Query Principal |
|----------|--------|-----------|-----------------|
| `/api/health` | GET | Health check | N/A |
| `/api/metrics/monthly` | GET | Métricas mensuales agregadas | [Ver](#1-apimetrics monthly) |
| `/api/metrics/sellers` | GET | Análisis de sellers | [Ver](#2-apimetricssellers) |
| `/api/metrics/month/<periodo>` | GET | Métricas de mes específico | [Ver](#3-apimetricsmonth periodo) |
| `/api/pendings/summary` | GET | Resumen de notificaciones | [Ver](#1-apipendingssummary) |
| `/api/pendings/monthly` | GET | Evolución mensual pendings | [Ver](#2-apipendingsmonthly) |
| `/api/pendings/comparison` | GET | Comparación notif vs pagos | [Ver](#3-apipendingscomparison) |

---

## 📊 Queries de Vista General

### 1. `/api/metrics/monthly`

**Propósito**: Obtener métricas agregadas por mes para gráficos de tendencia.

**Código**: `backend/app.py` líneas 40-90

```sql
WITH emisiones AS (
    SELECT
        MONTH,
        YEAR,
        COUNT(*) as total_emisiones,
        COUNT(DISTINCT CUS_CUST_ID) as sellers_emisiones,
        SUM(CAST(AMOUNT AS FLOAT64)) as volumen_emisiones
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    WHERE EVENT_TYPE = 'SERPRO-Emission'
        AND EVENT_DATE IS NOT NULL
    GROUP BY MONTH, YEAR
),
pagos AS (
    SELECT
        MONTH,
        YEAR,
        COUNT(*) as total_pagos,
        COUNT(DISTINCT CUS_CUST_ID) as sellers_pagos,
        SUM(CAST(AMOUNT AS FLOAT64)) as volumen_pagos
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    WHERE EVENT_TYPE = 'Payment'
        AND EVENT_DATE IS NOT NULL
    GROUP BY MONTH, YEAR
)
SELECT
    e.MONTH,
    e.YEAR,
    e.total_emisiones,
    e.sellers_emisiones,
    e.volumen_emisiones,
    COALESCE(p.total_pagos, 0) as total_pagos,
    COALESCE(p.sellers_pagos, 0) as sellers_pagos,
    COALESCE(p.volumen_pagos, 0) as volumen_pagos,
    ROUND(
        COALESCE(p.total_pagos, 0) * 100.0 / NULLIF(e.total_emisiones, 0),
    2) as tasa_conversion
FROM emisiones e
LEFT JOIN pagos p
    ON e.MONTH = p.MONTH
    AND e.YEAR = p.YEAR
ORDER BY e.YEAR DESC, e.MONTH DESC
LIMIT 12;
```

**Output Esperado**:
```json
[
  {
    "MONTH": "01",
    "YEAR": "2026",
    "total_emisiones": 5200,
    "sellers_emisiones": 4100,
    "volumen_emisiones": 12500000.50,
    "total_pagos": 3950,
    "sellers_pagos": 3200,
    "volumen_pagos": 9800000.25,
    "tasa_conversion": 75.96
  },
  ...
]
```

**Performance**: ~2-3 segundos (procesa ~500K filas)

---

### 2. `/api/metrics/sellers`

**Propósito**: Analizar comportamiento de sellers (nuevos vs recurrentes).

**Código**: `backend/app.py` líneas 95-150

```sql
WITH sellers_por_mes AS (
    SELECT
        MONTH,
        YEAR,
        CUS_CUST_ID
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    WHERE EVENT_TYPE = 'Payment'
        AND EVENT_DATE IS NOT NULL
    GROUP BY MONTH, YEAR, CUS_CUST_ID
),
sellers_con_conteo AS (
    SELECT
        MONTH,
        YEAR,
        CUS_CUST_ID,
        COUNT(*) OVER (
            PARTITION BY CUS_CUST_ID
            ORDER BY YEAR, MONTH
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) as veces_pagado
    FROM sellers_por_mes
)
SELECT
    MONTH,
    YEAR,
    COUNT(DISTINCT CASE WHEN veces_pagado = 1 THEN CUS_CUST_ID END) as sellers_nuevos,
    COUNT(DISTINCT CASE WHEN veces_pagado > 1 THEN CUS_CUST_ID END) as sellers_recurrentes,
    COUNT(DISTINCT CUS_CUST_ID) as total_sellers
FROM sellers_con_conteo
GROUP BY MONTH, YEAR
ORDER BY YEAR DESC, MONTH DESC
LIMIT 12;
```

**Output Esperado**:
```json
[
  {
    "MONTH": "01",
    "YEAR": "2026",
    "sellers_nuevos": 850,
    "sellers_recurrentes": 2350,
    "total_sellers": 3200
  },
  ...
]
```

**Interpretación**:
- `sellers_nuevos`: Primera vez que pagan impuestos
- `sellers_recurrentes`: Ya habían pagado en meses anteriores
- Ratio saludable: ~25-30% nuevos, 70-75% recurrentes

---

### 3. `/api/metrics/month/<periodo>`

**Propósito**: Métricas detalladas de un mes específico con comparación vs mes anterior.

**Código**: `backend/app.py` líneas 155-250

**Parámetro**: `periodo` en formato `YYYY-MM` (ej: `2026-01`)

```sql
-- Período actual
WITH periodo_actual AS (
    SELECT
        COUNT(CASE WHEN EVENT_TYPE = 'SERPRO-Emission' THEN 1 END) as emisiones,
        COUNT(CASE WHEN EVENT_TYPE = 'Payment' THEN 1 END) as pagos,
        COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'SERPRO-Emission' THEN CUS_CUST_ID END) as sellers_emision,
        COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'Payment' THEN CUS_CUST_ID END) as sellers_pago,
        SUM(CASE WHEN EVENT_TYPE = 'Payment' THEN CAST(AMOUNT AS FLOAT64) ELSE 0 END) as volumen_pagado
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    WHERE YEAR = '{year}'
        AND MONTH = '{month}'
        AND EVENT_DATE IS NOT NULL
),
-- Período anterior
periodo_anterior AS (
    SELECT
        COUNT(CASE WHEN EVENT_TYPE = 'SERPRO-Emission' THEN 1 END) as emisiones,
        COUNT(CASE WHEN EVENT_TYPE = 'Payment' THEN 1 END) as pagos,
        COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'Payment' THEN CUS_CUST_ID END) as sellers_pago,
        SUM(CASE WHEN EVENT_TYPE = 'Payment' THEN CAST(AMOUNT AS FLOAT64) ELSE 0 END) as volumen_pagado
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    WHERE (
        (CAST(YEAR AS INT64) = {year} AND CAST(MONTH AS INT64) = {month} - 1)
        OR
        (CAST(YEAR AS INT64) = {year} - 1 AND {month} = 1 AND MONTH = '12')
    )
    AND EVENT_DATE IS NOT NULL
)
SELECT
    -- Período actual
    pa.emisiones as emisiones_actual,
    pa.pagos as pagos_actual,
    pa.sellers_emision as sellers_emision_actual,
    pa.sellers_pago as sellers_pago_actual,
    pa.volumen_pagado as volumen_actual,
    ROUND(pa.pagos * 100.0 / NULLIF(pa.emisiones, 0), 2) as conversion_actual,

    -- Período anterior
    pp.emisiones as emisiones_anterior,
    pp.pagos as pagos_anterior,
    pp.sellers_pago as sellers_pago_anterior,
    pp.volumen_pagado as volumen_anterior,

    -- Deltas
    ROUND((pa.pagos - pp.pagos) * 100.0 / NULLIF(pp.pagos, 0), 2) as delta_pagos_pct,
    ROUND((pa.volumen_pagado - pp.volumen_pagado) * 100.0 / NULLIF(pp.volumen_pagado, 0), 2) as delta_volumen_pct
FROM periodo_actual pa, periodo_anterior pp;
```

**Output Esperado**:
```json
{
  "emisiones_actual": 5200,
  "pagos_actual": 3950,
  "sellers_emision_actual": 4100,
  "sellers_pago_actual": 3200,
  "volumen_actual": 9800000.25,
  "conversion_actual": 75.96,
  "emisiones_anterior": 5100,
  "pagos_anterior": 3800,
  "sellers_pago_anterior": 3100,
  "volumen_anterior": 9200000.50,
  "delta_pagos_pct": 3.95,
  "delta_volumen_pct": 6.52
}
```

**Insights Automáticos**:
- Delta > 10%: Cambio significativo (positivo o negativo)
- Delta < 5%: Estable
- Conversion < 70%: Alerta de morosidad

---

## 🔔 Queries de Uso de Pendings

### 1. `/api/pendings/summary`

**Propósito**: Resumen general de notificaciones y su efectividad.

**Código**: `backend/app.py` líneas 637-700

**⚠️ IMPORTANTE**: Solo incluye pagos desde **Diciembre 2025** en adelante.

```sql
WITH notificaciones AS (
    SELECT
        COUNT(*) as total_enviadas,
        COUNT(DISTINCT user_id) as sellers_notificados,
        COUNT(CASE WHEN status = 'deleted' AND substatus IN ('success', 'success_web') THEN 1 END) as total_cerradas_exito
    FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
    WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
        AND created_at >= '2025-12-01'
),
pagos_reales AS (
    SELECT
        COUNT(*) as total_pagos_reales,
        COUNT(DISTINCT CUS_CUST_ID) as sellers_pagos_reales
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    WHERE EVENT_TYPE = 'Payment'
        AND EVENT_DATE IS NOT NULL
        AND (CAST(YEAR AS INT64) > 2025
             OR (CAST(YEAR AS INT64) = 2025 AND CAST(MONTH AS INT64) >= 12))
),
pagos_desde_notif AS (
    SELECT
        COUNT(DISTINCT e.CUS_CUST_ID) as sellers_pagaron,
        COUNT(*) as total_pagos_desde_notif
    FROM `SBOX_SBOXMERCH.DIM_PENDINGS` p
    INNER JOIN `WHOWNER.BT_MP_DAS_TAX_EVENTS` e
        ON CAST(p.user_id AS STRING) = e.CUS_CUST_ID
        AND e.EVENT_TYPE = 'Payment'
        AND e.EVENT_DATE >= DATE(p.created_at)
        AND (CAST(e.YEAR AS INT64) > 2025
             OR (CAST(e.YEAR AS INT64) = 2025 AND CAST(e.MONTH AS INT64) >= 12))
    WHERE p.content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
        AND p.status = 'deleted'
        AND p.created_at >= '2025-12-01'
)
SELECT
    n.total_enviadas,
    n.sellers_notificados,
    n.total_cerradas_exito,
    pr.total_pagos_reales,
    pr.sellers_pagos_reales,
    pn.total_pagos_desde_notif,
    pn.sellers_pagaron,
    ROUND(pn.total_pagos_desde_notif * 100.0 / NULLIF(pr.total_pagos_reales, 0), 2) as tasa_conversion_pagos
FROM notificaciones n, pagos_reales pr, pagos_desde_notif pn;
```

**Output Esperado**:
```json
{
  "total_enviadas": 196535,
  "sellers_notificados": 85200,
  "total_cerradas_exito": 45300,
  "total_pagos_reales": 18138,
  "sellers_pagos_reales": 15100,
  "total_pagos_desde_notif": 12027,
  "sellers_pagaron": 10500,
  "tasa_conversion_pagos": 66.31
}
```

**Interpretación**:
- **196K notificaciones enviadas** a 85K sellers
- **18K pagos totales** desde 12/2025
- **12K pagos (66%)** atribuibles a notificaciones
- **ROI**: Notificaciones claramente efectivas

---

### 2. `/api/pendings/monthly`

**Propósito**: Evolución mensual de notificaciones por criticidad.

**Código**: `backend/app.py` líneas 725-780

```sql
WITH notifs_por_mes AS (
    SELECT
        FORMAT_DATE('%Y-%m', DATE(p.created_at)) as mes,
        p.criticality,
        COUNT(*) as total_enviadas,
        COUNT(CASE WHEN p.status = 'deleted' AND p.substatus IN ('success', 'success_web') THEN 1 END) as total_exito
    FROM `SBOX_SBOXMERCH.DIM_PENDINGS` p
    WHERE p.content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
        AND p.created_at >= '2025-12-01'
    GROUP BY mes, criticality
)
SELECT
    mes,
    criticality,
    total_enviadas,
    total_exito,
    ROUND(total_exito * 100.0 / NULLIF(total_enviadas, 0), 2) as tasa_exito_pct
FROM notifs_por_mes
ORDER BY mes DESC, criticality;
```

**Output Esperado**:
```json
[
  {
    "mes": "2026-01",
    "criticality": "HIGH",
    "total_enviadas": 8500,
    "total_exito": 6200,
    "tasa_exito_pct": 72.94
  },
  {
    "mes": "2026-01",
    "criticality": "MEDIUM",
    "total_enviadas": 12000,
    "total_exito": 7800,
    "tasa_exito_pct": 65.00
  },
  {
    "mes": "2026-01",
    "criticality": "LOW",
    "total_enviadas": 5000,
    "total_exito": 2100,
    "tasa_exito_pct": 42.00
  },
  ...
]
```

**Insight**: Criticidad alta tiene mejor conversión (~73% vs ~42% baja).

---

### 3. `/api/pendings/comparison`

**Propósito**: Comparar sellers notificados vs no notificados.

**Código**: `backend/app.py` líneas 808-880

```sql
WITH sellers_notificados AS (
    SELECT DISTINCT CAST(user_id AS STRING) as seller_id
    FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
    WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
        AND created_at >= '2025-12-01'
),
pagos_filtrados AS (
    SELECT
        CUS_CUST_ID,
        COUNT(*) as total_pagos,
        SUM(CAST(AMOUNT AS FLOAT64)) as volumen_total
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    WHERE EVENT_TYPE = 'Payment'
        AND EVENT_DATE IS NOT NULL
        AND (CAST(YEAR AS INT64) > 2025
             OR (CAST(YEAR AS INT64) = 2025 AND CAST(MONTH AS INT64) >= 12))
    GROUP BY CUS_CUST_ID
)
SELECT
    CASE
        WHEN sn.seller_id IS NOT NULL THEN 'Notificado'
        ELSE 'No Notificado'
    END as grupo,
    COUNT(DISTINCT pf.CUS_CUST_ID) as sellers,
    SUM(pf.total_pagos) as total_pagos,
    SUM(pf.volumen_total) as volumen_total,
    ROUND(AVG(pf.total_pagos), 2) as promedio_pagos_por_seller,
    ROUND(AVG(pf.volumen_total), 2) as promedio_volumen_por_seller
FROM pagos_filtrados pf
LEFT JOIN sellers_notificados sn ON pf.CUS_CUST_ID = sn.seller_id
GROUP BY grupo;
```

**Output Esperado**:
```json
[
  {
    "grupo": "Notificado",
    "sellers": 10500,
    "total_pagos": 12027,
    "volumen_total": 28500000.75,
    "promedio_pagos_por_seller": 1.15,
    "promedio_volumen_por_seller": 2714.29
  },
  {
    "grupo": "No Notificado",
    "sellers": 4600,
    "total_pagos": 6111,
    "volumen_total": 11200000.50,
    "promedio_volumen_por_seller": 2434.78
  }
]
```

**Insight**: Sellers notificados pagan ligeramente más en promedio.

---

## 🔧 Queries Personalizadas

### Top 10 Sellers por Volumen Pagado

```sql
SELECT
    CUS_CUST_ID as seller_id,
    COUNT(*) as total_pagos,
    SUM(CAST(AMOUNT AS FLOAT64)) as volumen_total_brl,
    ROUND(AVG(CAST(AMOUNT AS FLOAT64)), 2) as promedio_por_pago,
    MIN(EVENT_DATE) as primer_pago,
    MAX(EVENT_DATE) as ultimo_pago
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'Payment'
    AND EVENT_DATE >= '2025-12-01'
GROUP BY CUS_CUST_ID
ORDER BY volumen_total_brl DESC
LIMIT 10;
```

---

### Sellers en Riesgo (Emisión pero Sin Pago)

```sql
WITH ultimo_mes AS (
    SELECT MAX(CONCAT(YEAR, '-', MONTH)) as periodo
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    WHERE EVENT_TYPE = 'SERPRO-Emission'
),
sellers_con_emision AS (
    SELECT DISTINCT
        e.CUS_CUST_ID,
        e.AMOUNT,
        e.DUE_DATE
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS` e, ultimo_mes um
    WHERE e.EVENT_TYPE = 'SERPRO-Emission'
        AND CONCAT(e.YEAR, '-', e.MONTH) = um.periodo
),
sellers_con_pago AS (
    SELECT DISTINCT CUS_CUST_ID
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS` e, ultimo_mes um
    WHERE e.EVENT_TYPE = 'Payment'
        AND CONCAT(e.YEAR, '-', e.MONTH) = um.periodo
)
SELECT
    e.CUS_CUST_ID as seller_id,
    e.AMOUNT as monto_pendiente,
    e.DUE_DATE as fecha_vencimiento,
    DATE_DIFF(CURRENT_DATE(), e.DUE_DATE, DAY) as dias_vencido
FROM sellers_con_emision e
LEFT JOIN sellers_con_pago p ON e.CUS_CUST_ID = p.CUS_CUST_ID
WHERE p.CUS_CUST_ID IS NULL
    AND e.DUE_DATE < CURRENT_DATE()
ORDER BY dias_vencido DESC
LIMIT 100;
```

---

### Tiempo Promedio entre Notificación y Pago

```sql
WITH notif_y_pago AS (
    SELECT
        p.user_id,
        p.created_at as notif_sent,
        MIN(e.EVENT_DATE) as payment_date
    FROM `SBOX_SBOXMERCH.DIM_PENDINGS` p
    INNER JOIN `WHOWNER.BT_MP_DAS_TAX_EVENTS` e
        ON CAST(p.user_id AS STRING) = e.CUS_CUST_ID
        AND e.EVENT_TYPE = 'Payment'
        AND e.EVENT_DATE >= DATE(p.created_at)
    WHERE p.content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
        AND p.status = 'deleted'
        AND p.substatus IN ('success', 'success_web')
        AND p.created_at >= '2025-12-01'
    GROUP BY p.user_id, p.created_at
)
SELECT
    ROUND(AVG(DATE_DIFF(payment_date, DATE(notif_sent), DAY)), 2) as dias_promedio,
    MIN(DATE_DIFF(payment_date, DATE(notif_sent), DAY)) as dias_minimo,
    MAX(DATE_DIFF(payment_date, DATE(notif_sent), DAY)) as dias_maximo,
    APPROX_QUANTILES(DATE_DIFF(payment_date, DATE(notif_sent), DAY), 100)[OFFSET(50)] as mediana_dias
FROM notif_y_pago;
```

**Resultado típico**:
```
dias_promedio: 4.2
dias_minimo: 0
dias_maximo: 19
mediana_dias: 3
```

---

### Análisis de Morosidad por Período Fiscal

```sql
WITH periodos AS (
    SELECT DISTINCT TAX_PERIOD
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    WHERE EVENT_TYPE = 'SERPRO-Emission'
        AND TAX_PERIOD >= '2025-12'
),
emisiones_por_periodo AS (
    SELECT
        TAX_PERIOD,
        COUNT(*) as total_emisiones,
        SUM(CAST(AMOUNT AS FLOAT64)) as volumen_emitido
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    WHERE EVENT_TYPE = 'SERPRO-Emission'
    GROUP BY TAX_PERIOD
),
pagos_por_periodo AS (
    SELECT
        TAX_PERIOD,
        COUNT(*) as total_pagos,
        SUM(CAST(AMOUNT AS FLOAT64)) as volumen_pagado
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    WHERE EVENT_TYPE = 'Payment'
    GROUP BY TAX_PERIOD
)
SELECT
    e.TAX_PERIOD,
    e.total_emisiones,
    e.volumen_emitido,
    COALESCE(p.total_pagos, 0) as total_pagos,
    COALESCE(p.volumen_pagado, 0) as volumen_pagado,
    ROUND(COALESCE(p.total_pagos, 0) * 100.0 / e.total_emisiones, 2) as tasa_compliance_pct,
    ROUND((e.volumen_emitido - COALESCE(p.volumen_pagado, 0)), 2) as gap_volumen_brl
FROM emisiones_por_periodo e
LEFT JOIN pagos_por_periodo p ON e.TAX_PERIOD = p.TAX_PERIOD
WHERE e.TAX_PERIOD IN (SELECT TAX_PERIOD FROM periodos)
ORDER BY e.TAX_PERIOD DESC;
```

---

## ⚡ Optimizaciones

### 1. Usar Particiones

```sql
-- ❌ Slow (scans all data)
SELECT COUNT(*)
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE YEAR = '2026';

-- ✅ Fast (uses partition)
SELECT COUNT(*)
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_DATE >= '2026-01-01';
```

### 2. Limitar Resultados

```sql
-- Para dashboards, siempre limitar
LIMIT 1000

-- Para análisis exploratorios
LIMIT 100
```

### 3. Cachear Resultados

En el dashboard, considerar cachear queries que no cambian frecuentemente:

```python
from functools import lru_cache
from datetime import datetime, timedelta

@lru_cache(maxsize=128)
def get_monthly_metrics_cached(cache_key):
    # Query pesada aquí
    return results

# Usar con cache key basado en fecha
cache_key = datetime.now().strftime('%Y-%m-%d-%H')  # cache por hora
data = get_monthly_metrics_cached(cache_key)
```

### 4. Índices de Clustering

BigQuery auto-optimiza con clustering. Aprovechar en WHERE:

```sql
-- ✅ Usa clustering (EVENT_TYPE, CUS_CUST_ID)
WHERE EVENT_TYPE = 'Payment'
    AND CUS_CUST_ID IN ('123', '456', '789')
```

---

## 📚 Referencias

- [DICCIONARIO_TABLAS.md](DICCIONARIO_TABLAS.md) - Estructura de datos
- [KPIS_PRINCIPALES.md](KPIS_PRINCIPALES.md) - Definición de métricas
- [BigQuery Best Practices](https://cloud.google.com/bigquery/docs/best-practices-performance-overview)

---

**Última actualización**: 2026-02-11
**Versión**: 1.0
**Owner**: william.oviedoaliste@mercadolibre.cl
