# 🚀 Guía de Inicio Rápido

## Paso 1: Verificar Prerrequisitos

Asegúrate de tener instalado:
- ✅ Python 3.8+ (`python3 --version`)
- ✅ Node.js 16+ (`node --version`)
- ✅ npm (`npm --version`)

## Paso 2: Configurar Credenciales de BigQuery

1. Descarga tus credenciales de Google Cloud BigQuery (archivo JSON)
2. Guárdalas en un lugar seguro
3. Exporta la variable de entorno:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/tus/credentials.json"
```

Para hacerlo permanente, agrégalo a tu `~/.bashrc` o `~/.zshrc`.

## Paso 3: Inicio Rápido (Opción Automática)

Usa el script de inicio automático:

```bash
cd fiscal-dashboard
./start.sh
```

Esto iniciará automáticamente el backend y frontend.

## Paso 4: Inicio Manual (Opción Alternativa)

### Backend

```bash
cd fiscal-dashboard/backend

# Crear entorno virtual (solo la primera vez)
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
python app.py
```

### Frontend (en otra terminal)

```bash
cd fiscal-dashboard/frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar aplicación
npm start
```

## Paso 5: Acceder al Dashboard

Abre tu navegador en: **http://localhost:3000**

## 🎉 ¡Listo!

Deberías ver el dashboard con todos los gráficos y métricas cargadas.

### 🧭 Navegando por el Dashboard

El dashboard tiene **3 pestañas** en la parte superior:

1. **📊 General**: Vista ejecutiva con métricas agregadas de todo el período
   - Resumen de emisiones, pagos y volumen
   - Gráficos de evolución mensual
   - Tasas de conversión

2. **📅 Mensual**: Análisis detallado mes por mes
   - Selector de mes
   - Filtro por fecha de evento o período fiscal
   - Estados de emisión y top períodos

3. **🎯 Next Steps**: Métricas estratégicas para decisiones
   - Retención por cohorte
   - Nivel de engagement
   - Análisis de morosidad (períodos pendientes)

**💡 Tip**: Empieza por la pestaña **General** para tener una vista panorámica, luego explora **Mensual** para detalles específicos, y usa **Next Steps** para planificación estratégica.

## 🔧 Solución de Problemas

### Error: "No module named 'google.cloud'"
```bash
cd backend
source venv/bin/activate
pip install google-cloud-bigquery
```

### Error: "Cannot find module 'recharts'"
```bash
cd frontend
npm install recharts
```

### Error: "Failed to fetch data"
- Verifica que el backend esté corriendo en puerto 5000
- Verifica tus credenciales de BigQuery
- Revisa la consola del navegador para más detalles

### Puerto 3000 o 5000 ya en uso
```bash
# Ver qué está usando el puerto
lsof -i :5000
lsof -i :3000

# Matar el proceso
kill -9 <PID>
```

## 📚 Documentación Completa

- **[README.md](README.md)** - Documentación general del proyecto
- **[DOCUMENTACION_METRICAS.md](DOCUMENTACION_METRICAS.md)** - Guía técnica completa con fórmulas y cálculos detallados
- **[KNOWLEDGE_BASE.md](KNOWLEDGE_BASE.md)** - Base de conocimiento, FAQs y guía para extender el dashboard
