# 📑 Guía de Pestañas del Dashboard

El dashboard ahora está organizado en **3 pestañas principales** para una mejor navegación y análisis de datos.

---

## 📊 Pestaña 1: GENERAL

Vista general del producto con métricas agregadas de todo el período.

### Contenido:

#### 1. **Resumen Ejecutivo**
Tres tarjetas principales:
- 📈 **Total Emisiones**: Todas las emisiones exitosas del período
- 💳 **Total Pagos**: Todos los pagos procesados
- 💰 **Volumen Total**: Suma monetaria de todos los pagos

#### 2. **Métricas de Emisiones**
- Gráfico de evolución mensual de emisiones
- Cantidad de eventos y sellers únicos que emiten
- Identificación del mes con pico de emisiones

#### 3. **Métricas de Pagos**
- Gráfico de evolución mensual de pagos
- Volumen monetario procesado
- Cantidad de sellers que pagan

#### 4. **Métricas de Sellers**
- **Sellers Nuevos vs Recurrentes**: Composición mensual
- **Tasas de Conversión**: Evolución de conversión de eventos y sellers
- Identificación del mejor mes en términos de conversión

#### 5. **Volumen Monetario**
- Gráfico de área mostrando la evolución del volumen
- Total procesado en el período

---

## 📅 Pestaña 2: MENSUAL

Análisis detallado de un mes específico con capacidad de filtrado.

### Filtros Disponibles:

#### **Selector de Mes**
Dropdown con todos los meses disponibles (2025-08 a 2026-02)

#### **Tipo de Filtro**
- **📅 Fecha de Evento**: Filtra por el mes en que ocurrió la acción (EVENT_DATE)
  - Ejemplo: Emisiones y pagos que se ejecutaron en Enero 2026

- **📋 Período Fiscal**: Filtra por el mes fiscal (YEAR/MONTH)
  - Ejemplo: Emisiones y pagos correspondientes al período fiscal Enero 2026
  - Un período fiscal puede ser emitido/pagado en diferentes fechas

### Métricas Mostradas:

#### 1. **Tarjetas Principales**
- 📈 **Emisiones**: Cantidad total y sellers únicos
- 💳 **Pagos**: Cantidad total y sellers únicos
- 💰 **Volumen**: Total monetario y ticket promedio
- 🎯 **Conversión**: Tasas de conversión (eventos y sellers)

#### 2. **Estados de Emisión**
Desglose de emisiones por estado:
- ✅ **Exitosas**: Emisiones SERPRO con status 'success'
- ❌ **Errores**: Emisiones con status 'error'
- 💚 **Ya Pagadas**: Emisiones con status 'already_paid'

#### 3. **Top Períodos Fiscales** (solo en filtro por fecha de evento)
Tabla mostrando los 10 períodos fiscales más emitidos en ese mes:
- Período Fiscal
- Cantidad de Emisiones
- Cantidad de Sellers
- % del Total

**Ejemplo de Insight**:
En Enero 2026, el 70% de las emisiones correspondieron al período fiscal Diciembre 2025.

#### 4. **Información Adicional**
- Primera actividad del mes
- Última actividad del mes

---

## 🎯 Pestaña 3: NEXT STEPS

Métricas estratégicas para tomar decisiones de producto y marketing.

### 1. **Análisis de Retención por Cohorte**

#### **Gráfico de Líneas - Retención**
Muestra el % de sellers que regresan en meses posteriores a su primer actividad.

**Cohortes mostradas**: Últimos 6 meses
- **Mes 0**: 100% (baseline)
- **Mes 1**: % de sellers que regresaron al mes siguiente
- **Mes 2**: % de sellers que regresaron 2 meses después
- **Mes 3**: % de sellers que regresaron 3 meses después

#### **Tabla de Cohortes**
Detalle numérico de cada cohorte con:
- Cantidad de sellers en la cohorte
- Retención en cada mes subsiguiente

#### **Insight y Acción**
💡 **Recomendación**: Enfocarse en mejorar la retención del Mes 1 con campañas de re-engagement.

---

### 2. **Nivel de Engagement (Días Activos)**

