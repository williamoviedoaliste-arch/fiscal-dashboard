# 📋 Progreso de Deployment - Fiscal Dashboard

**Fecha**: 2026-02-07
**Estado Actual**: Pendiente acceso a proyecto Fury

---

## ✅ Completado

### 1. **Código y Repositorio**
- ✅ Código del dashboard completo y funcional
- ✅ Backend: Flask + BigQuery (puerto 5000)
- ✅ Frontend: React 18 con Recharts (puerto 3000)
- ✅ Subido a GitHub: https://github.com/williamoviedoaliste-arch/fiscal-dashboard
- ✅ Último commit: "Add deployment script and frontend package.json"

### 2. **Configuración Local**
- ✅ Backend funcional con BigQuery
- ✅ Frontend funcional
- ✅ CORS configurado correctamente
- ✅ Filtro temporal: Pagos desde 12/2025 en adelante
- ✅ Script de inicio: `./start.sh`

### 3. **Service Account para BigQuery**
- ✅ Credenciales recibidas y decodificadas
- ✅ Service Account: `sup-swe-ai-01@bidata-cross-sa-batch.iam.gserviceaccount.com`
- ✅ Proyecto: `bidata-cross-sa-batch`
- ✅ Archivo JSON generado correctamente
- ⚠️ **Nota de seguridad**: Credenciales expuestas en chat, considera revocarlas después

### 4. **Configuración para Fury**
- ✅ Archivo `fury.yml` configurado
- ✅ Dockerfile del backend listo
- ✅ Archivo `.fury` creado con nombre de app: `fiscal-dashboard-api`
- ✅ `.fury` agregado a `.gitignore`
- ✅ Autenticado en Fury CLI: `fury login` ✅

### 5. **OAuth (Removido Temporalmente)**
- ✅ Componentes de autenticación creados (AuthWrapper, Login)
- ✅ Pero removidos del código para simplificar deployment inicial
- ✅ Pueden agregarse después cuando se necesite autenticación

---

## ⏸️ Bloqueado - Pendiente

### **Fury Deployment**

**Problema**: No tienes acceso a un proyecto en Fury.

**Mensaje de error**:
```
You need a project to create an application
Contact ramiro paz to request being assigned to a project
```

**Acciones requeridas**:
1. Contactar a **Ramiro Paz** o tu admin de Fury
2. Solicitar:
   - Acceso a un proyecto existente, O
   - Creación de un proyecto nuevo (sugerencia: `fiscal-metrics` o `data-analytics`)

**Comandos para después**:
```bash
# 1. Verificar acceso a proyectos
fury scm list-projects

# 2. Actualizar plugins de Fury
fury install

# 3. Crear versión y deploy
fury create-version

# 4. Configurar Service Account en Fury
# (Desde la Web UI: https://web.furycloud.io)
# - Ir a la app fiscal-dashboard-api
# - Secrets/Environment Variables
# - Agregar: GOOGLE_APPLICATION_CREDENTIALS (tipo: file)
# - Subir el service-account.json
```

---

## 🚀 Alternativas Mientras Esperas Fury

### **Opción A: Google Cloud Run** (Recomendado - 5 minutos)

Ya tienes todo configurado. Solo ejecuta:

```bash
cd /Users/woviedoalist/fiscal-dashboard

# Deploy del backend
./deploy-backend.sh

# Te dará una URL como:
# https://fiscal-dashboard-api-XXXXX-uc.a.run.app
```

**Ventajas**:
- ✅ Deployment inmediato
- ✅ Ya tienes credenciales de Google Cloud configuradas
- ✅ URL compartible con tus compañeros
- ✅ Escalado automático

**Para el frontend**:
Tus compañeros pueden correr el frontend localmente apuntando al backend en Cloud Run:
```bash
# En frontend/.env.local
REACT_APP_API_URL=https://fiscal-dashboard-api-XXXXX-uc.a.run.app

# Iniciar frontend
cd frontend
npm install
npm start
```

### **Opción B: Looker Studio**

Si solo necesitas compartir visualizaciones (no interactividad):
1. BigQuery ya tiene los datos
2. Conecta Looker Studio directo a BigQuery
3. Crea reportes visuales
4. Comparte el link del dashboard de Looker

---

## 📁 Archivos Importantes

### **Configuración**
- `fury.yml` - Configuración de Fury (listo)
- `.fury` - Nombre de la app (fiscal-dashboard-api)
- `deploy-backend.sh` - Script para Cloud Run
- `backend/Dockerfile` - Imagen Docker del backend
- `backend/requirements.txt` - Dependencias Python

### **Código Principal**
- `backend/app.py` - API Flask con endpoints
- `backend/run_server.py` - Script para iniciar servidor
- `frontend/src/` - Código React
- `frontend/package.json` - Dependencias Node

### **Guías**
- `QUICKSTART.md` - Inicio rápido local
- `FURY_DEPLOYMENT.md` - Guía de Fury
- `GOOGLE_OAUTH_SETUP.md` - Autenticación (para futuro)
- `README.md` - Documentación general

