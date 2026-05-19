# KioscoPro - Sistema de Gestión de Ventas e Inventario

KioscoPro es un sistema robusto, de grado de producción, diseñado para la gestión integral de pequeños y medianos comercios. Construido con una arquitectura moderna que separa el Frontend (React.js) del Backend (Django REST Framework), ofrece una experiencia de usuario rápida, reactiva y totalmente responsiva, respaldada por un motor de base de datos relacional.

## Arquitectura del Proyecto

El proyecto está dividido en dos aplicaciones principales:

### 1. Frontend (React.js)
Ubicado en la raíz del proyecto y el directorio `src/`.
- **Librerías principales:** React (v18), Tailwind CSS, Lucide React (Iconografía), Recharts (Visualización de datos), Day.js (Manejo de fechas).
- **Características:**
  - Diseño "Mobile-First" 100% responsivo.
  - Componentes de interfaz de usuario personalizados (ej. `CustomSelect`) para una óptima experiencia táctil.
  - Prevención de interferencias de traducción automática en valores financieros (`translate="no"`).
  - Generación de Tickets Digitales optimizados para impresión térmica y distribución digital.
  - Dashboard analítico en tiempo real.

### 2. Backend (Django)
Ubicado en el directorio `backend/`.
- **Framework:** Django 5.2, Django REST Framework.
- **Base de Datos actual:** Microsoft SQL Server (vía ODBC Driver).
- **Características:**
  - API RESTful para la gestión de Productos, Clientes, Proveedores y Ventas.
  - Configuración diferenciada para entorno de pruebas (utilizando SQLite en memoria para tests de alta velocidad).
  - Políticas estrictas de CORS.

## Requisitos Previos

- Node.js (v18 o superior)
- Python (v3.10 o superior)
- Microsoft SQL Server (o configuración de PostgreSQL recomendada para producción)
- ODBC Driver 17 for SQL Server (si se mantiene la configuración actual)

## Instalación y Configuración Local

### Frontend
1. Abrir una terminal en el directorio raíz del proyecto.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm start
   ```

### Backend
1. Navegar al directorio del backend:
   ```bash
   cd backend
   ```
2. Crear un entorno virtual:
   ```bash
   python -m venv venv
   ```
3. Activar el entorno virtual:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
   *(Nota: Asegurarse de tener `django-mssql-backend` o el conector correspondiente instalado).*
5. Aplicar migraciones a la base de datos:
   ```bash
   python manage.py migrate
   ```
6. Iniciar el servidor:
   ```bash
   python manage.py runserver
   ```

## Pruebas (Testing)

El sistema cuenta con un set de pruebas automatizadas (Unit & Integration Testing) configuradas.

**Frontend (Jest & React Testing Library):**
```bash
npm test -- --watchAll=false
```

**Backend (Django Test Framework):**
```bash
cd backend
python manage.py test api
```

## Próximos Pasos (Roadmap de Producción)
1. **Migración a PostgreSQL:** Transición recomendada para despliegues en la nube y contenerización óptima.
2. **Dockerización:** Creación de `Dockerfile` y `docker-compose.yml` para aislar y estandarizar entornos.
3. **Autenticación (JWT):** Implementar JSON Web Tokens para seguridad perimetral de la API.
4. **Exportación de Datos:** Descarga de reportes financieros y de inventario en formatos CSV/Excel.