#### **Gráfico de Barras**
Distribución de sellers según cuántos días han estado activos:
- 1 día
- 2-3 días
- 4-7 días
- 8+ días

#### **Insight y Acción**
💡 **Recomendación**: Los sellers con 8+ días activos son los más engaged. Identificar qué los motiva y replicarlo.

---

### 3. **Distribución de Períodos Pendientes**

#### **Gráfico de Barras**
Sellers agrupados por cantidad de períodos fiscales emitidos pero no pagados:
- 0 pendientes
- 1 pendiente
- 2-3 pendientes
- 4-6 pendientes
- 7+ pendientes

#### **Métrica Clave**
**Promedio de pendientes por seller**: Indica el nivel de morosidad promedio

#### **Insight y Acción**
⚠️ **Recomendación**: Priorizar recuperación de sellers con 4+ períodos pendientes (riesgo alto de churn).

---

### 4. **Próximos Pasos Recomendados**

Sección con 3 acciones concretas basadas en los datos:

#### **🔵 Campaña de Retención (Mes 1)**
Crear campaña de email/push para sellers que completaron su primer mes.
Ofrecer incentivos para segundo uso.

#### **🟢 Programa de Recuperación**
Focalizar en sellers con 4+ períodos pendientes.
Ofrecer planes de pago y recordatorios personalizados.

#### **🟡 Engagement de Power Users**
Identificar sellers más activos (8+ días).
Crear programa de referidos o embajadores.

---

## 🔄 Flujo de Uso Recomendado

### Para Análisis General:
1. **Pestaña General** → Ver estado global del producto
2. Identificar meses con mejor/peor performance
3. Analizar tendencias de emisiones, pagos y sellers

### Para Análisis Específico:
1. **Pestaña Mensual** → Seleccionar mes de interés
2. Alternar entre filtro de "Fecha de Evento" y "Período Fiscal"
3. Analizar estados de emisión y top períodos fiscales

### Para Decisiones Estratégicas:
1. **Pestaña Next Steps** → Revisar métricas de retención
2. Identificar cohortes con baja retención
3. Analizar distribución de pendientes
4. Implementar las acciones recomendadas

---

## 🎓 Conceptos Clave

### **Fecha de Evento vs Período Fiscal**

**Fecha de Evento (EVENT_DATE)**:
- Cuándo el usuario ejecutó la acción
- Ejemplo: El 05/01/2026 el seller emitió una factura

**Período Fiscal (YEAR/MONTH)**:
- A qué mes de impuesto corresponde
- Ejemplo: La factura emitida el 05/01/2026 puede ser del período fiscal 12/2025

**Caso Real**:
```
Seller ABC:
├─ 01/02/2026 → Emitió período fiscal 12/2025
├─ 01/02/2026 → Emitió período fiscal 01/2026
├─ 02/02/2026 → Pagó período fiscal 12/2025
└─ 05/02/2026 → Pagó período fiscal 01/2026
```

### **Retención de Cohortes**

Una **cohorte** es un grupo de sellers que tuvieron su primera actividad en el mismo mes.

**Ejemplo**:
- Cohorte Sep 2025: 23,185 sellers
- Mes 0: 100% (todos activos en septiembre)
- Mes 1: 12.11% regresaron en octubre
- Mes 2: X% regresaron en noviembre
- Mes 3: Y% regresaron en diciembre

### **Engagement**

Mide cuántos días diferentes un seller ha estado activo.

**Interpretación**:
- **1 día**: Seller probó el servicio una vez
- **2-7 días**: Seller casual
- **8+ días**: Seller engaged/power user

---

## 💡 Tips de Navegación

1. **Usa General** para presentaciones ejecutivas
2. **Usa Mensual** para investigar anomalías o validar hipótesis
3. **Usa Next Steps** para planificación trimestral/anual
4. Los gráficos son interactivos - hover para ver detalles
5. Alterna los filtros en Mensual para diferentes perspectivas

---

¿Preguntas? Revisa el [README.md](README.md) o el [QUICKSTART.md](QUICKSTART.md).
