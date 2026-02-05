#!/bin/bash

echo "🚀 Iniciando Dashboard Fiscal..."
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "README.md" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio fiscal-dashboard/"
    exit 1
fi

# Iniciar backend en background
echo "📡 Iniciando Backend (Flask)..."
cd backend
if [ ! -d "venv" ]; then
    echo "⚠️  No se encontró entorno virtual. Creando..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
python app.py &
BACKEND_PID=$!
echo "✅ Backend corriendo en http://localhost:5000 (PID: $BACKEND_PID)"
cd ..

# Esperar a que el backend esté listo
echo "⏳ Esperando que el backend esté listo..."
sleep 3

# Iniciar frontend
echo "🎨 Iniciando Frontend (React)..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "⚠️  Instalando dependencias de npm..."
    npm install
fi
npm start &
FRONTEND_PID=$!
echo "✅ Frontend corriendo en http://localhost:3000 (PID: $FRONTEND_PID)"
cd ..

echo ""
echo "✨ Dashboard iniciado correctamente!"
echo ""
echo "📊 Accede al dashboard en: http://localhost:3000"
echo "📡 API disponible en: http://localhost:5000"
echo ""
echo "Para detener el dashboard, presiona Ctrl+C"
echo ""

# Esperar a que se detenga
wait
