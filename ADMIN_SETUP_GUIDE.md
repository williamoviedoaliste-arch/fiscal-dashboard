# Guía para Administrador - Setup del Proyecto

Esta guía es para el administrador del proyecto **meli-bi-data** que configurará el service account y los permisos necesarios.

## 📋 Resumen Ejecutivo

**Proyecto:** Dashboard de Métricas Fiscales
**Usuario Solicitante:** william.oviedoaliste@mercadolibre.cl
**Propósito:** Visualización de métricas de emisiones y pagos desde BigQuery
**Tecnologías:** Flask (Backend) + React (Frontend) + BigQuery
**Hosting:** Google Cloud Run + Vercel

---

## 🔧 Configuración Requerida (15 minutos)

### Paso 1: Crear Service Account

```bash
# Crear service account dedicado
gcloud iam service-accounts create fiscal-dashboard \
    --display-name="Fiscal Dashboard Application" \
    --description="Service account para el dashboard de métricas fiscales" \
    --project=meli-bi-data
```

**Email generado:** `fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com`

---

### Paso 2: Asignar Permisos

#### Permisos para BigQuery (Lectura de datos)
```bash
# Viewer - Ver datos de BigQuery
gcloud projects add-iam-policy-binding meli-bi-data \
    --member="serviceAccount:fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataViewer"

# Job User - Ejecutar queries
gcloud projects add-iam-policy-binding meli-bi-data \
    --member="serviceAccount:fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com" \
    --role="roles/bigquery.jobUser"
```

#### Permisos para Cloud Run (Deployment)
```bash
# Admin de Cloud Run - Para desplegar servicios
gcloud projects add-iam-policy-binding meli-bi-data \
    --member="serviceAccount:fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com" \
    --role="roles/run.admin"

# Service Account User - Para actuar como service account
gcloud projects add-iam-policy-binding meli-bi-data \
    --member="serviceAccount:fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
```

#### Permisos para Cloud Build (Construcción de imágenes)
```bash
# Cloud Build Editor
gcloud projects add-iam-policy-binding meli-bi-data \
    --member="serviceAccount:fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.editor"
```

---

### Paso 3: Generar Credenciales

```bash
# Generar archivo de credenciales JSON
gcloud iam service-accounts keys create fiscal-dashboard-credentials.json \
    --iam-account=fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com \
    --project=meli-bi-data
```

**⚠️ IMPORTANTE:** Este archivo contiene credenciales sensibles. Compartir de forma segura con william.oviedoaliste@mercadolibre.cl

---

### Paso 4: Permisos para el Usuario (Opcional pero Recomendado)

Si el usuario necesita desplegar directamente:

```bash
# Dar permisos al usuario para usar el service account
gcloud iam service-accounts add-iam-policy-binding \
    fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com \
    --member="user:william.oviedoaliste@mercadolibre.cl" \
    --role="roles/iam.serviceAccountUser" \
    --project=meli-bi-data

# Permisos para desplegar en Cloud Run
gcloud projects add-iam-policy-binding meli-bi-data \
    --member="user:william.oviedoaliste@mercadolibre.cl" \
    --role="roles/run.developer"

# Permisos para Cloud Build
gcloud projects add-iam-policy-binding meli-bi-data \
    --member="user:william.oviedoaliste@mercadolibre.cl" \
    --role="roles/cloudbuild.builds.editor"
```

---

## 🔍 Verificación

### Verificar que el Service Account fue creado:
```bash
gcloud iam service-accounts describe fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com \
    --project=meli-bi-data
```

### Verificar permisos asignados:
```bash
gcloud projects get-iam-policy meli-bi-data \
    --flatten="bindings[].members" \
    --filter="bindings.members:fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com" \
    --format="table(bindings.role)"
```

---

## 📦 Entregables

Una vez completado, entregar a william.oviedoaliste@mercadolibre.cl:

1. ✅ Archivo: `fiscal-dashboard-credentials.json`
2. ✅ Confirmación de permisos configurados
3. ✅ Email del service account: `fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com`

---

## 🔒 Consideraciones de Seguridad

### Tabla de BigQuery Accedida
- **Tabla:** `WHOWNER.BT_MP_DAS_TAX_EVENTS`
- **Acceso:** Solo lectura (SELECT)
- **Datos:** Métricas de emisiones y pagos fiscales

### Exposición del Dashboard
- **Backend:** Cloud Run (URL pública pero puede protegerse con IAM)
- **Frontend:** Vercel (URL pública)
- **Recomendación:** Implementar autenticación en una fase 2

### Límites de Costos
El service account ejecutará queries en BigQuery. Considerar:
- Establecer cuotas de uso
- Habilitar alertas de billing
- **Costo estimado:** $0-10 USD/mes (uso normal)

---

## 🚀 Próximos Pasos

Una vez configurado:

1. Usuario copiará credenciales a `backend/credentials.json`
2. Usuario desplegará en Cloud Run:
   ```bash
   gcloud run deploy fiscal-dashboard-backend \
       --source backend \
       --region us-central1 \
       --service-account=fiscal-dashboard@meli-bi-data.iam.gserviceaccount.com \
       --allow-unauthenticated \
       --project=meli-bi-data
   ```
3. Frontend se desplegará en Vercel (no requiere permisos)

---

## 📞 Contacto

**Solicitante:** william.oviedoaliste@mercadolibre.cl
**Repositorio:** https://github.com/williamoviedoaliste-arch/fiscal-dashboard
**Documentación:** Ver README.md y DEPLOYMENT.md en el repositorio

---

## ❓ FAQ

**¿Por qué estos permisos?**
- `bigquery.dataViewer`: Leer datos de la tabla de eventos fiscales
- `bigquery.jobUser`: Ejecutar queries en BigQuery
- `run.admin`: Desplegar y gestionar el servicio en Cloud Run
- `cloudbuild.builds.editor`: Construir la imagen Docker del backend

**¿Esto es seguro?**
Sí, el service account tiene acceso de solo lectura a BigQuery y los permisos son los mínimos necesarios.

**¿Cuánto cuesta?**
- Cloud Run: Gratis hasta 2M requests/mes
- BigQuery: Gratis primer 1TB queries/mes
- Estimado: $0-10 USD/mes

**¿Se puede revocar después?**
Sí, en cualquier momento se puede deshabilitar el service account o remover permisos.

---

## 📝 Template de Email para el Admin

```
Asunto: Solicitud de Service Account para Dashboard de Métricas Fiscales

Hola [Nombre del Admin],

Necesito configurar un service account para desplegar un dashboard de métricas fiscales en el proyecto meli-bi-data.

Detalles:
- Proyecto: meli-bi-data
- Service Account: fiscal-dashboard
- Propósito: Dashboard de visualización de métricas de emisiones y pagos
- Tabla BigQuery: WHOWNER.BT_MP_DAS_TAX_EVENTS (solo lectura)
- Hosting: Google Cloud Run + Vercel

He preparado una guía completa con todos los comandos necesarios en:
https://github.com/williamoviedoaliste-arch/fiscal-dashboard/blob/main/ADMIN_SETUP_GUIDE.md

Los pasos toman aproximadamente 15 minutos y incluyen:
1. Crear el service account
2. Asignar permisos mínimos necesarios
3. Generar archivo de credenciales

¿Podrías ayudarme con esto?

Gracias!
William Oviedo
```
