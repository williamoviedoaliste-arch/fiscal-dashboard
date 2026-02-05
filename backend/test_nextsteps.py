#!/usr/bin/env python3
"""
Script de prueba para verificar las queries de Next Steps
"""
from google.cloud import bigquery

client = bigquery.Client()

print("=" * 60)
print("PROBANDO QUERIES DE NEXT STEPS")
print("=" * 60)

# Query 1: Cohortes
print("\n1. Probando query de COHORTES...")
cohort_query = """
WITH seller_first_month AS (
  SELECT
    CUS_CUST_ID,
    FORMAT_DATE('%Y-%m', MIN(EVENT_DATE)) as cohort_mes
  FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
  WHERE EVENT_TYPE IN ('SERPRO-Emission', 'Payment')
  GROUP BY CUS_CUST_ID
),
monthly_activity AS (
  SELECT
    e.CUS_CUST_ID,
    FORMAT_DATE('%Y-%m', e.EVENT_DATE) as mes_actividad,
    c.cohort_mes,
    DATE_DIFF(DATE_TRUNC(e.EVENT_DATE, MONTH), DATE_TRUNC(PARSE_DATE('%Y-%m', c.cohort_mes), MONTH), MONTH) as meses_desde_cohort
  FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS` e
  INNER JOIN seller_first_month c ON e.CUS_CUST_ID = c.CUS_CUST_ID
  WHERE e.EVENT_TYPE IN ('SERPRO-Emission', 'Payment')
  GROUP BY e.CUS_CUST_ID, mes_actividad, c.cohort_mes
)
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
"""

try:
    job = client.query(cohort_query)
    results = list(job.result())
    print(f"✅ COHORTES: {len(results)} filas obtenidas")
    for row in results[:3]:
        print(f"   - {row.cohort_mes}: {row.sellers_cohort} sellers")
except Exception as e:
    print(f"❌ ERROR en COHORTES: {e}")

# Query 2: Engagement
print("\n2. Probando query de ENGAGEMENT...")
engagement_query = """
SELECT
  COUNTIF(dias_activos = 1) as sellers_1_dia,
  COUNTIF(dias_activos BETWEEN 2 AND 3) as sellers_2_3_dias,
  COUNTIF(dias_activos BETWEEN 4 AND 7) as sellers_4_7_dias,
  COUNTIF(dias_activos >= 8) as sellers_8_plus_dias
FROM (
  SELECT
    CUS_CUST_ID,
    COUNT(DISTINCT DATE(EVENT_DATE)) as dias_activos
  FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
  WHERE EVENT_TYPE IN ('SERPRO-Emission', 'Payment')
  GROUP BY CUS_CUST_ID
)
"""

try:
    job = client.query(engagement_query)
    results = list(job.result())
    print(f"✅ ENGAGEMENT: {len(results)} filas obtenidas")
    if results:
        row = results[0]
        print(f"   - 1 día: {row.sellers_1_dia}")
        print(f"   - 2-3 días: {row.sellers_2_3_dias}")
        print(f"   - 4-7 días: {row.sellers_4_7_dias}")
        print(f"   - 8+ días: {row.sellers_8_plus_dias}")
except Exception as e:
    print(f"❌ ERROR en ENGAGEMENT: {e}")

# Query 3: Pendientes
print("\n3. Probando query de PENDIENTES...")
pending_query = """
WITH emisiones AS (
  SELECT
    CUS_CUST_ID,
    CONCAT(YEAR, '-', LPAD(MONTH, 2, '0')) as periodo_fiscal
  FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
  WHERE EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success'
    AND YEAR IS NOT NULL AND MONTH IS NOT NULL
  GROUP BY CUS_CUST_ID, periodo_fiscal
),
pagos AS (
  SELECT
    CUS_CUST_ID,
    CONCAT(YEAR, '-', LPAD(MONTH, 2, '0')) as periodo_fiscal
  FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
  WHERE EVENT_TYPE = 'Payment'
    AND YEAR IS NOT NULL AND MONTH IS NOT NULL
  GROUP BY CUS_CUST_ID, periodo_fiscal
),
pendientes_por_seller AS (
  SELECT
    e.CUS_CUST_ID,
    COUNT(*) as periodos_pendientes
  FROM emisiones e
  LEFT JOIN pagos p ON e.CUS_CUST_ID = p.CUS_CUST_ID AND e.periodo_fiscal = p.periodo_fiscal
  WHERE p.periodo_fiscal IS NULL
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
"""

try:
    job = client.query(pending_query)
    results = list(job.result())
    print(f"✅ PENDIENTES: {len(results)} filas obtenidas")
    if results:
        row = results[0]
        print(f"   - 0 pendientes: {row.sellers_0_pendientes}")
        print(f"   - 1 pendiente: {row.sellers_1_pendiente}")
        print(f"   - 2-3 pendientes: {row.sellers_2_3_pendientes}")
        print(f"   - Promedio: {row.promedio_pendientes}")
except Exception as e:
    print(f"❌ ERROR en PENDIENTES: {e}")

print("\n" + "=" * 60)
print("FIN DE PRUEBAS")
print("=" * 60)
