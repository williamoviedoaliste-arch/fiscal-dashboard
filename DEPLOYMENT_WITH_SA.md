# Deployment con Service Account - Guía del Usuario

Esta guía es para **después** de que el administrador haya configurado el service account.

---

## ✅ Pre-requisitos

Antes de comenzar, asegúrate de tener:

1. ✅ Archivo de credenciales: `fiscal-dashboard-credentials.json`
2. ✅ Email del service account: `fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com`
3. ✅ Confirmación del admin que los permisos están configurados

---

## 🚀 Deployment - Paso a Paso

### Paso 1: Configurar Credenciales Localmente

```bash
cd /Users/woviedoalist/fiscal-dashboard

# Copiar credenciales al backend
cp /ruta/donde/descargaste/fiscal-dashboard-credentials.json backend/credentials.json

# IMPORTANTE: Verificar que está en .gitignore (ya debería estar)
grep "credentials.json" .gitignore
```

---

### Paso 2: Probar Localmente

```bash
# Configurar variable de entorno
export GOOGLE_APPLICATION_CREDENTIALS="/Users/woviedoalist/fiscal-dashboard/backend/credentials.json"

# Iniciar backend
cd backend
python app.py

# En otra terminal, probar
curl http://localhost:5000/api/metrics/monthly
```

**Esperado:** Deberías ver datos de BigQuery en formato JSON

---

### Paso 3: Desplegar Backend en Cloud Run

```bash
cd /Users/woviedoalist/fiscal-dashboard/backend

# Deployment usando el service account
gcloud run deploy fiscal-dashboard-backend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --service-account=fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com \
    --project=meli-bi-data \
    --memory=512Mi \
    --cpu=1 \
    --timeout=300 \
    --set-env-vars="FLASK_ENV=production"
```

**Tiempo estimado:** 3-5 minutos

Al finalizar, obtendrás una URL como:
```
https://fiscal-dashboard-backend-xxxxx-uc.a.run.app
```

**⚠️ IMPORTANTE:** Guarda esta URL, la necesitarás para el frontend.

---

### Paso 4: Verificar Backend en Cloud Run

```bash
# Reemplaza con tu URL real
export BACKEND_URL="https://fiscal-dashboard-backend-xxxxx-uc.a.run.app"

# Probar endpoint de métricas mensuales
curl $BACKEND_URL/api/metrics/monthly

# Probar endpoint de sellers
curl $BACKEND_URL/api/metrics/sellers

# Probar endpoint de mes específico
curl $BACKEND_URL/api/metrics/month/2025-08
```

**Esperado:** Respuestas JSON con datos de BigQuery

---

### Paso 5: Actualizar CORS (Importante!)

Antes de desplegar el frontend, necesitas actualizar el CORS del backend.

1. Editar `backend/app.py`:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://fiscal-dashboard-xxxxx.vercel.app"  # Agregar después del deploy de Vercel
        ]
    }
})
```

2. Re-desplegar backend:
```bash
cd backend
gcloud run deploy fiscal-dashboard-backend --source . --project=meli-bi-data
```

---

### Paso 6: Desplegar Frontend en Vercel

```bash
cd /Users/woviedoalist/fiscal-dashboard/frontend

# Crear archivo de configuración para producción
cat > .env.production << EOF
REACT_APP_API_URL=https://fiscal-dashboard-backend-xxxxx-uc.a.run.app
EOF

# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Login en Vercel (si no lo has hecho)
vercel login

# Desplegar a producción
vercel --prod
```

Durante el deploy, Vercel preguntará:
- **Project Name:** `fiscal-dashboard` (o el que prefieras)
- **Build Command:** `npm run build` ✅
- **Output Directory:** `build` ✅

**Tiempo estimado:** 2-3 minutos

---

### Paso 7: Configurar Variables de Entorno en Vercel

Si no configuraste `.env.production` antes:

```bash
# Via CLI
vercel env add REACT_APP_API_URL production

