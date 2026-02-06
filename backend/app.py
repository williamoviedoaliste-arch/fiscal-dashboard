from flask import Flask, jsonify
from flask_cors import CORS
from google.cloud import bigquery
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Inicializar cliente de BigQuery
client = bigquery.Client()

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

@app.route('/api/metrics/monthly', methods=['GET'])
def get_monthly_metrics():
    """Obtiene métricas mensuales de emisiones y pagos"""
    query = """
    WITH monthly_metrics AS (
      SELECT
        EXTRACT(YEAR FROM EVENT_DATE) as anio,
        EXTRACT(MONTH FROM EVENT_DATE) as mes,
        FORMAT_DATE('%Y-%m', EVENT_DATE) as periodo,

        -- Emisiones
        COUNTIF(EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success') as cantidad_emisiones,
        COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success'
          THEN CUS_CUST_ID END) as sellers_que_emitieron,

        -- Pagos
        COUNTIF(EVENT_TYPE = 'Payment') as cantidad_pagos,
        COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'Payment'
          THEN CUS_CUST_ID END) as sellers_que_pagaron,

        -- Pagos correctos (YEAR/MONTH = mes inmediatamente anterior a EVENT_DATE)
        COUNTIF(EVENT_TYPE = 'Payment'
          AND CONCAT(YEAR, '-', LPAD(CAST(MONTH AS STRING), 2, '0')) = FORMAT_DATE('%Y-%m', DATE_SUB(DATE_TRUNC(EVENT_DATE, MONTH), INTERVAL 1 MONTH))
        ) as cantidad_pagos_correctos,
        COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'Payment'
          AND CONCAT(YEAR, '-', LPAD(CAST(MONTH AS STRING), 2, '0')) = FORMAT_DATE('%Y-%m', DATE_SUB(DATE_TRUNC(EVENT_DATE, MONTH), INTERVAL 1 MONTH))
          THEN CUS_CUST_ID END) as sellers_pagos_correctos,

        -- Conversión
        ROUND(COUNTIF(EVENT_TYPE = 'Payment') * 100.0 /
          NULLIF(COUNTIF(EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success'), 0), 2) as tasa_conversion_eventos_pct,
        ROUND(COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'Payment' THEN CUS_CUST_ID END) * 100.0 /
          NULLIF(COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success'
          THEN CUS_CUST_ID END), 0), 2) as tasa_conversion_sellers_pct,

        -- Volumen
        ROUND(SUM(CASE WHEN EVENT_TYPE = 'Payment' THEN TOTAL_AMOUNT ELSE 0 END), 2) as volumen_pagos,
        ROUND(AVG(CASE WHEN EVENT_TYPE = 'Payment' THEN TOTAL_AMOUNT END), 2) as ticket_promedio_pago,

        -- Promedios
        ROUND(COUNTIF(EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success') * 1.0 /
          NULLIF(COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success'
          THEN CUS_CUST_ID END), 0), 2) as emisiones_promedio_por_seller,
        ROUND(COUNTIF(EVENT_TYPE = 'Payment') * 1.0 /
          NULLIF(COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'Payment' THEN CUS_CUST_ID END), 0), 2) as pagos_promedio_por_seller

      FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
      WHERE EVENT_DATE IS NOT NULL
        AND EVENT_TYPE IN ('SERPRO-Emission', 'Payment')
      GROUP BY anio, mes, periodo
    ),
    previous_month AS (
      SELECT
        periodo,
        LAG(cantidad_emisiones) OVER (ORDER BY periodo) as prev_emisiones,
        LAG(cantidad_pagos) OVER (ORDER BY periodo) as prev_pagos,
        LAG(sellers_que_emitieron) OVER (ORDER BY periodo) as prev_sellers_emiten,
        LAG(sellers_que_pagaron) OVER (ORDER BY periodo) as prev_sellers_pagan,
        LAG(volumen_pagos) OVER (ORDER BY periodo) as prev_volumen
      FROM monthly_metrics
    )
    SELECT
      m.*,
      ROUND((m.cantidad_emisiones - p.prev_emisiones) * 100.0 / NULLIF(p.prev_emisiones, 0), 2) as mom_emisiones_pct,
      ROUND((m.cantidad_pagos - p.prev_pagos) * 100.0 / NULLIF(p.prev_pagos, 0), 2) as mom_pagos_pct,
      ROUND((m.sellers_que_emitieron - p.prev_sellers_emiten) * 100.0 / NULLIF(p.prev_sellers_emiten, 0), 2) as mom_sellers_emiten_pct,
      ROUND((m.sellers_que_pagaron - p.prev_sellers_pagan) * 100.0 / NULLIF(p.prev_sellers_pagan, 0), 2) as mom_sellers_pagan_pct,
      ROUND((m.volumen_pagos - p.prev_volumen) * 100.0 / NULLIF(p.prev_volumen, 0), 2) as mom_volumen_pct
    FROM monthly_metrics m
    LEFT JOIN previous_month p ON m.periodo = p.periodo
    ORDER BY m.periodo ASC
    """

    try:
        query_job = client.query(query)
        results = query_job.result()

        data = []
        for row in results:
            data.append({
                'periodo': row.periodo,
                'anio': row.anio,
                'mes': row.mes,
                'emisiones': {
                    'cantidad': row.cantidad_emisiones,
                    'sellers_unicos': row.sellers_que_emitieron,
                    'promedio_por_seller': float(row.emisiones_promedio_por_seller) if row.emisiones_promedio_por_seller else None
                },
                'pagos': {
                    'cantidad': row.cantidad_pagos,
                    'sellers_unicos': row.sellers_que_pagaron,
                    'promedio_por_seller': float(row.pagos_promedio_por_seller) if row.pagos_promedio_por_seller else None,
                    'volumen_total': float(row.volumen_pagos) if row.volumen_pagos else 0,
                    'ticket_promedio': float(row.ticket_promedio_pago) if row.ticket_promedio_pago else None,
                    'pagos_correctos': row.cantidad_pagos_correctos,
                    'sellers_pagos_correctos': row.sellers_pagos_correctos
                },
                'conversion': {
                    'eventos_pct': float(row.tasa_conversion_eventos_pct) if row.tasa_conversion_eventos_pct else None,
                    'sellers_pct': float(row.tasa_conversion_sellers_pct) if row.tasa_conversion_sellers_pct else None
                },
                'mom_growth': {
                    'emisiones_pct': float(row.mom_emisiones_pct) if row.mom_emisiones_pct else None,
                    'pagos_pct': float(row.mom_pagos_pct) if row.mom_pagos_pct else None,
                    'sellers_emiten_pct': float(row.mom_sellers_emiten_pct) if row.mom_sellers_emiten_pct else None,
                    'sellers_pagan_pct': float(row.mom_sellers_pagan_pct) if row.mom_sellers_pagan_pct else None,
                    'volumen_pct': float(row.mom_volumen_pct) if row.mom_volumen_pct else None
                }
            })

        # Calcular summary
        total_emisiones = sum(d['emisiones']['cantidad'] for d in data)
        total_pagos = sum(d['pagos']['cantidad'] for d in data)
        total_volumen = sum(d['pagos']['volumen_total'] for d in data)

        mejor_mes = max(data, key=lambda x: x['conversion']['sellers_pct'] if x['conversion']['sellers_pct'] else 0)

        return jsonify({
            'data': data,
            'summary': {
                'total_emisiones': total_emisiones,
                'total_pagos': total_pagos,
                'total_volumen': total_volumen,
                'conversion_promedio': round((total_pagos / total_emisiones * 100) if total_emisiones > 0 else 0, 2),
                'mejor_mes': {
                    'periodo': mejor_mes['periodo'],
                    'conversion_sellers': mejor_mes['conversion']['sellers_pct']
                }
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/metrics/sellers', methods=['GET'])
def get_sellers_metrics():
    """Obtiene métricas de sellers nuevos vs recurrentes separadas por emisiones y pagos"""

    # Query para emisiones
    query_emisiones = """
    WITH seller_first_emission AS (
      SELECT
        CUS_CUST_ID,
        MIN(DATE_TRUNC(EVENT_DATE, MONTH)) as primer_mes_emision
      FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
      WHERE EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success'
      GROUP BY CUS_CUST_ID
    )
    SELECT
      FORMAT_DATE('%Y-%m', DATE_TRUNC(e.EVENT_DATE, MONTH)) as periodo,
      COUNT(DISTINCT e.CUS_CUST_ID) as sellers_emiten_total,
      COUNT(DISTINCT CASE WHEN DATE_TRUNC(e.EVENT_DATE, MONTH) = f.primer_mes_emision
        THEN e.CUS_CUST_ID END) as sellers_emiten_nuevos,
      COUNT(DISTINCT CASE WHEN DATE_TRUNC(e.EVENT_DATE, MONTH) != f.primer_mes_emision
        THEN e.CUS_CUST_ID END) as sellers_emiten_recurrentes
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS` e
    INNER JOIN seller_first_emission f ON e.CUS_CUST_ID = f.CUS_CUST_ID
    WHERE e.EVENT_TYPE = 'SERPRO-Emission' AND e.SERPRO_STATUS = 'success'
      AND e.EVENT_DATE IS NOT NULL
    GROUP BY periodo
    ORDER BY periodo ASC
    """

    # Query para pagos
    query_pagos = """
    WITH seller_first_payment AS (
      SELECT
        CUS_CUST_ID,
        MIN(DATE_TRUNC(EVENT_DATE, MONTH)) as primer_mes_pago
      FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
      WHERE EVENT_TYPE = 'Payment'
      GROUP BY CUS_CUST_ID
    )
    SELECT
      FORMAT_DATE('%Y-%m', DATE_TRUNC(e.EVENT_DATE, MONTH)) as periodo,
      COUNT(DISTINCT e.CUS_CUST_ID) as sellers_pagan_total,
      COUNT(DISTINCT CASE WHEN DATE_TRUNC(e.EVENT_DATE, MONTH) = f.primer_mes_pago
        THEN e.CUS_CUST_ID END) as sellers_pagan_nuevos,
      COUNT(DISTINCT CASE WHEN DATE_TRUNC(e.EVENT_DATE, MONTH) != f.primer_mes_pago
        THEN e.CUS_CUST_ID END) as sellers_pagan_recurrentes
    FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS` e
    INNER JOIN seller_first_payment f ON e.CUS_CUST_ID = f.CUS_CUST_ID
    WHERE e.EVENT_TYPE = 'Payment'
      AND e.EVENT_DATE IS NOT NULL
    GROUP BY periodo
    ORDER BY periodo ASC
    """

    try:
        # Ejecutar ambas queries
        emisiones_job = client.query(query_emisiones)
        pagos_job = client.query(query_pagos)

        emisiones_results = list(emisiones_job.result())
        pagos_results = list(pagos_job.result())

        # Crear diccionarios indexados por periodo
        emisiones_dict = {row.periodo: row for row in emisiones_results}
        pagos_dict = {row.periodo: row for row in pagos_results}

        # Obtener todos los períodos únicos
        periodos = sorted(set(emisiones_dict.keys()) | set(pagos_dict.keys()))

        # Combinar datos
        data = []
        for periodo in periodos:
            emision_row = emisiones_dict.get(periodo)
            pago_row = pagos_dict.get(periodo)

            data.append({
                'periodo': periodo,
                'emisiones': {
                    'total': emision_row.sellers_emiten_total if emision_row else 0,
                    'nuevos': emision_row.sellers_emiten_nuevos if emision_row else 0,
                    'recurrentes': emision_row.sellers_emiten_recurrentes if emision_row else 0,
                    'pct_nuevos': round((emision_row.sellers_emiten_nuevos / emision_row.sellers_emiten_total * 100) if emision_row and emision_row.sellers_emiten_total > 0 else 0, 2),
                    'pct_recurrentes': round((emision_row.sellers_emiten_recurrentes / emision_row.sellers_emiten_total * 100) if emision_row and emision_row.sellers_emiten_total > 0 else 0, 2)
                },
                'pagos': {
                    'total': pago_row.sellers_pagan_total if pago_row else 0,
                    'nuevos': pago_row.sellers_pagan_nuevos if pago_row else 0,
                    'recurrentes': pago_row.sellers_pagan_recurrentes if pago_row else 0,
                    'pct_nuevos': round((pago_row.sellers_pagan_nuevos / pago_row.sellers_pagan_total * 100) if pago_row and pago_row.sellers_pagan_total > 0 else 0, 2),
                    'pct_recurrentes': round((pago_row.sellers_pagan_recurrentes / pago_row.sellers_pagan_total * 100) if pago_row and pago_row.sellers_pagan_total > 0 else 0, 2)
                }
            })

        return jsonify({'data': data})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/metrics/month/<periodo>', methods=['GET'])
def get_month_detail(periodo):
    """
    Obtiene métricas detalladas de un mes específico con comparación vs período anterior
    periodo formato: YYYY-MM
    """
    from flask import request
    from datetime import datetime
    from dateutil.relativedelta import relativedelta

    filter_type = request.args.get('filter', 'event')  # 'event' o 'fiscal'

    # Calcular período anterior
    try:
        current_date = datetime.strptime(periodo, '%Y-%m')
        previous_date = current_date - relativedelta(months=1)
        periodo_anterior = previous_date.strftime('%Y-%m')
    except:
        periodo_anterior = None

    # Función helper para construir query
    def build_query(target_periodo, tipo_filtro):
        if tipo_filtro == 'fiscal':
            return f"""
            WITH month_data AS (
              SELECT
                EVENT_TYPE,
                SERPRO_STATUS,
                CUS_CUST_ID,
                TOTAL_AMOUNT,
                CONCAT(YEAR, '-', LPAD(CAST(MONTH AS STRING), 2, '0')) as periodo_fiscal,
                EVENT_DATE
              FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
              WHERE CONCAT(YEAR, '-', LPAD(CAST(MONTH AS STRING), 2, '0')) = '{target_periodo}'
            )
            SELECT
              COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success'
                THEN CUS_CUST_ID END) as sellers_emitieron,
              COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'Payment'
                THEN CUS_CUST_ID END) as sellers_pagaron,
              COUNTIF(EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success') as cantidad_emisiones,
              COUNTIF(EVENT_TYPE = 'Payment') as cantidad_pagos,
              COUNTIF(EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'error') as emisiones_error,
              COUNTIF(EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'already_paid') as emisiones_ya_pagadas,
              ROUND(SUM(CASE WHEN EVENT_TYPE = 'Payment' THEN TOTAL_AMOUNT ELSE 0 END), 2) as volumen_total,
              ROUND(AVG(CASE WHEN EVENT_TYPE = 'Payment' THEN TOTAL_AMOUNT END), 2) as ticket_promedio,
              MIN(EVENT_DATE) as fecha_primera_actividad,
              MAX(EVENT_DATE) as fecha_ultima_actividad
            FROM month_data
            """
        else:
            return f"""
            WITH month_data AS (
              SELECT
                EVENT_TYPE,
                SERPRO_STATUS,
                CUS_CUST_ID,
                TOTAL_AMOUNT,
                YEAR,
                MONTH,
                EVENT_DATE
              FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
              WHERE FORMAT_DATE('%Y-%m', EVENT_DATE) = '{target_periodo}'
            )
            SELECT
              COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success'
                THEN CUS_CUST_ID END) as sellers_emitieron,
              COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'Payment'
                THEN CUS_CUST_ID END) as sellers_pagaron,
              COUNTIF(EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success') as cantidad_emisiones,
              COUNTIF(EVENT_TYPE = 'Payment') as cantidad_pagos,
              COUNTIF(EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'error') as emisiones_error,
              COUNTIF(EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'already_paid') as emisiones_ya_pagadas,
              ROUND(SUM(CASE WHEN EVENT_TYPE = 'Payment' THEN TOTAL_AMOUNT ELSE 0 END), 2) as volumen_total,
              ROUND(AVG(CASE WHEN EVENT_TYPE = 'Payment' THEN TOTAL_AMOUNT END), 2) as ticket_promedio,
              MIN(EVENT_DATE) as fecha_primera_actividad,
              MAX(EVENT_DATE) as fecha_ultima_actividad
            FROM month_data
            """

    try:
        # Query para período actual
        current_query = build_query(periodo, filter_type)
        current_job = client.query(current_query)
        current_results = list(current_job.result())

        if not current_results:
            return jsonify({'error': 'No se encontraron datos para este período'}), 404

        current_row = current_results[0]

        # Query para período anterior (si existe)
        previous_row = None
        if periodo_anterior:
            previous_query = build_query(periodo_anterior, filter_type)
            previous_job = client.query(previous_query)
            previous_results = list(previous_job.result())
            if previous_results:
                previous_row = previous_results[0]

        # Calcular variaciones porcentuales vs período anterior
        def calc_variation(current, previous):
            if previous is None or previous == 0:
                return None
            return round(((current - previous) / previous) * 100, 2)

        variaciones = {}
        if previous_row:
            variaciones = {
                'emisiones_pct': calc_variation(current_row.cantidad_emisiones, previous_row.cantidad_emisiones),
                'pagos_pct': calc_variation(current_row.cantidad_pagos, previous_row.cantidad_pagos),
                'sellers_emiten_pct': calc_variation(current_row.sellers_emitieron, previous_row.sellers_emitieron),
                'sellers_pagan_pct': calc_variation(current_row.sellers_pagaron, previous_row.sellers_pagaron),
                'volumen_pct': calc_variation(
                    float(current_row.volumen_total) if current_row.volumen_total else 0,
                    float(previous_row.volumen_total) if previous_row.volumen_total else 0
                )
            }

        # Obtener top períodos fiscales del mes (solo para filtro por evento)
        top_periodos = []
        if filter_type == 'event':
            top_periodos_query = f"""
            SELECT
              CONCAT(YEAR, '-', LPAD(CAST(MONTH AS STRING), 2, '0')) as periodo_fiscal,
              COUNTIF(EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success') as emisiones,
              COUNT(DISTINCT CASE WHEN EVENT_TYPE = 'SERPRO-Emission' AND SERPRO_STATUS = 'success'
                THEN CUS_CUST_ID END) as sellers
            FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
            WHERE FORMAT_DATE('%Y-%m', EVENT_DATE) = '{periodo}'
              AND YEAR IS NOT NULL AND MONTH IS NOT NULL
            GROUP BY periodo_fiscal
            ORDER BY emisiones DESC
            LIMIT 10
            """
            top_periodos_job = client.query(top_periodos_query)
            for p in top_periodos_job.result():
                top_periodos.append({
                    'periodo_fiscal': p.periodo_fiscal,
                    'emisiones': p.emisiones,
                    'sellers': p.sellers
                })

        # Construir respuesta
        data = {
            'periodo': periodo,
            'periodo_anterior': periodo_anterior,
            'filter_type': filter_type,
            'current': {
                'sellers_emitieron': current_row.sellers_emitieron,
                'sellers_pagaron': current_row.sellers_pagaron,
                'cantidad_emisiones': current_row.cantidad_emisiones,
                'cantidad_pagos': current_row.cantidad_pagos,
                'emisiones_error': current_row.emisiones_error,
                'emisiones_ya_pagadas': current_row.emisiones_ya_pagadas,
                'volumen_total': float(current_row.volumen_total) if current_row.volumen_total else 0,
                'ticket_promedio': float(current_row.ticket_promedio) if current_row.ticket_promedio else 0,
                'fecha_primera_actividad': current_row.fecha_primera_actividad.isoformat() if current_row.fecha_primera_actividad else None,
                'fecha_ultima_actividad': current_row.fecha_ultima_actividad.isoformat() if current_row.fecha_ultima_actividad else None,
                'tasa_conversion_eventos': round(current_row.cantidad_pagos * 100.0 / current_row.cantidad_emisiones, 2) if current_row.cantidad_emisiones > 0 else 0,
                'tasa_conversion_sellers': round(current_row.sellers_pagaron * 100.0 / current_row.sellers_emitieron, 2) if current_row.sellers_emitieron > 0 else 0
            },
            'previous': {
                'sellers_emitieron': previous_row.sellers_emitieron if previous_row else None,
                'sellers_pagaron': previous_row.sellers_pagaron if previous_row else None,
                'cantidad_emisiones': previous_row.cantidad_emisiones if previous_row else None,
                'cantidad_pagos': previous_row.cantidad_pagos if previous_row else None,
                'volumen_total': float(previous_row.volumen_total) if previous_row and previous_row.volumen_total else None,
                'ticket_promedio': float(previous_row.ticket_promedio) if previous_row and previous_row.ticket_promedio else None
            } if previous_row else None,
            'variaciones': variaciones if previous_row else None,
            'top_periodos_fiscales': top_periodos
        }

        return jsonify(data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/metrics/nextsteps', methods=['GET'])
def get_nextsteps_metrics():
    """
    Obtiene métricas para decisiones estratégicas (next steps)
    """
    # Métricas de cohortes y retención
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
      SELECT DISTINCT
        e.CUS_CUST_ID,
        FORMAT_DATE('%Y-%m', DATE_TRUNC(e.EVENT_DATE, MONTH)) as mes_actividad,
        c.cohort_mes,
        DATE_DIFF(DATE_TRUNC(e.EVENT_DATE, MONTH), DATE_TRUNC(PARSE_DATE('%Y-%m', c.cohort_mes), MONTH), MONTH) as meses_desde_cohort
      FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS` e
      INNER JOIN seller_first_month c ON e.CUS_CUST_ID = c.CUS_CUST_ID
      WHERE e.EVENT_TYPE IN ('SERPRO-Emission', 'Payment')
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

    # Métricas de engagement (días activos)
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

    # Métricas de períodos pendientes por usuario
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
        print("Ejecutando query de cohortes...")
        cohort_job = client.query(cohort_query)
        cohort_results = list(cohort_job.result())
        print(f"Cohortes obtenidas: {len(cohort_results)}")

        print("Ejecutando query de engagement...")
        engagement_job = client.query(engagement_query)
        engagement_results = list(engagement_job.result())
        print(f"Engagement results: {len(engagement_results)}")

        print("Ejecutando query de pendientes...")
        pending_job = client.query(pending_query)
        pending_results = list(pending_job.result())
        print(f"Pendientes results: {len(pending_results)}")

        # Procesar cohortes
        cohorts = []
        for row in cohort_results:
            retention_mes_1 = round(row.mes_1 * 100.0 / row.sellers_cohort, 2) if row.sellers_cohort > 0 else 0
            retention_mes_2 = round(row.mes_2 * 100.0 / row.sellers_cohort, 2) if row.sellers_cohort > 0 else 0
            retention_mes_3 = round(row.mes_3 * 100.0 / row.sellers_cohort, 2) if row.sellers_cohort > 0 else 0

            cohorts.append({
                'cohort_mes': row.cohort_mes,
                'sellers_cohort': row.sellers_cohort,
                'retention': {
                    'mes_0': 100.0,
                    'mes_1': retention_mes_1,
                    'mes_2': retention_mes_2,
                    'mes_3': retention_mes_3
                }
            })

        # Procesar engagement
        if engagement_results:
            engagement_row = engagement_results[0]
            engagement = {
                'sellers_1_dia': engagement_row.sellers_1_dia if engagement_row.sellers_1_dia else 0,
                'sellers_2_3_dias': engagement_row.sellers_2_3_dias if engagement_row.sellers_2_3_dias else 0,
                'sellers_4_7_dias': engagement_row.sellers_4_7_dias if engagement_row.sellers_4_7_dias else 0,
                'sellers_8_plus_dias': engagement_row.sellers_8_plus_dias if engagement_row.sellers_8_plus_dias else 0
            }
        else:
            engagement = {
                'sellers_1_dia': 0,
                'sellers_2_3_dias': 0,
                'sellers_4_7_dias': 0,
                'sellers_8_plus_dias': 0
            }

        # Procesar pendientes
        if pending_results:
            pending_row = pending_results[0]
            pendientes = {
                'sellers_0_pendientes': pending_row.sellers_0_pendientes if pending_row.sellers_0_pendientes else 0,
                'sellers_1_pendiente': pending_row.sellers_1_pendiente if pending_row.sellers_1_pendiente else 0,
                'sellers_2_3_pendientes': pending_row.sellers_2_3_pendientes if pending_row.sellers_2_3_pendientes else 0,
                'sellers_4_6_pendientes': pending_row.sellers_4_6_pendientes if pending_row.sellers_4_6_pendientes else 0,
                'sellers_7_plus_pendientes': pending_row.sellers_7_plus_pendientes if pending_row.sellers_7_plus_pendientes else 0,
                'promedio_pendientes': float(pending_row.promedio_pendientes) if pending_row.promedio_pendientes else 0
            }
        else:
            pendientes = {
                'sellers_0_pendientes': 0,
                'sellers_1_pendiente': 0,
                'sellers_2_3_pendientes': 0,
                'sellers_4_6_pendientes': 0,
                'sellers_7_plus_pendientes': 0,
                'promedio_pendientes': 0
            }

        print("Todas las queries completadas exitosamente")
        return jsonify({
            'cohorts': cohorts,
            'engagement': engagement,
            'pendientes': pendientes
        })

    except Exception as e:
        print(f"ERROR en nextsteps: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'details': traceback.format_exc()}), 500


@app.route('/api/pendings/summary', methods=['GET'])
def get_pendings_summary():
    """
    Obtiene resumen general de notificaciones (pendings)
    """
    query = """
    WITH pendings_totals AS (
      SELECT
        COUNTIF(event = 'created' AND reason = 'success') as total_enviadas,
        COUNTIF(event = 'deleted' AND reason IN ('success', 'success_web')) as total_pagadas_desde_notif,
        COUNTIF(event = 'deleted' AND reason = 'dismiss') as total_descartadas,
        COUNT(DISTINCT user_id) as sellers_unicos
      FROM `meli-bi-data.SBOX_SBOXMERCH.DIM_PENDINGS`
      WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
    ),
    tiempo_pago AS (
      SELECT
        AVG(TIMESTAMP_DIFF(published, created_at, DAY)) as dias_promedio
      FROM `meli-bi-data.SBOX_SBOXMERCH.DIM_PENDINGS`
      WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
        AND event = 'deleted'
        AND reason IN ('success', 'success_web')
    ),
    pagos_reales AS (
      SELECT
        COUNT(*) as total_pagos_reales,
        COUNT(DISTINCT CUS_CUST_ID) as sellers_pagos_reales
      FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
      WHERE EVENT_TYPE = 'Payment'
        AND EVENT_DATE IS NOT NULL
        AND (CAST(YEAR AS INT64) > 2025 OR (CAST(YEAR AS INT64) = 2025 AND CAST(MONTH AS INT64) >= 12))
    )
    SELECT
      p.total_enviadas,
      p.total_pagadas_desde_notif,
      p.total_descartadas,
      pr.total_pagos_reales,
      p.sellers_unicos,
      pr.sellers_pagos_reales,
      ROUND((p.total_pagadas_desde_notif * 100.0 / NULLIF(p.total_enviadas, 0)), 2) as tasa_conversion_notif,
      ROUND((p.total_pagadas_desde_notif * 100.0 / NULLIF(pr.total_pagos_reales, 0)), 2) as tasa_conversion_pagos,
      ROUND(tp.dias_promedio, 1) as tiempo_promedio_dias
    FROM pendings_totals p
    CROSS JOIN tiempo_pago tp
    CROSS JOIN pagos_reales pr
    """

    try:
        query_job = client.query(query)
        results = list(query_job.result())

        if not results:
            return jsonify({'error': 'No se encontraron datos'}), 404

        row = results[0]

        return jsonify({
            'total_enviadas': row.total_enviadas,
            'total_pagadas_desde_notif': row.total_pagadas_desde_notif,
            'total_pagos_reales': row.total_pagos_reales,
            'total_descartadas': row.total_descartadas,
            'sellers_unicos': row.sellers_unicos,
            'sellers_pagos_reales': row.sellers_pagos_reales,
            'tasa_conversion_notif': float(row.tasa_conversion_notif) if row.tasa_conversion_notif else 0,
            'tasa_conversion_pagos': float(row.tasa_conversion_pagos) if row.tasa_conversion_pagos else 0,
            'tiempo_promedio_dias': float(row.tiempo_promedio_dias) if row.tiempo_promedio_dias else 0
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/pendings/monthly', methods=['GET'])
def get_pendings_monthly():
    """
    Obtiene evolución mensual de notificaciones (sin desglose por criticidad)
    """
    query = """
    WITH enviadas AS (
      SELECT
        FORMAT_TIMESTAMP('%Y-%m', created_at) as periodo,
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as sellers_unicos
      FROM `meli-bi-data.SBOX_SBOXMERCH.DIM_PENDINGS`
      WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
        AND event = 'created'
        AND reason = 'success'
      GROUP BY periodo
    ),
    pagadas AS (
      SELECT
        FORMAT_TIMESTAMP('%Y-%m', published) as periodo,
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as sellers_unicos
      FROM `meli-bi-data.SBOX_SBOXMERCH.DIM_PENDINGS`
      WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
        AND event = 'deleted'
        AND reason IN ('success', 'success_web')
      GROUP BY periodo
    ),
    descartadas AS (
      SELECT
        FORMAT_TIMESTAMP('%Y-%m', published) as periodo,
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as sellers_unicos
      FROM `meli-bi-data.SBOX_SBOXMERCH.DIM_PENDINGS`
      WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
        AND event = 'deleted'
        AND reason = 'dismiss'
      GROUP BY periodo
    ),
    pagos_reales AS (
      SELECT
        FORMAT_DATE('%Y-%m', EVENT_DATE) as periodo,
        COUNT(*) as total,
        COUNT(DISTINCT CUS_CUST_ID) as sellers_unicos
      FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
      WHERE EVENT_TYPE = 'Payment'
        AND EVENT_DATE IS NOT NULL
        AND (CAST(YEAR AS INT64) > 2025 OR (CAST(YEAR AS INT64) = 2025 AND CAST(MONTH AS INT64) >= 12))
      GROUP BY periodo
    ),
    all_periods AS (
      SELECT DISTINCT periodo FROM (
        SELECT periodo FROM enviadas
        UNION DISTINCT
        SELECT periodo FROM pagadas
        UNION DISTINCT
        SELECT periodo FROM descartadas
        UNION DISTINCT
        SELECT periodo FROM pagos_reales
      )
    )
    SELECT
      a.periodo,
      IFNULL(e.total, 0) as notificaciones_enviadas,
      IFNULL(e.sellers_unicos, 0) as sellers_enviadas,
      IFNULL(p.total, 0) as pagos_desde_notificacion,
      IFNULL(p.sellers_unicos, 0) as sellers_pagadas,
      IFNULL(d.total, 0) as descartadas,
      IFNULL(d.sellers_unicos, 0) as sellers_descartadas,
      IFNULL(pr.total, 0) as pagos_reales,
      IFNULL(pr.sellers_unicos, 0) as sellers_pagos_reales,
      ROUND((IFNULL(p.total, 0) * 100.0 / NULLIF(IFNULL(e.total, 0), 0)), 2) as tasa_conversion_notif,
      ROUND((IFNULL(p.total, 0) * 100.0 / NULLIF(IFNULL(pr.total, 0), 0)), 2) as tasa_conversion_pagos
    FROM all_periods a
    LEFT JOIN enviadas e ON a.periodo = e.periodo
    LEFT JOIN pagadas p ON a.periodo = p.periodo
    LEFT JOIN descartadas d ON a.periodo = d.periodo
    LEFT JOIN pagos_reales pr ON a.periodo = pr.periodo
    WHERE a.periodo IS NOT NULL
    ORDER BY a.periodo
    """

    try:
        query_job = client.query(query)
        results = query_job.result()

        data = []
        for row in results:
            data.append({
                'periodo': row.periodo,
                'notificaciones_enviadas': row.notificaciones_enviadas,
                'pagos_desde_notificacion': row.pagos_desde_notificacion,
                'descartadas': row.descartadas,
                'pagos_reales': row.pagos_reales,
                'tasa_conversion_notif': float(row.tasa_conversion_notif) if row.tasa_conversion_notif else 0,
                'tasa_conversion_pagos': float(row.tasa_conversion_pagos) if row.tasa_conversion_pagos else 0
            })

        return jsonify({'data': data})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/pendings/comparison', methods=['GET'])
def get_pendings_comparison():
    """
    Compara notificaciones vs pagos reales en BT_MP_DAS_TAX_EVENTS
    Para ver cuántos de los que "pagaron desde notificación" realmente completaron el pago fiscal
    """
    query = """
    WITH pagos_desde_notif AS (
      SELECT
        FORMAT_TIMESTAMP('%Y-%m', published) as periodo,
        COUNT(*) as total_pagos_notif,
        COUNT(DISTINCT user_id) as sellers_pagos_notif
      FROM `meli-bi-data.SBOX_SBOXMERCH.DIM_PENDINGS`
      WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
        AND event = 'deleted'
        AND reason IN ('success', 'success_web')
      GROUP BY periodo
    ),
    pagos_reales AS (
      SELECT
        FORMAT_DATE('%Y-%m', EVENT_DATE) as periodo,
        COUNT(*) as total_pagos_reales,
        COUNT(DISTINCT CUS_CUST_ID) as sellers_pagos_reales
      FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
      WHERE EVENT_TYPE = 'Payment'
        AND EVENT_DATE IS NOT NULL
        AND (CAST(YEAR AS INT64) > 2025 OR (CAST(YEAR AS INT64) = 2025 AND CAST(MONTH AS INT64) >= 12))
      GROUP BY periodo
    )
    SELECT
      COALESCE(n.periodo, r.periodo) as periodo,
      IFNULL(n.total_pagos_notif, 0) as pagos_desde_notif,
      IFNULL(n.sellers_pagos_notif, 0) as sellers_notif,
      IFNULL(r.total_pagos_reales, 0) as pagos_reales_tax,
      IFNULL(r.sellers_pagos_reales, 0) as sellers_tax,
      ROUND((IFNULL(n.total_pagos_notif, 0) * 100.0 / NULLIF(IFNULL(r.total_pagos_reales, 0), 0)), 2) as pct_notif_vs_real
    FROM pagos_desde_notif n
    FULL OUTER JOIN pagos_reales r ON n.periodo = r.periodo
    WHERE COALESCE(n.periodo, r.periodo) IS NOT NULL
    ORDER BY periodo
    """

    try:
        query_job = client.query(query)
        results = query_job.result()

        data = []
        for row in results:
            data.append({
                'periodo': row.periodo,
                'pagos_desde_notif': row.pagos_desde_notif,
                'sellers_notif': row.sellers_notif,
                'pagos_reales_tax': row.pagos_reales_tax,
                'sellers_tax': row.sellers_tax,
                'pct_notif_vs_real': float(row.pct_notif_vs_real) if row.pct_notif_vs_real else 0
            })

        return jsonify({'data': data})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
