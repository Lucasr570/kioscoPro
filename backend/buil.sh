#!/usr/bin/env bash
# Salir inmediatamente si un comando falla
set -o errexit

# 1. Instalar las dependencias de Python
pip install -r requirements.txt

# 2. Correr las migraciones automáticas en la base de datos de Render
python backend/manage.py migrate

# 3. Crear el superusuario de forma automática sin interactuar con la consola
# (Cambia 'admin', 'admin@kiosco.com' y 'TuContraseña123*' por tus datos reales)
DJANGO_SUPERUSER_PASSWORD="Contrakiosco" python backend/manage.py createsuperuser --noinput --username lucas --email luksr570@.gmail.com || true