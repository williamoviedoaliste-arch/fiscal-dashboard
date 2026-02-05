# 📊 Dashboard de Métricas Fiscales

Dashboard interactivo para visualizar y analizar métricas de emisiones y pagos fiscales, con datos provenientes de BigQuery.

![Dashboard Preview](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask)
![BigQuery](https://img.shields.io/badge/BigQuery-Enabled-4285F4?logo=google-cloud)

## 🌟 Características

- **📈 Visualización de Métricas**: Gráficos interactivos de emisiones, pagos y conversión
- **📅 Vista Mensual**: Análisis detallado mes a mes con comparación de períodos
- **👥 Análisis de Sellers**: Seguimiento de sellers nuevos vs recurrentes
- **💰 Volumen Monetario**: Visualización del volumen de pagos procesados
- **🎯 Tasa de Conversión**: Análisis de conversión de emisiones a pagos
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

## 🌐 Deployment en Producción

### Opción Rápida (10 minutos)

```bash
./deploy-quick-start.sh
```

### Manual

Ver guías detalladas:
- **Quick Start**: [QUICK-START.md](./QUICK-START.md)
- **Deployment Completo**: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Arquitectura de Producción

- **Backend**: Google Cloud Run
- **Frontend**: Vercel
- **Base de Datos**: BigQuery

## 📊 Estructura del Proyecto

```
fiscal-dashboard/
├── backend/
│   ├── app.py              # API Flask
│   ├── requirements.txt    # Dependencias Python
│   ├── Dockerfile          # Container para Cloud Run
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── App.js          # Aplicación principal
│   │   └── index.css       # Estilos
│   ├── public/
│   └── package.json
├── DEPLOYMENT.md           # Guía de deployment
├── QUICK-START.md         # Quick start
└── README.md              # Este archivo
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

### Pestaña Documentación
- Explicación de conceptos clave
- Guía de uso del dashboard
- Casos de uso prácticos
- Glosario de términos

## 📈 Métricas Disponibles

- **Emisiones**: Total de emisiones fiscales exitosas
- **Pagos**: Total de pagos realizados
- **Pagos Correctos**: Pagos realizados en el período fiscal correcto
- **Sellers Únicos**: Cantidad de sellers activos
- **Conversión**: Ratio de emisiones que resultan en pagos
- **Volumen**: Monto total procesado en BRL

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

### GET /api/metrics/monthly
Retorna métricas agregadas por mes

### GET /api/metrics/sellers
Retorna análisis de sellers (nuevos vs recurrentes)

### GET /api/metrics/month/:periodo
Retorna métricas detalladas de un mes específico con comparación

## 🎯 Casos de Uso

1. **Análisis de Tendencias**: Identificar patrones en emisiones y pagos
2. **Monitoreo de Conversión**: Seguimiento de la tasa de conversión
3. **Análisis de Sellers**: Evaluar retención y adquisición
4. **Reporting Ejecutivo**: Dashboards para stakeholders
5. **Alertas Tempranas**: Identificar caídas o anomalías

## 💰 Costos Estimados

- **Google Cloud Run**: $0-5/mes (gratis hasta 2M requests)
- **Vercel**: $0 (plan Hobby)
- **BigQuery**: Gratis (primer 1TB queries/mes)

**Total: ~$0-5 USD/mes** para uso normal

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto fue desarrollado con asistencia de Claude (Anthropic).

## 🙏 Agradecimientos

- Recharts por la librería de visualización
- Google Cloud por la infraestructura
- Vercel por el hosting del frontend

## 📞 Soporte

Para preguntas o soporte:
- Consulta la [Documentación](./DEPLOYMENT.md)
- Revisa los Issues en GitHub

---

🤖 Generado con [Claude Code](https://claude.com/claude-code)
