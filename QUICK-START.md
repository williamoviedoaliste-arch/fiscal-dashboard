# 🚀 Quick Start - Deployment Rápido

## Opción 1: Deployment Automático (Recomendado)

```bash
# Ejecutar desde la raíz del proyecto
./deploy-quick-start.sh
```

Este script te guiará paso a paso en el deployment.

---

## Opción 2: Deployment Manual Rápido

### Paso 1: Backend en Google Cloud Run (5 minutos)

```bash
# 1. Configurar proyecto
gcloud config set project TU_PROYECTO_ID

# 2. Habilitar servicios
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 3. Desplegar
cd backend
gcloud run deploy fiscal-dashboard-backend \
    --source . \
    --region us-central1 \
    --allow-unauthenticated

# Guardar la URL que aparece al final
```

### Paso 2: Frontend en Vercel (3 minutos)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Crear archivo de configuración
cd frontend
echo "REACT_APP_API_URL=TU_URL_DE_CLOUD_RUN" > .env.production

# 3. Desplegar
vercel --prod
```

### Paso 3: Actualizar CORS (2 minutos)

Edita `backend/app.py` y agrega tu URL de Vercel:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://tu-app.vercel.app"  # 👈 Tu URL de Vercel
        ]
    }
})
```

Vuelve a desplegar el backend:
```bash
cd backend
gcloud run deploy fiscal-dashboard-backend --source .
```

---

## URLs Resultantes

Después del deployment tendrás:

- **Backend**: `https://fiscal-dashboard-backend-xxxxx-uc.a.run.app`
- **Frontend**: `https://tu-dashboard.vercel.app`

Comparte el link del frontend con quien quieras! 🎉

---

## Troubleshooting Rápido

### Error: "No module named 'gunicorn'"
```bash
cd backend
pip install gunicorn
pip freeze > requirements.txt
```

### Error: "CORS policy"
Asegúrate de haber actualizado el CORS en `backend/app.py` con tu URL de Vercel

### Error: "Cannot connect to backend"
Verifica que la variable `REACT_APP_API_URL` en Vercel apunte a tu backend de Cloud Run

---

## Costos

- **Google Cloud Run**: Gratis hasta 2M requests/mes (~$0-5/mes uso normal)
- **Vercel**: Gratis (Plan Hobby)
- **BigQuery**: Gratis primer 1TB queries/mes

**Total: $0-5 USD/mes** para uso ligero/medio

---

## Siguiente Nivel

Una vez funcionando:

1. **Dominio Personalizado**: Configura `dashboard.tuempresa.com` en Vercel
2. **CI/CD**: Conecta GitHub para deployments automáticos
3. **Monitoreo**: Activa Google Cloud Monitoring
4. **Seguridad**: Agrega autenticación si es necesario

---

Para más detalles, ver [DEPLOYMENT.md](./DEPLOYMENT.md)
