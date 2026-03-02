# 📊 Dashboard de Métricas Fiscales DAS (Brasil)

Dashboard interactivo para visualizar y analizar métricas de **emisiones y pagos fiscales** del sistema DAS (Documento de Arrecadação do Simples Nacional) en Brasil, con datos provenientes de BigQuery.

![Dashboard Preview](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask)
![BigQuery](https://img.shields.io/badge/BigQuery-Enabled-4285F4?logo=google-cloud)

---

## 📚 Documentación Completa

**Base de Conocimiento**: Documentación detallada en [`/docs`](./docs)

| Documento | Descripción | Para Quién |
|-----------|-------------|------------|
| [**GUIA_DAS_BRASIL.md**](./docs/GUIA_DAS_BRASIL.md) | Contexto de negocio, qué es DAS, flujo fiscal | Product Managers, Nuevos usuarios |
| [**DICCIONARIO_TABLAS.md**](./docs/DICCIONARIO_TABLAS.md) | Estructura de tablas BigQuery, campos, ejemplos | Data Analysts, Developers |
| [**QUERIES_DASHBOARD.md**](./docs/QUERIES_DASHBOARD.md) | Todas las queries SQL del dashboard | Data Analysts, Developers |
| [**KPIS_PRINCIPALES.md**](./docs/KPIS_PRINCIPALES.md) | 15 KPIs con razonamiento y interpretación | Tax team, Leadership |

**Guías Técnicas**:
- [QUICKSTART.md](./QUICKSTART.md) - Inicio rápido local

---

## 🌟 Características

- **📈 Visualización de Métricas**: Gráficos interactivos de emisiones, pagos y conversión
- **📅 Vista Mensual**: Análisis detallado mes a mes con comparación de períodos
- **👥 Análisis de Sellers**: Seguimiento de sellers nuevos vs recurrentes
- **💰 Volumen Monetario**: Visualización del volumen de pagos procesados
- **🎯 Tasa de Conversión**: Análisis de conversión de emisiones a pagos
- **🔔 Efectividad del Sistema de Pendings**: Análisis de conversión desde pendings de pago
- **📊 Comparación Pendings vs Pagos Reales**: Cruce de datos entre DIM_PENDINGS y BT_MP_DAS_TAX_EVENTS
- **💡 Insights Automáticos**: Análisis inteligente con alertas y recomendaciones
- **📖 Documentación Integrada**: Guía completa dentro del dashboard

## 🏗️ Arquitectura

### Backend
- **Framework**: Flask 3.0
- **Base de Datos**: Google BigQuery
- **API**: RESTful endpoints
- **CORS**: Configurado para frontend

### Frontend
- **Framework**: React 18
- **Gráficos**: Recharts
- **Estilos**: CSS personalizado
- **Estado**: React Hooks

## 🚀 Quick Start

### Prerrequisitos

- Python 3.9+
- Node.js 16+
- Cuenta de Google Cloud con BigQuery habilitado
- Credenciales de BigQuery

### Instalación Local

#### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar credenciales de BigQuery
# Copia tu archivo de credenciales a: backend/credentials.json

# Iniciar servidor
python app.py
```

El backend estará disponible en `http://localhost:5000`

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar aplicación
npm start
```

El frontend estará disponible en `http://localhost:3000`

## 📊 Estructura del Proyecto

```
fiscal-dashboard/
├── docs/                              # 📚 Documentación completa
│   ├── GUIA_DAS_BRASIL.md            # Contexto de negocio
│   ├── DICCIONARIO_TABLAS.md         # Schema de BigQuery
│   ├── QUERIES_DASHBOARD.md          # Queries SQL
│   └── KPIS_PRINCIPALES.md           # KPIs y razonamiento
│
├── backend/
│   ├── app.py                        # API Flask con endpoints
│   ├── run_server.py                 # Script de inicio
│   ├── requirements.txt              # Dependencias Python
│   ├── Dockerfile                    # Container para deployment
│   └── .dockerignore
│
├── frontend/
│   ├── src/
│   │   ├── components/               # Componentes React
│   │   │   ├── Dashboard.jsx         # Dashboard principal
│   │   │   ├── GeneralTab.jsx        # Vista general
│   │   │   ├── MonthlyTab.jsx        # Vista mensual
│   │   │   ├── PendingsTab.jsx       # Uso de Pendings
│   │   │   ├── PendingsConversionFunnel.jsx  # Funnel 3 etapas
│   │   │   └── ...
│   │   ├── App.js                    # Aplicación principal
│   │   └── index.css                 # Estilos
│   ├── public/
│   ├── package.json
│   └── .env.local                    # Config (no versionado)
│
├── QUICKSTART.md                      # Inicio rápido local
├── start.sh                           # Script de inicio
└── README.md                          # Este archivo
```

## 🎨 Características del Dashboard

### Pestaña General
- Resumen de métricas principales
- Gráfico de evolución de emisiones
- Análisis de pagos (total, correctos, sellers)
- Distribución de sellers (nuevos vs recurrentes)
- Tasa de conversión de pagos
- Volumen monetario procesado

### Pestaña Mensual
- Selector de mes
- Comparación con período anterior
- Métricas detalladas del mes
- Insights automáticos con análisis de:
  - Crecimiento de emisiones
  - Evolución de pagos
  - Volumen monetario
  - Tasa de conversión
  - Comportamiento de sellers

### Pestaña Uso de Pendings
- Resumen de efectividad del sistema de pendings
- **Funnel de Conversión** (3 etapas):
  1. Pendings creados
  2. Pagos totales Tax (desde 12/2025)
  3. Pagos desde pending
- Evolución mensual de pendings por criticidad
- Tasa de conversión por nivel de criticidad
- Comparación entre pagos desde pending vs pagos reales en sistema fiscal
- Análisis de:
  - Pendings creados en DIM_PENDINGS
  - Pagos realizados después de crear pending
  - Pendings cerrados (success, dismiss)
  - Efectividad del sistema (% de pagos atribuibles a pendings)

**⚠️ Nota**: Solo incluye pagos fiscales desde **Diciembre 2025** en adelante

### Pestaña Documentación
- Explicación de conceptos clave
- Guía de uso del dashboard
- Casos de uso prácticos
- Glosario de términos

## 📈 Métricas Disponibles

### Métricas de Emisiones y Pagos
- **Emisiones**: Total de emisiones fiscales exitosas
- **Pagos**: Total de pagos realizados
- **Pagos Correctos**: Pagos realizados en el período fiscal correcto
- **Sellers Únicos**: Cantidad de sellers activos
- **Conversión**: Ratio de emisiones que resultan en pagos
- **Volumen**: Monto total procesado en BRL

### Métricas del Sistema de Pendings
- **Pendings Creados**: Total de pendings de pago DAS creados en el sistema
- **Pagos desde Pending**: Sellers que pagaron después de crearse el pending
- **Tasa de Conversión de Pendings**: % de pagos totales atribuibles a pendings (66.31%)
- **Pendings por Criticidad**: Análisis por nivel de urgencia (HIGH, MEDIUM, LOW)
- **Tiempo hasta Pago**: Días promedio desde creación de pending hasta pago
- **Comparación Pendings vs Tax**: Correlación entre pagos desde pending y pagos reales fiscales

**Fuente de Datos**:
- Pendings: `SBOX_SBOXMERCH.DIM_PENDINGS` (content_id: `mp.sellers.generic_pendings.das_payment_pendings`)
- Pagos Fiscales: `WHOWNER.BT_MP_DAS_TAX_EVENTS` (EVENT_TYPE: `Payment`)

## 🔧 Configuración

### Variables de Entorno

#### Backend
```bash
FLASK_ENV=development  # development o production
```

#### Frontend
```bash
REACT_APP_API_URL=http://localhost:5000  # URL del backend
```

## 📝 API Endpoints

### Métricas de Emisiones y Pagos

#### GET /api/metrics/monthly
Retorna métricas agregadas por mes

#### GET /api/metrics/sellers
Retorna análisis de sellers (nuevos vs recurrentes)

#### GET /api/metrics/month/:periodo
Retorna métricas detalladas de un mes específico con comparación

### Métricas del Sistema de Pendings

#### GET /api/pendings/summary
Retorna resumen general del sistema de pendings
- Total de pendings creados
- Pagos totales Tax (desde 12/2025)
- Pagos desde pending (atribuibles al sistema)
- Tasa de conversión de pendings (66.31%)
- Sellers únicos notificados vs que pagaron

**⚠️ Filtro temporal**: Solo incluye pagos donde `YEAR/MONTH >= 12/2025`

#### GET /api/pendings/monthly
Retorna evolución mensual de pendings
- Desglosado por criticidad (HIGH, MEDIUM, LOW)
- Pendings creados por mes
- Pagos atribuibles a pendings
- Tasa de conversión por nivel de criticidad

#### GET /api/pendings/comparison
Retorna comparación entre pendings y pagos reales fiscales
- Pagos desde pending vs pagos en BT_MP_DAS_TAX_EVENTS
- Porcentaje de pagos reales atribuibles a pendings
- Análisis de efectividad del sistema

## 🎯 Casos de Uso

1. **Análisis de Tendencias**: Identificar patrones en emisiones y pagos fiscales
2. **Monitoreo de Compliance**: Seguimiento de la tasa de conversión emisión → pago
3. **Análisis de Sellers**: Evaluar retención y adquisición de sellers activos
4. **Efectividad de Pendings**: Medir impacto del sistema de pendings en compliance
5. **Reporting Ejecutivo**: Dashboards para stakeholders (Tax, Product, Leadership)
6. **Alertas Tempranas**: Identificar caídas en conversión o anomalías en pagos
7. **Optimización de Producto**: Datos para mejorar UX del sistema de pendings

**Ver casos de uso detallados en**: [KPIS_PRINCIPALES.md](./docs/KPIS_PRINCIPALES.md)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🙏 Agradecimientos

- Recharts por la librería de visualización
- Google Cloud por la infraestructura

## 📞 Soporte y Recursos

### Documentación
- 📘 [Guía DAS Brasil](./docs/GUIA_DAS_BRASIL.md) - Contexto de negocio
- 📋 [Diccionario de Tablas](./docs/DICCIONARIO_TABLAS.md) - Schema BigQuery
- 🔍 [Queries del Dashboard](./docs/QUERIES_DASHBOARD.md) - Todas las queries SQL
- 📈 [KPIs Principales](./docs/KPIS_PRINCIPALES.md) - Métricas y razonamiento

### Guías Técnicas
- [Quickstart](./QUICKSTART.md) - Inicio rápido local

### Contacto
- **Owner**: william.oviedoaliste@mercadolibre.cl
- **Repo**: https://github.com/williamoviedoaliste-arch/fiscal-dashboard

---

## 🔑 Conceptos Clave

### Términos de Negocio
- **DAS**: Documento de Arrecadação do Simples Nacional (impuesto unificado Brasil)
- **SERPRO**: Sistema federal que genera las emisiones fiscales
- **Pendings**: Sistema de Mercado Pago para alertar a sellers sobre acciones pendientes
- **Tasa de Conversión**: Emisiones fiscales que resultan en pago
- **Tasa de Conversión de Pendings**: Pagos atribuibles al sistema de pendings (66.31%)

### Conceptos Técnicos Críticos

**⚠️ Diferencia entre EVENT_DATE y MONTH/YEAR**:

La tabla `BT_MP_DAS_TAX_EVENTS` tiene **dos tipos de fechas**:

1. **`EVENT_DATE`** (DATE): Cuándo **ocurre realmente** el evento
   - Fecha en que se ejecuta el Payment o Emission
   - Ejemplo: `EVENT_DATE = '2026-02-18'` → Pago realizado el 18 de febrero

2. **`MONTH` / `YEAR`** (STRING): Período fiscal al que **corresponde**
   - El mes/año que se está pagando o emitiendo
   - Ejemplo: `MONTH = '01', YEAR = '2026'` → Pagando el DAS de enero 2026

**Ejemplo Real**:
```sql
-- Seller pagó el DAS de Enero 2026 el día 18 de Febrero
EVENT_TYPE = 'Payment'
EVENT_DATE = '2026-02-18'  ← Cuándo pagó
MONTH = '01'                ← Mes fiscal que está pagando
YEAR = '2026'               ← Año fiscal
TAX_PERIOD = '2026-01'      ← Período fiscal
```

**Implicación**: Un pago del período "Enero 2026" (`MONTH='01'`) puede tener `EVENT_DATE` en febrero porque se paga después del cierre del mes.

---

Ver glosario completo en [GUIA_DAS_BRASIL.md](./docs/GUIA_DAS_BRASIL.md)

---

📊 Proyecto: Fiscal Dashboard - Métricas DAS Brasil
📅 Última actualización: 2026-02-11
