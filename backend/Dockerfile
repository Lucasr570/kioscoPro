# Usar Python oficial (slim para reducir peso)
FROM python:3.10-slim

# Variables de entorno para Python (evita archivos .pyc y buffer de salida)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar paquetes y conectarse a bases de datos
RUN apt-get update \
    && apt-get install -y libpq-dev gcc \
    && apt-get clean

# Copiar requirements e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instalar Gunicorn para servir la aplicación en producción
RUN pip install gunicorn

# Copiar el código del proyecto
COPY . .

# Exponer el puerto
EXPOSE 8000

# Comando para iniciar la aplicación
# NOTA: En producción real el orquestador (ej. docker-compose) ejecutará las migraciones antes.
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]