# O via Web UI:
# 1. Ve a https://vercel.com/dashboard
# 2. Selecciona tu proyecto
# 3. Settings → Environment Variables
# 4. Agrega: REACT_APP_API_URL = https://tu-backend.run.app
```

---

### Paso 8: Actualizar CORS Final

Ahora que tienes la URL de Vercel:

1. Editar `backend/app.py` con la URL real de Vercel:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://fiscal-dashboard-xxxxx.vercel.app"  # Tu URL real
        ]
    }
})
```

2. Re-desplegar backend:
```bash
cd backend
gcloud run deploy fiscal-dashboard-backend --source . --project=meli-bi-data
```

---

## ✅ Verificación Final

### Backend:
```bash
curl https://fiscal-dashboard-backend-xxxxx-uc.a.run.app/api/metrics/monthly
```

### Frontend:
Abre en el browser: `https://fiscal-dashboard-xxxxx.vercel.app`

Deberías ver el dashboard funcionando completamente! 🎉

---

## 🔗 URLs Finales

Anota tus URLs:

- **Backend API:** `https://fiscal-dashboard-backend-xxxxx-uc.a.run.app`
- **Dashboard Frontend:** `https://fiscal-dashboard-xxxxx.vercel.app`
- **Repositorio:** `https://github.com/williamoviedoaliste-arch/fiscal-dashboard`

---

## 🔧 Comandos Útiles

### Ver logs del backend:
```bash
gcloud run services logs read fiscal-dashboard-backend \
    --project=meli-bi-data \
    --limit=50
```

### Actualizar backend:
```bash
cd backend
gcloud run deploy fiscal-dashboard-backend --source . --project=meli-bi-data
```

### Actualizar frontend:
```bash
cd frontend
vercel --prod
```

### Ver deployments en Vercel:
```bash
vercel ls
```

---

## 🐛 Troubleshooting

### Error: "CORS policy blocked"
- Verifica que la URL de Vercel esté en el CORS del backend
- Re-despliega el backend después de actualizar

### Error: "Cannot connect to backend"
- Verifica que `REACT_APP_API_URL` esté configurada correctamente
- Revisa en Vercel: Settings → Environment Variables

### Error: "BigQuery permission denied"
- Verifica que el service account tenga los permisos correctos
- Contacta al admin para verificar permisos

### Backend tarda mucho en responder
- Primera request puede tardar (cold start)
- Considera aumentar CPU/memoria en Cloud Run

---

## 📊 Monitoreo

### Cloud Run Dashboard:
```
https://console.cloud.google.com/run/detail/us-central1/fiscal-dashboard-backend?project=meli-bi-data
```

### Vercel Dashboard:
```
https://vercel.com/dashboard
```

### Ver uso de BigQuery:
```bash
gcloud alpha billing projects describe meli-bi-data --format="table(billingAccountName,billingEnabled)"
```

---

## 🔒 Seguridad Post-Deployment

### Recomendaciones:

1. **Proteger credenciales:**
   - ✅ El archivo `credentials.json` está en `.gitignore`
   - ✅ NUNCA commitear credenciales al repositorio

2. **Monitorear costos:**
   - Configurar alertas de billing en GCP
   - Revisar uso mensual de BigQuery

3. **Considerar autenticación (Fase 2):**
   - Agregar login de MercadoLibre
   - Restringir acceso por roles

---

## 🎯 Siguientes Pasos

Una vez deployed:

1. ✅ Compartir URL del dashboard con stakeholders
2. ✅ Configurar alertas de monitoreo
3. ✅ Agregar autenticación (si es necesario)
4. ✅ Configurar dominio personalizado (opcional)
5. ✅ Implementar CI/CD para deployments automáticos

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de Cloud Run
2. Verifica las variables de entorno en Vercel
3. Consulta la documentación: [DEPLOYMENT.md](./DEPLOYMENT.md)
4. Revisa el repositorio: https://github.com/williamoviedoaliste-arch/fiscal-dashboard

---

**¡Felicitaciones! Tu dashboard está en producción! 🚀**
