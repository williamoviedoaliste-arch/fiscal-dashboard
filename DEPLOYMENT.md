# Guía de Deployment - Dashboard de Métricas Fiscales

## Arquitectura de Deployment

- **Backend**: Google Cloud Run (Flask + BigQuery)
- **Frontend**: Vercel (React)

---

## Paso 1: Preparar el Backend en Google Cloud Run

### 1.1 Instalar Google Cloud CLI

Si no lo tienes instalado:
```bash
# macOS
brew install --cask google-cloud-sdk

# Inicializar
gcloud init
```

### 1.2 Configurar el Proyecto

```bash
# Autenticarte
gcloud auth login

# Seleccionar o crear proyecto
gcloud config set project TU_PROYECTO_ID

# Habilitar servicios necesarios
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable bigquery.googleapis.com
```

### 1.3 Crear Service Account para BigQuery

```bash
# Crear service account
gcloud iam service-accounts create fiscal-dashboard-sa \
    --display-name="Fiscal Dashboard Service Account"

# Dar permisos de BigQuery
gcloud projects add-iam-policy-binding TU_PROYECTO_ID \
    --member="serviceAccount:fiscal-dashboard-sa@TU_PROYECTO_ID.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataViewer"

gcloud projects add-iam-policy-binding TU_PROYECTO_ID \
    --member="serviceAccount:fiscal-dashboard-sa@TU_PROYECTO_ID.iam.gserviceaccount.com" \
    --role="roles/bigquery.jobUser"
```

### 1.4 Desplegar el Backend

```bash
cd backend

# Build y deploy a Cloud Run
gcloud run deploy fiscal-dashboard-backend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --service-account=fiscal-dashboard-sa@TU_PROYECTO_ID.iam.gserviceaccount.com \
    --set-env-vars="FLASK_ENV=production" \
    --memory=512Mi \
    --cpu=1 \
    --timeout=300
```

**Importante**: Al terminar, recibirás una URL como:
```
https://fiscal-dashboard-backend-xxxxx-uc.a.run.app
```
Guarda esta URL, la necesitarás para el frontend.

---

## Paso 2: Configurar CORS en el Backend

Antes de desplegar, actualiza el archivo `backend/app.py` con el dominio de Vercel:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://tu-dashboard.vercel.app"  # Agregar tu dominio de Vercel
        ]
    }
})
```

---

## Paso 3: Desplegar el Frontend en Vercel

### 3.1 Preparar el Frontend

Crear archivo de configuración para producción:

```bash
cd frontend
```

Crear `.env.production`:
```bash
REACT_APP_API_URL=https://fiscal-dashboard-backend-xxxxx-uc.a.run.app
```

### 3.2 Desplegar en Vercel

#### Opción A: Via CLI (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar
cd frontend
vercel --prod
```

Durante el deploy, Vercel te preguntará:
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

#### Opción B: Via GitHub

1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Selecciona tu repositorio
5. Configura:
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Agrega variable de entorno:
   - Name: `REACT_APP_API_URL`
   - Value: `https://fiscal-dashboard-backend-xxxxx-uc.a.run.app`

---

## Paso 4: Actualizar Frontend para usar la API en Producción

Modifica `frontend/src/App.jsx`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Usar API_URL en todas las llamadas fetch
fetch(`${API_URL}/api/metrics/monthly`)
```

---

## Paso 5: Verificar el Deployment

### Backend:
```bash
curl https://fiscal-dashboard-backend-xxxxx-uc.a.run.app/api/health
```

### Frontend:
Visita: `https://tu-dashboard.vercel.app`

---

## Costos Estimados

### Google Cloud Run (Backend):
- **Gratis hasta**: 2 millones de peticiones/mes
- **Memoria**: 512Mi - ~$0.00001/segundo activo
- **CPU**: 1 vCPU - ~$0.000025/segundo activo
- **Estimado mensual**: $0-5 USD (uso ligero)

### BigQuery:
- **Consultas**: $5 por TB procesado
- **Almacenamiento**: $0.02 por GB/mes
- **Tu caso**: Probablemente gratis (1TB gratis/mes de queries)

### Vercel (Frontend):
- **Plan Hobby**: Gratis
- 100GB bandwidth/mes
- Deployments ilimitados

**Total estimado**: $0-10 USD/mes

---

## Alternativa: Todo en Google Cloud

Si prefieres mantener todo en Google Cloud:

### Frontend en Cloud Storage + Cloud CDN

```bash
# Build del frontend
cd frontend
npm run build

# Crear bucket
gsutil mb -l us-central1 gs://fiscal-dashboard-frontend

# Configurar como sitio web
gsutil web set -m index.html -e index.html gs://fiscal-dashboard-frontend

# Subir archivos
gsutil -m cp -r build/* gs://fiscal-dashboard-frontend

# Hacer público
gsutil iam ch allUsers:objectViewer gs://fiscal-dashboard-frontend
```

URL: `https://storage.googleapis.com/fiscal-dashboard-frontend/index.html`

---

## Troubleshooting

### Error: CORS
Asegúrate de agregar el dominio de Vercel en `backend/app.py`

### Error: BigQuery Authentication
Verifica que el service account tenga los permisos correctos

### Error: Frontend no conecta al Backend
Verifica que `REACT_APP_API_URL` esté configurada correctamente en Vercel

---

## Comandos Útiles

```bash
# Ver logs del backend
gcloud run services logs read fiscal-dashboard-backend --limit 50

# Actualizar backend
cd backend
gcloud run deploy fiscal-dashboard-backend --source .

# Actualizar frontend (Vercel)
cd frontend
vercel --prod

# Ver deployments en Vercel
vercel ls
```

---

## Seguridad

### Agregar Autenticación (Opcional)

Si quieres proteger el dashboard:

1. **Cloud Run**: Agregar Cloud IAP
2. **Vercel**: Usar Vercel Password Protection (Plan Pro)
3. **Custom**: Implementar JWT en Flask + React

---

## Próximos Pasos

1. ✅ Desplegar backend en Cloud Run
2. ✅ Desplegar frontend en Vercel
3. ✅ Verificar funcionamiento
4. 🔄 Configurar dominio personalizado (opcional)
5. 🔄 Configurar CI/CD automático (opcional)
6. 🔄 Agregar autenticación (opcional)
