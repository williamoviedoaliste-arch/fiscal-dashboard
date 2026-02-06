# 📋 Propuesta: Análisis de Pendings/Notificaciones en Dashboard

## 🎯 Objetivo

Integrar métricas de efectividad de notificaciones (pendings) al dashboard para entender:
- ¿Qué tan efectivas son las notificaciones para impulsar pagos?
- ¿Cuántos sellers pagan directamente desde la notificación vs otros medios?
- ¿Cuál es la tasa de conversión de notificaciones a pagos?

---

## 📊 Fuente de Datos

**Tabla:** `SBOX_SBOXMERCH.DIM_PENDINGS`
**Filtro:** `content_id = 'mp.sellers.generic_pendings.das_payment_pendings'`

### Estados Identificados

| Estado | Significado |
|--------|-------------|
| `event=created, reason=success` | Notificación creada y enviada al seller |
| `event=deleted, reason=success` | Seller pagó **directamente desde la notificación** |
| `event=deleted, reason=success_web` | Seller pagó **directamente desde la notificación** (web) |
| `event=deleted, reason=dismiss` | Seller eliminó notificación **O** sistema la removió (expiró o pagó por fuera) |

---

## 🔢 Métricas Propuestas

### Métricas Principales

1. **Total Notificaciones Enviadas**
   - Query: `COUNT(*) WHERE event='created' AND reason='success'`
   - Agrupación: Por mes
   - Utilidad: Volumen de notificaciones generadas

2. **Pagos desde Notificación**
   - Query: `COUNT(*) WHERE event='deleted' AND reason IN ('success', 'success_web')`
   - Agrupación: Por mes
   - Utilidad: Cuántos sellers pagaron directamente desde la pending

3. **Tasa de Conversión de Notificaciones**
   - Fórmula: `(Pagos desde Notificación / Total Notificaciones) * 100`
   - Formato: Porcentaje
   - Utilidad: Efectividad de las notificaciones

4. **Notificaciones Descartadas**
   - Query: `COUNT(*) WHERE event='deleted' AND reason='dismiss'`
   - Agrupación: Por mes
   - **Limitación conocida:** No distingue entre "seller dismisseó" vs "sistema eliminó"
   - Utilidad: Volumen de notificaciones que no resultaron en pago directo

5. **Notificaciones Pendientes/Activas**
   - Query: Notificaciones creadas que no tienen evento `deleted`
   - Cálculo: `Creadas - (Pagadas desde notif + Descartadas)`
   - Utilidad: Notificaciones que aún están activas

### Métricas Secundarias

6. **Tiempo Promedio hasta Pago**
   - Query: `AVG(TIMESTAMP_DIFF(deleted_timestamp, created_timestamp, DAY))`
   - Filtro: Solo `reason='success'`
   - Utilidad: ¿Cuántos días tarda un seller en pagar desde que recibe notificación?

7. **Distribución de Pagos por Días desde Notificación**
   - Buckets: 0-1 días, 2-7 días, 8-15 días, 16-30 días, 30+ días
   - Utilidad: Identificar el momento óptimo de re-notificación

---

## 📈 Visualizaciones Propuestas

### Opción A: Nueva Pestaña "Notificaciones"

Crear una pestaña dedicada con:

1. **Gráfico de Línea: Evolución Mensual**
   - Eje X: Periodo (mes)
   - Eje Y: Cantidad
   - Líneas:
     - Notificaciones enviadas (azul)
     - Pagos desde notificación (verde)
     - Descartadas (rojo)
   - Beneficio: Ver tendencia temporal

2. **Gráfico de Barras: Tasa de Conversión**
   - Eje X: Periodo (mes)
   - Eje Y: Porcentaje (%)
   - Beneficio: Identificar meses con mejor/peor conversión

3. **Tarjetas de Resumen (Cards)**
   ```
   ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
   │ Total Notificaciones│  │  Pagos desde Notif  │  │  Tasa de Conversión │
   │                     │  │                     │  │                     │
   │      196,535        │  │      11,785         │  │        6.0%         │
   └─────────────────────┘  └─────────────────────┘  └─────────────────────┘

   ┌─────────────────────┐  ┌─────────────────────┐
   │    Descartadas      │  │   Aún Pendientes    │
   │                     │  │                     │
   │      49,116         │  │      135,634        │
   └─────────────────────┘  └─────────────────────┘
   ```

4. **Gráfico de Embudo (Funnel)**
   ```
   Notificaciones Enviadas: 196,535 ████████████████████ 100%
   Aún Activas:             135,634 █████████████        69%
   Descartadas:              49,116 █████                25%
   Pagos desde Notif:        11,785 █                     6%
   ```

