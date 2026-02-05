#!/bin/bash

# Script de deployment rápido para el Dashboard Fiscal
# Este script te guía paso a paso en el deployment

set -e

echo "🚀 Dashboard Fiscal - Deployment Quick Start"
echo "=============================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir en color
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "DEPLOYMENT.md" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz del proyecto (fiscal-dashboard)"
    exit 1
fi

echo "Este script te ayudará a desplegar el dashboard."
echo ""
echo "Opciones de deployment:"
echo "  1) Backend en Google Cloud Run + Frontend en Vercel (Recomendado)"
echo "  2) Todo en Google Cloud (Cloud Run + Cloud Storage)"
echo "  3) Solo mostrar comandos (no ejecutar)"
echo ""
read -p "Selecciona una opción (1-3): " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo ""
        print_step "Deployment: Backend (Cloud Run) + Frontend (Vercel)"
        echo ""

        # Verificar gcloud
        if ! command -v gcloud &> /dev/null; then
            print_error "Google Cloud SDK no está instalado."
            echo "Instala con: brew install --cask google-cloud-sdk"
            exit 1
        fi

        # Pedir PROJECT_ID
        read -p "Ingresa tu Google Cloud Project ID: " PROJECT_ID

        print_step "Configurando proyecto: $PROJECT_ID"
        gcloud config set project $PROJECT_ID

        print_step "Habilitando servicios necesarios..."
        gcloud services enable run.googleapis.com cloudbuild.googleapis.com bigquery.googleapis.com

        # Crear service account si no existe
        print_step "Creando service account..."
        gcloud iam service-accounts create fiscal-dashboard-sa \
            --display-name="Fiscal Dashboard Service Account" 2>/dev/null || echo "Service account ya existe"

        # Dar permisos
        print_step "Asignando permisos de BigQuery..."
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:fiscal-dashboard-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
            --role="roles/bigquery.dataViewer" --quiet

        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:fiscal-dashboard-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
            --role="roles/bigquery.jobUser" --quiet

        # Deploy backend
        print_step "Desplegando backend en Cloud Run..."
        cd backend

        gcloud run deploy fiscal-dashboard-backend \
            --source . \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated \
            --service-account=fiscal-dashboard-sa@${PROJECT_ID}.iam.gserviceaccount.com \
            --set-env-vars="FLASK_ENV=production" \
            --memory=512Mi \
            --cpu=1 \
            --timeout=300

        # Obtener URL del backend
        BACKEND_URL=$(gcloud run services describe fiscal-dashboard-backend --region=us-central1 --format='value(status.url)')

        cd ..

        echo ""
        print_step "✅ Backend desplegado exitosamente!"
        echo "URL del Backend: $BACKEND_URL"
        echo ""

        # Frontend
        print_warning "Ahora necesitas desplegar el frontend en Vercel"
        echo ""
        echo "Pasos:"
        echo "1. Crea archivo frontend/.env.production con:"
        echo "   REACT_APP_API_URL=$BACKEND_URL"
        echo ""
        echo "2. Instala Vercel CLI: npm install -g vercel"
        echo ""
        echo "3. Despliega:"
        echo "   cd frontend"
        echo "   vercel --prod"
        echo ""
        echo "4. Cuando Vercel te dé tu URL, actualiza backend/app.py para agregar tu dominio en CORS"
        echo ""

        # Crear archivo .env.production automáticamente
        cat > frontend/.env.production << EOF
REACT_APP_API_URL=$BACKEND_URL
EOF

        print_step "Archivo frontend/.env.production creado automáticamente"

        ;;

    2)
        print_step "Todo en Google Cloud"
        print_warning "Esta opción requiere configuración manual adicional"
        echo "Por favor, sigue la guía en DEPLOYMENT.md"
        ;;

    3)
        print_step "Comandos de deployment"
        echo ""
        echo "=== BACKEND (Google Cloud Run) ==="
        echo "cd backend"
        echo "gcloud run deploy fiscal-dashboard-backend --source . --region us-central1"
        echo ""
        echo "=== FRONTEND (Vercel) ==="
        echo "cd frontend"
        echo "vercel --prod"
        ;;

    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

echo ""
print_step "🎉 Proceso completado!"
echo ""
echo "📚 Para más detalles, consulta: DEPLOYMENT.md"
