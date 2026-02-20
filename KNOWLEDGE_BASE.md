# 📚 Knowledge Base - Fiscal Dashboard

**Base de Conocimiento Completa del Dashboard de Métricas Fiscales DAS (Brasil)**

---

## 📖 Índice

1. [¿Qué es este proyecto?](#qué-es-este-proyecto)
2. [Arquitectura Técnica](#arquitectura-técnica)
3. [Fuentes de Datos](#fuentes-de-datos)
4. [Métricas y KPIs](#métricas-y-kpis)
5. [Cómo Usar el Dashboard](#cómo-usar-el-dashboard)
6. [Cómo Hacer Consultas Personalizadas](#cómo-hacer-consultas-personalizadas)
7. [Agregar Nuevas Métricas](#agregar-nuevas-métricas)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [FAQs](#faqs)

---

## 🎯 ¿Qué es este proyecto?

### Descripción
Dashboard interactivo para visualizar y analizar métricas de **emisiones y pagos fiscales** del sistema DAS (Documento de Arrecadação do Simples Nacional) en Brasil.

### Objetivo
Proporcionar visibilidad en tiempo real sobre:
- Emisiones fiscales generadas por Mercado Pago
- Pagos efectivos realizados por sellers
- Efectividad de notificaciones push (Pendings)
- Tendencias y patrones de comportamiento

### Usuarios Target
- Equipos de Tax/Compliance
- Product Managers
- Data Analysts
- Leadership (para reportes ejecutivos)

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│         Frontend (React 18)             │
│  - Puerto: 3000                         │
│  - Recharts para visualizaciones        │
│  - Axios para API calls                 │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTP/REST
                  │
┌─────────────────▼───────────────────────┐
│         Backend (Flask 3.0)             │
│  - Puerto: 5000                         │
│  - Flask-CORS habilitado                │
│  - Google Cloud SDK para auth           │
└─────────────────┬───────────────────────┘
                  │
                  │ BigQuery Client
                  │
┌─────────────────▼───────────────────────┐
│         Google BigQuery                 │
│  - Proyecto: meli-bi-data               │
│  - Tablas: BT_MP_DAS_TAX_EVENTS         │
│           DIM_PENDINGS                  │
└─────────────────────────────────────────┘
```

### Componentes Principales

#### **Backend** (`/backend`)
- **Lenguaje**: Python 3.9+
- **Framework**: Flask 3.0
- **Dependencias clave**:
  - `google-cloud-bigquery`: Cliente de BigQuery
  - `flask-cors`: Manejo de CORS
  - `gunicorn`: Production server

#### **Frontend** (`/frontend`)
- **Lenguaje**: JavaScript (ES6+)
- **Framework**: React 18
- **Librerías clave**:
  - `recharts`: Gráficos y visualizaciones
  - `axios`: HTTP client
  - `react-scripts`: Tooling

---

## 🗄️ Fuentes de Datos

### BigQuery - Proyecto: `meli-bi-data`

#### Tabla 1: `WHOWNER.BT_MP_DAS_TAX_EVENTS`

**Descripción**: Eventos de emisiones y pagos fiscales DAS.

**Campos Principales**:
```sql
- EVENT_TYPE: Tipo de evento
  - 'SERPRO-Emission': Emisión fiscal generada
  - 'Payment': Pago fiscal realizado

- EVENT_DATE: Fecha del evento (YYYY-MM-DD)
- MONTH: Mes fiscal (STRING: '01', '02', ..., '12')
- YEAR: Año fiscal (STRING: '2025', '2026')
- CUS_CUST_ID: ID del seller
- AMOUNT: Monto en reales (BRL)
- TAX_PERIOD: Período fiscal (YYYY-MM)
```

**Ejemplo de Query**:
```sql
SELECT
  EVENT_TYPE,
  COUNT(*) as total_events,
  SUM(CAST(AMOUNT AS FLOAT64)) as total_amount
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_DATE >= '2025-12-01'
GROUP BY EVENT_TYPE;
```

#### Tabla 2: `SBOX_SBOXMERCH.DIM_PENDINGS`

**Descripción**: Notificaciones push enviadas a sellers.

**Campos Principales**:
```sql
- content_id: ID del tipo de notificación
  - Filtrar por: 'mp.sellers.generic_pendings.das_payment_pendings'

- user_id: ID del seller
- status: Estado de la notificación
  - 'created': Notificación enviada
  - 'deleted': Notificación cerrada/interactuada

- created_at: Timestamp de creación
- deleted_at: Timestamp de cierre
- substatus: Detalle de cómo se cerró
  - 'success': Acción completada (pago realizado)
  - 'success_web': Acción desde web
  - 'dismiss': Descartada por usuario
```

**Ejemplo de Query**:
```sql
SELECT
  status,
  COUNT(*) as total
FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
  AND created_at >= '2025-12-01'
GROUP BY status;
```

---

## 📊 Métricas y KPIs

### Vista General (Tab: General)

#### 1. **Emisiones Totales**
- **Definición**: Total de documentos fiscales generados
- **Query**:
```sql
SELECT COUNT(*)
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'SERPRO-Emission'
  AND EVENT_DATE IS NOT NULL
```

#### 2. **Pagos Totales**
- **Definición**: Total de pagos fiscales realizados
- **Query**:
```sql
SELECT COUNT(*)
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'Payment'
  AND EVENT_DATE IS NOT NULL
```

#### 3. **Tasa de Conversión**
- **Definición**: % de emisiones que resultaron en pago
- **Fórmula**: `(Pagos / Emisiones) * 100`

#### 4. **Sellers Únicos**
- **Definición**: Cantidad de sellers que pagaron impuestos
- **Query**:
```sql
SELECT COUNT(DISTINCT CUS_CUST_ID)
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'Payment'
```

#### 5. **Volumen Total Pagado**
- **Definición**: Suma de montos pagados en BRL
- **Query**:
```sql
SELECT SUM(CAST(AMOUNT AS FLOAT64))
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'Payment'
```

### Vista Mensual (Tab: Mensual)

Mismas métricas pero filtradas por período específico con comparación vs período anterior.

**Ejemplo para Enero 2026**:
```sql
-- Período actual
WHERE YEAR = '2026' AND MONTH = '01'

-- Período anterior (Diciembre 2025)
WHERE YEAR = '2025' AND MONTH = '12'
```

### Vista de Pendings (Tab: Uso de Pendings)

**⚠️ IMPORTANTE**: Esta vista filtra solo pagos desde **Diciembre 2025** en adelante.

#### 1. **Notificaciones Enviadas**
- **Definición**: Total de notificaciones push enviadas
- **Query**:
```sql
SELECT COUNT(*)
FROM `SBOX_SBOXMERCH.DIM_PENDINGS`
WHERE content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
  AND status = 'created'
```

#### 2. **Pagos Totales Tax (desde 12/2025)**
- **Definición**: Total de pagos fiscales desde diciembre 2025
- **Query**:
```sql
SELECT COUNT(*)
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'Payment'
  AND (CAST(YEAR AS INT64) > 2025
       OR (CAST(YEAR AS INT64) = 2025 AND CAST(MONTH AS INT64) >= 12))
```

#### 3. **Pagos desde Notificación**
- **Definición**: Pagos realizados después de recibir notificación
- **Query**: Join entre notificaciones y pagos
```sql
SELECT COUNT(*)
FROM `SBOX_SBOXMERCH.DIM_PENDINGS` p
INNER JOIN `WHOWNER.BT_MP_DAS_TAX_EVENTS` e
  ON CAST(p.user_id AS STRING) = e.CUS_CUST_ID
WHERE p.content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
  AND p.status = 'deleted'
  AND e.EVENT_TYPE = 'Payment'
  AND e.EVENT_DATE >= DATE(p.created_at)
  AND (CAST(e.YEAR AS INT64) > 2025
       OR (CAST(e.YEAR AS INT64) = 2025 AND CAST(e.MONTH AS INT64) >= 12))
```

#### 4. **Tasa de Conversión de Notificaciones**
- **Fórmula**: `(Pagos desde Notificación / Pagos Totales Tax) * 100`
- **Valor esperado**: ~66% (según datos actuales)

#### 5. **Funnel de Conversión**
```
Notificaciones Enviadas (196,535)
         ↓
Pagos Totales Tax - 12/2025+ (18,138)  [9.23% del total notificaciones]
         ↓
Pagos desde Notificación (12,027)      [66.31% de pagos totales]
```

---

## 🖥️ Cómo Usar el Dashboard

### Levantar Localmente

#### Opción 1: Script Automático
```bash
cd fiscal-dashboard
./start.sh
```

#### Opción 2: Manual

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate
python run_server.py
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm install  # solo primera vez
npm start
```

**Acceder**: http://localhost:3000

---

### Navegar el Dashboard

#### **Tab 1: 📊 General**
Vista de resumen con:
- Tarjetas de KPIs principales
- Gráfico de Emisiones vs Pagos (línea temporal)
- Gráfico de Conversión mensual
- Gráfico de Volumen pagado

**¿Cuándo usarla?**
- Para obtener un overview rápido
- Para reportes ejecutivos
- Para identificar tendencias generales

#### **Tab 2: 📅 Mensual**
Análisis profundo de un mes específico:
- Selector de período (YYYY-MM)
- Comparación con mes anterior
- Delta porcentual automático
- Insights sobre cambios significativos

**¿Cuándo usarla?**
- Para análisis de un mes específico
- Para comparar períodos
- Para encontrar anomalías mes a mes

#### **Tab 3: 🔔 Uso de Pendings**
Efectividad de notificaciones:
- Resumen de notificaciones enviadas
- Funnel de conversión (3 etapas)
- Gráficos de evolución por criticidad
- Comparación notificaciones vs pagos reales

**¿Cuándo usarla?**
- Para medir efectividad de producto (notificaciones)
- Para optimizar estrategia de comunicación
- Para calcular ROI de notificaciones push

**⚠️ Nota**: Solo incluye pagos desde Diciembre 2025 en adelante.

#### **Tab 4: 📖 Documentación**
Guía de uso integrada en el dashboard.

---

## 🔍 Cómo Hacer Consultas Personalizadas

### Opción 1: Usar BigQuery Console Directamente

1. **Ir a BigQuery**: https://console.cloud.google.com/bigquery?project=meli-bi-data

2. **Ejemplo - Top 10 Sellers por Volumen Pagado**:
```sql
SELECT
  CUS_CUST_ID as seller_id,
  COUNT(*) as total_pagos,
  SUM(CAST(AMOUNT AS FLOAT64)) as volumen_total_brl,
  ROUND(AVG(CAST(AMOUNT AS FLOAT64)), 2) as promedio_por_pago
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
WHERE EVENT_TYPE = 'Payment'
  AND EVENT_DATE >= '2025-12-01'
GROUP BY CUS_CUST_ID
ORDER BY volumen_total_brl DESC
LIMIT 10;
```

3. **Ejemplo - Sellers que NO pagaron después de emisión**:
```sql
WITH sellers_con_emision AS (
  SELECT DISTINCT CUS_CUST_ID
  FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
  WHERE EVENT_TYPE = 'SERPRO-Emission'
),
sellers_con_pago AS (
  SELECT DISTINCT CUS_CUST_ID
  FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
  WHERE EVENT_TYPE = 'Payment'
)
SELECT e.CUS_CUST_ID as seller_id
FROM sellers_con_emision e
LEFT JOIN sellers_con_pago p
  ON e.CUS_CUST_ID = p.CUS_CUST_ID
WHERE p.CUS_CUST_ID IS NULL;
```

4. **Ejemplo - Efectividad de Notificaciones por Mes**:
```sql
SELECT
  FORMAT_DATE('%Y-%m', DATE(p.created_at)) as mes,
  COUNT(DISTINCT p.user_id) as sellers_notificados,
  COUNT(DISTINCT CASE
    WHEN p.status = 'deleted' AND e.EVENT_TYPE = 'Payment'
    THEN p.user_id
  END) as sellers_que_pagaron,
  ROUND(
    COUNT(DISTINCT CASE
      WHEN p.status = 'deleted' AND e.EVENT_TYPE = 'Payment'
      THEN p.user_id
    END) * 100.0 / COUNT(DISTINCT p.user_id),
  2) as tasa_conversion_pct
FROM `SBOX_SBOXMERCH.DIM_PENDINGS` p
LEFT JOIN `WHOWNER.BT_MP_DAS_TAX_EVENTS` e
  ON CAST(p.user_id AS STRING) = e.CUS_CUST_ID
  AND e.EVENT_DATE >= DATE(p.created_at)
WHERE p.content_id = 'mp.sellers.generic_pendings.das_payment_pendings'
  AND p.created_at >= '2025-12-01'
GROUP BY mes
ORDER BY mes DESC;
```

### Opción 2: Agregar al Dashboard

Ver sección [Agregar Nuevas Métricas](#agregar-nuevas-métricas)

---

## ➕ Agregar Nuevas Métricas

### Paso 1: Crear Endpoint en el Backend

**Archivo**: `backend/app.py`

```python
@app.route('/api/mi-nueva-metrica')
def mi_nueva_metrica():
    try:
        query = """
        SELECT
            campo1,
            campo2,
            COUNT(*) as total
        FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
        WHERE EVENT_TYPE = 'Payment'
        GROUP BY campo1, campo2
        """

        query_job = client.query(query)
        results = query_job.result()

        data = [dict(row) for row in results]
        return jsonify(data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### Paso 2: Crear Componente en el Frontend

**Archivo**: `frontend/src/components/MiNuevoGrafico.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MiNuevoGrafico() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/mi-nueva-metrica`);
        setData(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h3>Mi Nueva Métrica</h3>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="campo1" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}

export default MiNuevoGrafico;
```

### Paso 3: Agregar a una Pestaña

**Archivo**: `frontend/src/components/GeneralTab.jsx` (o crear nueva tab)

```javascript
import MiNuevoGrafico from './MiNuevoGrafico';

// Dentro del return del componente:
<MiNuevoGrafico />
```

### Paso 4: Reiniciar Servicios

```bash
# Detener servicios actuales
pkill -f "python run_server.py"
pkill -f "react-scripts start"

# Reiniciar
./start.sh
```

---

## 🚀 Deployment

### Opción 1: Local (Para Testing)
```bash
./start.sh
```
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Opción 2: Google Cloud Run (Recomendado)
```bash
./deploy-backend.sh
```
- Te dará una URL pública compartible
- Autoescalado incluido
- Solo deploy del backend (frontend se corre local)

### Opción 3: Fury (Meli Internal Platform)

**⚠️ Requiere**:
- Acceso a un proyecto en Fury
- Service Account configurado

**Pasos**:
1. Contactar admin de Fury para acceso
2. `fury install` (actualizar plugins)
3. `fury create-version`
4. Configurar Service Account en Fury Web UI

Ver guía completa: [FURY_DEPLOYMENT.md](FURY_DEPLOYMENT.md)

---

## 🔧 Troubleshooting

### Backend no inicia

**Síntoma**: Error al ejecutar `python run_server.py`

**Soluciones**:
```bash
# 1. Verificar virtualenv activo
which python  # debe mostrar ruta con /venv/

# 2. Reinstalar dependencias
pip install -r requirements.txt

# 3. Verificar credenciales BigQuery
gcloud auth application-default login
gcloud config set project meli-bi-data
```

---

### Frontend no carga datos

**Síntoma**: Dashboard muestra "Error al cargar datos"

**Checklist**:
1. ✅ Backend corriendo en puerto 5000
   ```bash
   curl http://localhost:5000/api/health
   # Debe retornar: {"status":"ok"}
   ```

2. ✅ CORS configurado correctamente
   - Verificar `backend/app.py` línea 8:
   ```python
   CORS(app, resources={r"/api/*": {"origins": "*"}})
   ```

3. ✅ Variable de entorno correcta
   - Verificar `frontend/.env.local`:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. ✅ No hay procesos zombies
   ```bash
   lsof -i :5000  # debe mostrar solo 1 proceso
   # Si hay múltiples, matar todos y reiniciar
   pkill -f "python run_server.py"
   ```

---

### Error de BigQuery: "Access Denied"

**Síntoma**: Error 403 en queries

**Soluciones**:
```bash
# 1. Re-autenticar
gcloud auth application-default login

# 2. Verificar proyecto correcto
gcloud config get-value project
# Debe mostrar: meli-bi-data

# 3. Si no, setear:
gcloud config set project meli-bi-data

# 4. Verificar permisos
# Contactar IT para:
# - BigQuery Data Viewer
# - BigQuery Job User
```

---

### Error: "No matching signature for operator >"

**Síntoma**: Error en queries que comparan YEAR/MONTH

**Causa**: YEAR y MONTH son STRING, no INT

**Solución**: Usar CAST
```sql
-- ❌ Incorrecto
WHERE YEAR > 2025

-- ✅ Correcto
WHERE CAST(YEAR AS INT64) > 2025
```

---

### Dashboard muestra datos antiguos/incorrectos

**Síntoma**: Métricas no coinciden con queries manuales

**Checklist**:
1. Limpiar cache del navegador (Cmd+Shift+R)
2. Verificar filtros de fecha en el código
3. Verificar que no haya queries cacheadas en BigQuery
4. Reiniciar backend (puede tener datos en memoria)

---

## ❓ FAQs

### ¿Por qué Pendings solo muestra datos desde 12/2025?

**R**: Decisión de negocio. Las notificaciones se lanzaron en diciembre 2025, por lo que solo tiene sentido medir efectividad desde esa fecha. Además, filtrar reduce el volumen de datos y mejora performance.

**Código relevante**: `backend/app.py` líneas 637-645, 725-733, 808-816

---

### ¿Puedo cambiar el filtro de fecha de Pendings?

**R**: Sí, modificar las queries en los endpoints:
- `/api/pendings/summary`
- `/api/pendings/monthly`
- `/api/pendings/comparison`

Buscar esta línea:
```sql
AND (CAST(YEAR AS INT64) > 2025 OR (CAST(YEAR AS INT64) = 2025 AND CAST(MONTH AS INT64) >= 12))
```

Cambiar `>= 12` por el mes deseado.

---

### ¿Cómo agregar autenticación?

**R**: Los componentes ya están creados pero desactivados. Ver guía:
[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)

**Pasos resumidos**:
1. Crear OAuth Client ID en Google Cloud Console
2. Configurar en `frontend/.env.local`
3. Descomentar/activar `AuthWrapper` y `Login` componentes

---

### ¿El dashboard funciona en tiempo real?

**R**: Sí y no.
- **Backend → BigQuery**: Sí, cada request consulta datos actuales
- **Frontend**: Carga datos al montar componentes (no polling automático)

Para tener "live updates", agregar polling:
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();  // recargar cada X minutos
  }, 60000);  // 1 minuto

  return () => clearInterval(interval);
}, []);
```

---

### ¿Puedo exportar los datos?

**R**: Opciones:
1. **Desde BigQuery**: Exportar resultados de query a CSV/JSON
2. **Agregar botón "Export"** en el dashboard:
```javascript
const exportToCSV = () => {
  const csv = data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.csv';
  a.click();
};
```

---

### ¿Qué pasa si BigQuery cambia el schema?

**R**: El dashboard se romperá. Monitorear:
1. Cambios en nombres de columnas
2. Cambios en tipos de datos
3. Deprecación de tablas

**Recomendación**: Crear alertas en BigQuery o subscribirse a notificaciones de cambios de schema.

---

### ¿Cómo agregar nuevos tipos de eventos?

**R**: Modificar filtros en queries. Actualmente solo se usan:
- `SERPRO-Emission`
- `Payment`

Para agregar otros eventos, verificar qué valores existen:
```sql
SELECT DISTINCT EVENT_TYPE, COUNT(*)
FROM `WHOWNER.BT_MP_DAS_TAX_EVENTS`
GROUP BY EVENT_TYPE;
```

---

### ¿Puedo conectar esto con Looker Studio?

**R**: Sí! Looker Studio puede conectarse directo a BigQuery.

**Pasos**:
1. Ir a https://lookerstudio.google.com/
2. Crear nuevo Data Source → BigQuery
3. Seleccionar `meli-bi-data` → Tablas
4. Crear dashboard visual
5. Compartir link

**Ventaja**: No necesitas mantener código React
**Desventaja**: Menos control sobre UX/interactividad

---

## 📚 Referencias Adicionales

### Documentos del Proyecto
- [README.md](README.md) - Overview general
- [QUICKSTART.md](QUICKSTART.md) - Inicio rápido
- [FURY_DEPLOYMENT.md](FURY_DEPLOYMENT.md) - Deploy en Fury
- [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) - Configurar OAuth
- [DEPLOYMENT_PROGRESS.md](DEPLOYMENT_PROGRESS.md) - Estado actual del proyecto

### BigQuery
- [Documentación de BigQuery](https://cloud.google.com/bigquery/docs)
- [SQL Reference](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax)
- [Optimización de Queries](https://cloud.google.com/bigquery/docs/best-practices-performance-overview)

### React + Recharts
- [React Docs](https://react.dev/)
- [Recharts Documentation](https://recharts.org/)
- [Axios Documentation](https://axios-http.com/)

### Flask
- [Flask Quickstart](https://flask.palletsprojects.com/en/3.0.x/quickstart/)
- [Flask-CORS](https://flask-cors.readthedocs.io/)

---

## 🤝 Contribuir

### Reportar Issues
1. Verificar que no esté duplicado
2. Incluir pasos para reproducir
3. Incluir logs/screenshots
4. Crear issue en GitHub

### Proponer Mejoras
1. Abrir issue describiendo la mejora
2. Esperar feedback
3. Crear branch desde `main`
4. Hacer PR con descripción clara

---

## 📞 Soporte

- **Owner**: william.oviedoaliste@mercadolibre.cl
- **Repo**: https://github.com/williamoviedoaliste-arch/fiscal-dashboard
- **Fury Admin**: Ramiro Paz (para acceso a Fury)

---

## 📝 Changelog

### v1.0.0 (2026-02-07)
- ✅ Dashboard inicial con 4 pestañas
- ✅ Integración BigQuery
- ✅ Funnel de conversión de Pendings
- ✅ Filtro temporal desde 12/2025
- ✅ Deployment scripts (Cloud Run, Fury)

---

**Última actualización**: 2026-02-11
**Versión**: 1.0.0
**Mantenido por**: William Oviedo Aliste

---

*💡 Tip: Para preguntas específicas no cubiertas aquí, revisar el código fuente directamente o consultar a través de GitHub Issues.*
