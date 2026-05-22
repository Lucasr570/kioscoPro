#!/usr/bin/env bash
# Salir inmediatamente si un comando falla
set -o errexit

# 1. Entrar a la carpeta del backend e instalar dependencias
pip install -r backend/requirements.txt

# 2. Correr las migraciones apuntando al manage.py correcto
python backend/manage.py migrate

# 3. Crear el superusuario de forma automática sin pedir datos por consola
# (Cambia 'admin', 'admin@kiosco.com' y 'TuContraseña123*' por lo que tú quieras)
DJANGO_SUPERUSER_PASSWORD="Contrakiosco" python backend/manage.py createsuperuser --noinput --username lucas --email luksr570@gmail.com || true