5. **Gráfico de Distribución: Tiempo hasta Pago**
   - Histograma mostrando cuántos pagos ocurren en cada rango de días
   - Ayuda a optimizar timing de re-notificaciones

### Opción B: Integración en Pestaña "General"

Agregar sección "Efectividad de Notificaciones" con:
- 2 tarjetas resumen (Total notificaciones, Tasa de conversión)
- 1 gráfico pequeño de evolución mensual

**Recomendación:** Opción A - Nueva pestaña dedicada, porque:
- No sobrecarga la vista General
- Permite análisis profundo de notificaciones
- Facilita futuras expansiones del análisis

---

## 🔧 Implementación Técnica

### Backend: Nuevos Endpoints

#### 1. `/api/pendings/monthly`
```json
{
  "periodo": "2024-08",
  "notificaciones_enviadas": 15234,
  "pagos_desde_notificacion": 987,
  "descartadas": 3456,
  "pendientes_activas": 10791,
  "tasa_conversion": 6.48
}
```

**Query aproximado:**
```sql
WITH enviadas AS (
  SELECT
    FORMAT_TIMESTAMP('%Y-%m', created_at) as periodo,
    COUNT(*) as total
  FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
  WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
    AND event = 'created'
    AND reason = 'success'
  GROUP BY periodo
),
pagadas AS (
  SELECT
    FORMAT_TIMESTAMP('%Y-%m', updated_at) as periodo,
    COUNT(*) as total
  FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
  WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
    AND event = 'deleted'
    AND reason IN ('success', 'success_web')
  GROUP BY periodo
),
descartadas AS (
  SELECT
    FORMAT_TIMESTAMP('%Y-%m', updated_at) as periodo,
    COUNT(*) as total
  FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
  WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
    AND event = 'deleted'
    AND reason = 'dismiss'
  GROUP BY periodo
)
SELECT
  e.periodo,
  e.total as notificaciones_enviadas,
  IFNULL(p.total, 0) as pagos_desde_notificacion,
  IFNULL(d.total, 0) as descartadas,
  e.total - IFNULL(p.total, 0) - IFNULL(d.total, 0) as pendientes_activas,
  ROUND((IFNULL(p.total, 0) / e.total) * 100, 2) as tasa_conversion
FROM enviadas e
LEFT JOIN pagadas p ON e.periodo = p.periodo
LEFT JOIN descartadas d ON e.periodo = d.periodo
ORDER BY e.periodo
```

#### 2. `/api/pendings/time-to-payment`
```json
{
  "0-1_dias": 2345,
  "2-7_dias": 4567,
  "8-15_dias": 2890,
  "16-30_dias": 1234,
  "30+_dias": 749
}
```

#### 3. `/api/pendings/summary`
```json
{
  "total_enviadas": 196535,
  "total_pagadas_desde_notif": 11785,
  "total_descartadas": 49116,
  "total_pendientes": 135634,
  "tasa_conversion_global": 6.0,
  "tiempo_promedio_dias": 12.5
}
```

### Frontend: Nuevos Componentes

1. **`PendingsTab.jsx`**: Nueva pestaña completa
2. **`PendingsSummaryCards.jsx`**: Tarjetas de resumen
3. **`PendingsEvolutionChart.jsx`**: Gráfico de evolución mensual
4. **`PendingsConversionChart.jsx`**: Tasa de conversión por mes
5. **`PendingsFunnelChart.jsx`**: Embudo de conversión
6. **`TimeToPaymentChart.jsx`**: Distribución de tiempo hasta pago

---

## 🎨 Mockup de UI

