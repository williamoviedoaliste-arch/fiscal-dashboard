# Usar Python 3.9 como base
FROM python:3.9-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 8080

# Variable de entorno para producción
ENV FLASK_ENV=production

# Comando para ejecutar la aplicación
CMD exec gunicorn --bind :8080 --workers 1 --threads 8 --timeout 0 app:app
