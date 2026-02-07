#!/bin/bash

echo "🚀 Deploying Backend to Google Cloud Run..."
echo ""

# Variables
PROJECT_ID="meli-bi-data"
SERVICE_NAME="fiscal-dashboard-api"
REGION="us-central1"

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/Dockerfile" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio fiscal-dashboard/"
    exit 1
fi

# Cambiar al directorio backend
cd backend

echo "📦 Building and deploying to Cloud Run..."
echo ""

# Deploy a Cloud Run
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --project $PROJECT_ID \
    --memory 512Mi \
    --timeout 300 \
    --max-instances 10

echo ""
echo "✅ Backend deployed successfully!"
echo ""
echo "📍 Your backend URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format="value(status.url)"
echo ""
echo "💡 Copy this URL for the frontend configuration"
