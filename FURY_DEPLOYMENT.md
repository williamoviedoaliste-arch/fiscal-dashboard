# 🚀 Deployment en Fury - Guía Paso a Paso

## Prerrequisitos

1. ✅ Fury CLI instalado
2. ✅ Acceso a MeliSource
3. ⚠️ Service Account con permisos a BigQuery (pedir a IT)

---

## Paso 1: Login en Fury

```bash
fury login
```

---

## Paso 2: Crear Service Account para BigQuery

**Opción A: Pedir a IT** (Recomendado)
- Abre un ticket a IT pidiendo un Service Account con permisos:
  - `roles/bigquery.dataViewer` en proyecto `meli-bi-data`
  - Acceso a las tablas:
    - `WHOWNER.BT_MP_DAS_TAX_EVENTS`
    - `SBOX_SBOXMERCH.DIM_PENDINGS`

**Opción B: Crear manualmente** (si tienes permisos)
```bash
gcloud iam service-accounts create fiscal-dashboard-sa \
    --display-name="Fiscal Dashboard Service Account" \
    --project=meli-bi-data

gcloud projects add-iam-policy-binding meli-bi-data \
    --member="serviceAccount:fiscal-dashboard-sa@meli-bi-data.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataViewer"

# Descargar las credenciales
gcloud iam service-accounts keys create sa-credentials.json \
    --iam-account=fiscal-dashboard-sa@meli-bi-data.iam.gserviceaccount.com
```

---

## Paso 3: Subir el Service Account a Fury

```bash
# Crear secret en Fury con las credenciales
fury secrets create fiscal-dashboard-api \
    --name GOOGLE_APPLICATION_CREDENTIALS \
    --file sa-credentials.json

# Verificar
fury secrets list fiscal-dashboard-api
```

---

## Paso 4: Deploy del Backend

```bash
# Desde el directorio raíz del proyecto
cd /Users/woviedoalist/fiscal-dashboard

# Deploy a Fury
fury deploy
```

Fury leerá el archivo `fury.yml` y desplegará la aplicación.

---

## Paso 5: Verificar el Deployment

```bash
# Ver el estado del deployment
fury status fiscal-dashboard-api

# Ver logs
fury logs fiscal-dashboard-api --follow

# Obtener la URL
fury url fiscal-dashboard-api
```

---

## Paso 6: Deploy del Frontend

El frontend necesita apuntar a la URL del backend. Hay dos opciones:

### Opción A: Frontend estático en Fury

1. Crear un nuevo servicio en Fury para el frontend
2. Build del frontend con la URL del backend
3. Deploy como servicio estático

### Opción B: Correr frontend localmente

Tus compañeros pueden correr el frontend localmente apuntando al backend en Fury:

```bash
# En frontend/.env.local
REACT_APP_API_URL=https://fiscal-dashboard-api.fury.ml.com

# Iniciar frontend
cd frontend
npm install
npm start
```

---

## Troubleshooting

### Error: "Permission denied to BigQuery"
- Verificar que el Service Account tenga los permisos correctos
- Verificar que el secret esté configurado en Fury

### Error: "Application failed to start"
- Revisar logs: `fury logs fiscal-dashboard-api`
- Verificar que el Dockerfile sea correcto
- Verificar que el puerto 8080 esté expuesto

### Error: "Healthcheck failing"
- Verificar que `/api/health` responda correctamente
- Revisar logs para errores de conexión a BigQuery

---

## Compartir con Compañeros

Una vez desplegado, comparte:
1. **Backend URL**: `fury url fiscal-dashboard-api`
2. **Instrucciones** para correr el frontend apuntando al backend
3. **Este README** para referencia

---

## Actualizar el Dashboard

```bash
# Hacer cambios en el código
git add .
git commit -m "Update dashboard"
git push

# Re-deploy
fury deploy
```

---

## Recursos Útiles

- Documentación de Fury: `fury help`
- Ver aplicaciones: `fury apps list`
- Ver logs: `fury logs fiscal-dashboard-api --follow`
- Escalar: `fury scale fiscal-dashboard-api --instances 3`
