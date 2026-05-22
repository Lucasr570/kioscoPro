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
RUN pip install gunicorn psycopg2-binary

# Copiar el código del proyecto
COPY . .

# Exponer el puerto
EXPOSE 8000

# Comando para iniciar la aplicación corriendo primero las migraciones
CMD ["sh", "-c", "python manage.py migrate && python -c \"import django; django.setup(); from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='lucas').delete(); User.objects.create_superuser('lucas', 'lucasr57@gmail.com', 'Contrakiosco!')\" && gunicorn core.wsgi:application"]