---

## 🔑 Credenciales y Seguridad

### **Service Account (BigQuery)**
- ✅ Decodificado y generado service-account.json
- ⚠️ Credenciales expuestas en conversación de Claude
- 📝 Considerar revocar y crear nuevo SA después del deployment
- 📝 Service Account ID: `sup-swe-ai-01@bidata-cross-sa-batch.iam.gserviceaccount.com`
- 📝 Key ID: `9906fa5620014f6c8b8c9a0cf979383879550f935`

### **Archivos Sensibles Borrados**
- ✅ decode_key.py (borrado)
- ✅ service-account.json (borrado después de uso)
- ✅ key_base64.txt (borrado)

### **Para Fury** (cuando tengas acceso)
Necesitas subir el Service Account como secret:
- Name: `GOOGLE_APPLICATION_CREDENTIALS`
- Type: File
- File: service-account.json (regenerar si fue revocado)

---

## 📊 Características del Dashboard

### **Pestañas**
1. **General** - Resumen de métricas, gráficos de emisiones y pagos
2. **Mensual** - Análisis por mes con comparación temporal
3. **Uso de Pendings** - Efectividad de notificaciones (filtrado desde 12/2025)
4. **Documentación** - Guía de uso

### **Datos**
- **Fuente**: BigQuery - Proyecto `meli-bi-data`
- **Tablas**:
  - `WHOWNER.BT_MP_DAS_TAX_EVENTS` - Emisiones y pagos fiscales
  - `SBOX_SBOXMERCH.DIM_PENDINGS` - Notificaciones push
- **Período**: Agosto 2025 a Febrero 2026
- **Filtro Pendings**: Solo pagos desde 12/2025

### **Conversión Funnel (Pendings)**
1. Notificaciones Enviadas: 196,535
2. Pagos Totales Tax (12/2025+): 18,138
3. Pagos desde Notificación: 12,027 (66.31%)

---

## 🎯 Próximos Pasos (En Orden de Prioridad)

### **Inmediato** (Hoy)
- [ ] **Opción 1**: Deploy en Google Cloud Run (5 min)
  ```bash
  ./deploy-backend.sh
  ```
- [ ] **Opción 2**: Contactar a Ramiro Paz para acceso a Fury

### **Corto Plazo** (Esta semana)
- [ ] Obtener acceso a proyecto en Fury
- [ ] Completar deployment en Fury con Service Account
- [ ] Compartir URL del dashboard con compañeros
- [ ] (Opcional) Revocar y regenerar Service Account por seguridad

### **Mediano Plazo** (Próximas semanas)
- [ ] Agregar autenticación con Google OAuth
  - Requiere configurar OAuth Client ID en Google Cloud Console
  - Reintegrar componentes AuthWrapper.jsx y Login.jsx
  - Restricción a @mercadolibre.com / @mercadolibre.cl
- [ ] (Opcional) Conectar con Looker Studio para reportes adicionales

---

## 🆘 Troubleshooting

### **Error: Fury plugins desactualizados**
```bash
fury install
```

### **Error: Application not found in Fury**
1. Verificar archivo `.fury` existe: `cat .fury`
2. Verificar nombre: debe ser `fiscal-dashboard-api`
3. Crear app en Fury Web UI primero (necesitas acceso a proyecto)

### **Error: No puedo crear app en Fury**
- Necesitas ser asignado a un proyecto
- Contactar admin de Fury (Ramiro Paz según mensaje)

### **Backend funciona local pero no en producción**
1. Verificar Service Account está configurado
2. Verificar variable GOOGLE_APPLICATION_CREDENTIALS apunta al archivo JSON
3. Verificar permisos en BigQuery tables

---

## 📞 Contactos

- **Admin Fury**: Ramiro Paz (según mensaje de Fury)
- **IT/Support**: Para permisos de BigQuery
- **Repo GitHub**: https://github.com/williamoviedoaliste-arch/fiscal-dashboard

---

## 🔄 Para Retomar la Conversación

**Contexto Guardado**:
1. ✅ Código completo en GitHub
2. ✅ Service Account configurado (bidata-cross-sa-batch)
3. ✅ Fury CLI instalado y autenticado
4. ⏸️ Bloqueado: Necesitas acceso a proyecto Fury
5. 🚀 Alternativa lista: Google Cloud Run deployment

**Comandos Rápidos**:
```bash
# Ver estado del proyecto
cd /Users/woviedoalist/fiscal-dashboard
git status

# Levantar local
./start.sh

# Deploy a Cloud Run (alternativa)
./deploy-backend.sh

# Cuando tengas Fury access
fury install
fury create-version
```

---

**💡 Recomendación**: Mientras esperas acceso a Fury, usa Google Cloud Run para tener el dashboard disponible YA. Es rápido, funcional y puedes migrar a Fury después.

---

*Generado: 2026-02-07*
*Proyecto: Fiscal Dashboard - Métricas DAS Brasil*
*Owner: william.oviedoaliste@mercadolibre.cl*
