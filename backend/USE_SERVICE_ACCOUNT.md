# Cómo usar el Service Account

## Si ya tienes el archivo de credenciales (fiscal-dashboard-key.json):

### 1. Colocar las credenciales
```bash
# Copiar el archivo a la carpeta backend
cp /ruta/al/archivo/fiscal-dashboard-key.json backend/credentials.json
```

### 2. Configurar localmente
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/Users/woviedoalist/fiscal-dashboard/backend/credentials.json"
```

### 3. Ejecutar el backend
```bash
cd backend
python app.py
```

## Para deployment en Cloud Run:

### Opción 1: Usar el service account en el deployment
```bash
gcloud run deploy fiscal-dashboard-backend \
    --source . \
    --region us-central1 \
    --service-account=fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com \
    --allow-unauthenticated
```

### Opción 2: Incluir credenciales como variable de entorno
```bash
# Convertir JSON a base64
cat credentials.json | base64 > credentials.b64

# Desplegar con la variable
gcloud run deploy fiscal-dashboard-backend \
    --source . \
    --region us-central1 \
    --set-env-vars="GCP_CREDENTIALS=$(cat credentials.b64)" \
    --allow-unauthenticated
```

## Verificar que funciona:
```bash
# Test local
curl http://localhost:5000/api/metrics/monthly

# Test en producción
curl https://tu-url-de-cloud-run.run.app/api/metrics/monthly
```