```
┌──────────────────────────────────────────────────────────┐
│  Tabs: [General] [Mensual] [Documentación] [Notificaciones] │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Efectividad de Notificaciones              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Enviadas │  │  Pagadas │  │Conversión│  │Pendientes│   │
│  │ 196,535  │  │  11,785  │  │   6.0%   │  │ 135,634  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Evolución Mensual de Notificaciones                │  │
│  │                                                        │  │
│  │  [Gráfico de líneas: Enviadas, Pagadas, Descartadas] │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────────────┐ │
│  │ Tasa de Conversión  │  │  Tiempo hasta Pago          │ │
│  │ [Gráfico barras %]  │  │  [Histograma distribución]  │ │
│  └─────────────────────┘  └─────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Embudo de Conversión                          │  │
│  │  [Gráfico embudo mostrando flujo]                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Insights Automáticos Propuestos

Similar a la pestaña Mensual, agregar sección de insights:

### Ejemplos de Insights

1. **Conversión Baja**
   - Condición: `tasa_conversion < 5%`
   - Mensaje: "⚠️ La tasa de conversión de notificaciones está por debajo del 5%. Considera revisar el timing o contenido de las notificaciones."

2. **Conversión Alta**
   - Condición: `tasa_conversion > 10%`
   - Mensaje: "✅ Excelente tasa de conversión de notificaciones (>10%). Las notificaciones están siendo muy efectivas."

3. **Alto Volumen de Descartadas**
   - Condición: `descartadas / enviadas > 30%`
   - Mensaje: "⚠️ Más del 30% de las notificaciones están siendo descartadas. Esto puede indicar notificaciones irrelevantes o timing inadecuado."

4. **Notificaciones Pendientes Acumuladas**
   - Condición: `pendientes_activas > enviadas_mes_actual * 3`
   - Mensaje: "⚠️ Hay un alto volumen de notificaciones pendientes acumuladas. Considera estrategias de re-engagement."

5. **Pago Rápido desde Notificación**
   - Condición: `tiempo_promedio_dias < 7`
   - Mensaje: "✅ Los sellers pagan en promedio en menos de 7 días desde la notificación. Las notificaciones son oportunas."

---

## 🔄 Cruce con Métricas Existentes

### Análisis Combinado Potencial

1. **Notificaciones vs Pagos Reales**
   - Cruzar `DIM_PENDINGS` con `BT_MP_DAS_TAX_EVENTS`
   - Pregunta: De los que pagaron desde notificación, ¿cuántos efectivamente completaron el pago fiscal?
   - Métrica: Tasa de éxito real = `(Pagos fiscales completados / Pagos desde notificación) * 100`

2. **Sellers Nuevos vs Recurrentes en Notificaciones**
   - Pregunta: ¿Los sellers nuevos responden mejor a notificaciones que los recurrentes?
   - Análisis: Segmentar tasa de conversión por tipo de seller

3. **Timing Óptimo**
   - Pregunta: ¿Cuántos días después de una emisión debemos enviar la notificación?
   - Análisis: Correlacionar emisiones con notificaciones efectivas

---

## ⚠️ Limitaciones Conocidas

1. **Ambigüedad en "dismiss"**
   - No podemos distinguir si fue:
     - Seller que manualmente descartó la notificación
     - Sistema que la removió por expiración
     - Sistema que la removió porque pagó por fuera
   - **Recomendación:** Documentar esta limitación en el dashboard

2. **Pendientes Activas**
   - Calculamos como diferencia, no como estado explícito
   - Puede haber inconsistencias si hay otros estados no considerados

3. **Correlación Directa**
   - No tenemos una clave que une directamente una notificación con un pago en `BT_MP_DAS_TAX_EVENTS`
   - Solo podemos hacer análisis agregado, no tracking individual

---

## 📅 Plan de Implementación (Fases)

### Fase 1: MVP (Mínimo Viable)
**Tiempo estimado:** Lo que tome
**Incluye:**
- Endpoint `/api/pendings/summary`
- Endpoint `/api/pendings/monthly`
- Nueva pestaña "Notificaciones"
- 4 tarjetas de resumen
- Gráfico de evolución mensual
- Gráfico de tasa de conversión

### Fase 2: Análisis Avanzado
**Incluye:**
- Endpoint `/api/pendings/time-to-payment`
- Gráfico de tiempo hasta pago
- Embudo de conversión
- Insights automáticos

### Fase 3: Cruce de Datos
**Incluye:**
- Cruce con `BT_MP_DAS_TAX_EVENTS`
- Análisis de sellers nuevos vs recurrentes
- Correlación emisiones → notificaciones → pagos

---

## ❓ Preguntas para Iterar

1. **Visualizaciones:**
   - ¿Prefieres nueva pestaña "Notificaciones" o integrar en "General"?
   - ¿Qué gráficos te parecen más útiles?
   - ¿Algún análisis adicional que te gustaría ver?

2. **Métricas:**
   - ¿Hay otras métricas que considerarías importantes?
   - ¿La limitación del "dismiss" es aceptable o necesitas más desglose?

3. **Prioridades:**
   - ¿Implementamos todo (Fase 1+2+3) o empezamos con MVP?
   - ¿Qué análisis es el más crítico para tu caso de uso?

4. **Cruce de Datos:**
   - ¿Es importante cruzar con `BT_MP_DAS_TAX_EVENTS` o el análisis aislado es suficiente?

5. **Timing:**
   - ¿Necesitas esto antes o después del deployment con service account?

---

## 📝 Próximos Pasos

Una vez que iteremos esta propuesta y lleguemos a un consenso:

1. ✅ Definir alcance final (qué entra en la implementación)
2. ✅ Crear queries optimizadas en BigQuery
3. ✅ Implementar endpoints en backend
4. ✅ Crear componentes de frontend
5. ✅ Agregar tests con datos reales
6. ✅ Documentar en README
7. ✅ Commit y push a GitHub

---

**¿Qué te parece esta propuesta? ¿Por dónde empezamos a iterar?** 🚀
