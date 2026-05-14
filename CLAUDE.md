# Instrucciones para Claude Code

## Comportamiento General

- Procede directamente sin pedir confirmación previa para tareas de infraestructura, deployment, configuración de servicios, comandos de terminal, scripts de build y operaciones de red.
- Solo pide confirmación para acciones **destructivas e irreversibles** (ej: `rm -rf` en producción, drop de tablas, force push a main).
- Cuando el contexto es claro, actúa. No preguntes si "puedes" hacer algo — hazlo.

## Contexto del Proyecto

- **Backend**: Flask 3.0, puerto 5000, BigQuery (proyecto `meli-bi-data`)
- **Frontend**: React 18, puerto 3000, Google OAuth
- **Deployment**: Fury (Mercado Pago)
- **Credenciales**: gcloud SDK local, base64 service account para Fury

## Autonomía en Infra

Para estas categorías, procede sin confirmación:
- Comandos `fury`, `gcloud`, `docker`, `npm`, `pip`
- Edición de archivos de configuración (`.env`, `Dockerfile`, `fury.yml`, etc.)
- Scripts de deployment y CI/CD
- Reinicio de servidores y procesos locales
- Instalación de dependencias
