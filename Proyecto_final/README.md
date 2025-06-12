# Clicker Empire

Juego de estrategia incremental desarrollado como proyecto final para el ciclo superior de Desarrollo de Aplicaciones Web.

<p><img src="./Video_demostracion.gif"></p>

## Características

- 🎮 Juego de estrategia incremental con progreso persistente
- 📊 Sistema de ranking competitivo
- 💬 Foro de comunidad
- 👤 Perfil personalizable
- 🏆 Sistema de logros

## Tecnologías utilizadas

- **Frontend:** Astro, Bootstrap, jQuery
- **Backend:** Laravel, PHP
- **Base de datos:** MySQL
- **Despliegue:** Render.com, Clever Cloud

## Requisitos previos

- PHP 8.1 o superior
- Composer
- Node.js v23.2.0 o superior
- npm v10.9.2 o superior
- MySQL 8.0 o superior
- Git

## Instalación local

### 1. Clonar el repositorio
```bash
git clone https://github.com/jaolivacortes/Portfolio/Proyecto_final.git
cd Proyecto_final
```

### 2. Configurar el backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### 3. Configurar la base de datos

#### Opción 1: Base de datos local
1. Crear una base de datos MySQL en localhost
2. Configurar las credenciales en el archivo `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=clickerempiredb
DB_USERNAME=root
DB_PASSWORD=root
```
3. Importar los scripts SQL:
   - Descargar el script de creación de la base de datos desde [aquí](https://github.com/jaolivacortes/Portfolio/Proyecto_final/blob/main/BD/ClickerEmpireDB.sql)
   - Descargar el script de inserción de datos desde [aquí](https://github.com/jaolivacortes/Portfolio/Proyecto_final/blob/main/BD/ClickerEmpireDBInserts.sql)
   - Ejecutar primero el script de creación de la base de datos
   - Ejecutar después el script de inserción de datos
   - Ambos scripts deben ejecutarse en tu gestor de base de datos local (MySQL Workbench, phpMyAdmin, etc.)

#### Opción 2: Base de datos en Clever Cloud
1. Crear una cuenta en [Clever Cloud](https://www.clever-cloud.com/)
2. Crear una nueva instancia de MySQL
3. Obtener las credenciales de conexión
4. Configurar las variables de entorno en Render con las credenciales de Clever Cloud:
   - `DB_CONNECTION=mysql`
   - `DB_HOST` (proporcionado por Clever Cloud)
   - `DB_PORT` (proporcionado por Clever Cloud)
   - `DB_DATABASE` (proporcionado por Clever Cloud)
   - `DB_USERNAME` (proporcionado por Clever Cloud)
   - `DB_PASSWORD` (proporcionado por Clever Cloud)
5. Importar el script SQL inicial en la base de datos de Clever Cloud usando phpMyAdmin (incluido en Clever Cloud)

### 4. Configurar el frontend (Astro)
```bash
cd frontend
npm install
```

## Ejecución en desarrollo

### Opción 1: Backend con frontend build (Desarrollo)
```bash
# En el directorio backend
php artisan serve
```
Acceder a http://127.0.0.1:8000

### Opción 2: Frontend y backend separados (Desarrollo)
```bash
# Terminal 1 (backend)
cd backend
php artisan serve

# Terminal 2 (frontend)
cd frontend
npm run dev
```
Acceder a http://localhost:4321

Para esta opción, necesitas configurar el backend para desarrollo local. En los siguientes archivos, descomenta las líneas de desarrollo y comenta las de producción:

1. En `backend/config/cors.php`:
```php
'allowed_origins' => ['http://localhost:4321'],
// 'allowed_origins' => ['https://clickerempire.onrender.com'],
```

2. En `backend/config/session.php`:
```php
'encrypt' => false,
// 'encrypt' => env('SESSION_ENCRYPT', true),

'domain' => env('SESSION_DOMAIN', null),
'secure' => env('SESSION_SECURE_COOKIE', false),
// 'domain' => env('SESSION_DOMAIN', 'clickerempire.onrender.com'),
// 'secure' => env('SESSION_SECURE_COOKIE', true),
```

Después de hacer estos cambios, ejecuta:
```bash
php artisan config:clear
php artisan cache:clear
```

> **Nota:** En desarrollo puedes elegir entre la Opción 1 (backend con build de Astro) o la Opción 2 (servidores separados). Para producción, solo se puede usar la Opción 1 (backend con build de Astro).

## Despliegue en producción

### Opción 3: Backend con frontend build (Producción)
1. Preparar el frontend
```bash
cd frontend
npm run build
```

2. Mover el build al backend y configurar
- Copiar el contenido de `frontend/dist` a `backend/public`
- Asegurarse de que el archivo `config.js` está correctamente configurado con las URLs de producción
- Verificar que todas las variables de entorno en `.env` están configuradas para producción

### 4. Subir el proyecto a GitHub
```bash
# Inicializar repositorio Git si no existe
git init

# Añadir todos los archivos
git add .

# Crear commit inicial
git commit -m "Initial commit"

# Añadir el repositorio remoto (reemplaza la URL con tu repositorio)
git remote add origin https://github.com/tu-usuario/Proyecto_final.git

# Subir los cambios
git push -u origin main
```

### 5. Desplegar en Render.com
1. Crear una cuenta en [Render.com](https://render.com/)
2. Conectar el repositorio de GitHub
3. Crear un nuevo Web Service
4. Seleccionar el repositorio del proyecto
5. Configurar el servicio:
   - **Name:** (el nombre que prefieras)
   - **Region:** (la región que prefieras)
   - **Repository:** ruta del repositorio donde guardes todo, el fichero render.yaml y el directorio del proyecto
   - **Root Directory:** clicker-empire-backend
   - **Dockerfile Path:** Dockerfile
   - **Docker Build Context Directory:** .
6. Configurar las variables de entorno:
   - `APP_KEY` (generado con `php artisan key:generate`)
   - `DB_CONNECTION`
   - `DB_HOST`
   - `DB_DATABASE`
   - `DB_USERNAME`
   - `DB_PASSWORD`
7. Realizar el despliegue manual o automático
8. Esperar a que el servicio esté disponible en la URL proporcionada por Render

## Estructura del proyecto

```
Proyecto_final/
├── clicker-empire-backend/    # Backend Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/   # Controladores de la API
│   │   └── Models/           # Modelos de la base de datos
│   ├── config/               # Configuración de la aplicación
│   ├── database/             # Scripts SQL y configuración de BD
│   ├── docker/              # Configuración de Docker
│   ├── public/              # Directorio público (build del frontend)
│   ├── routes/              # Definición de rutas de la API
│   ├── storage/             # Almacenamiento de archivos
│   ├── .env                 # Variables de entorno
│   ├── composer.json        # Dependencias PHP
│   ├── docker-compose.yml   # Configuración de contenedores
│   └── Dockerfile          # Configuración de la imagen Docker
├── clicker-empire-frontend/   # Frontend Astro
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── layouts/         # Plantillas de página
│   │   └── pages/          # Páginas de la aplicación
│   └── public/             # Archivos estáticos
├── render.yaml              # Configuración de despliegue en Render
└── README.md
```

## Usuarios de prueba

### Player
- Email: player@gmail.com
- Contraseña: 1234

### Admin
- Email: admin@gmail.com
- Contraseña: 1234

## Enlaces

- [Aplicación en producción](https://clickerempire.onrender.com/)
- [Repositorio GitHub](https://github.com/jaolivacortes/Portfolio/Proyecto_final)

## Solución de problemas comunes

### Problemas de CORS
Si encuentras problemas de CORS durante el desarrollo:
1. Verifica la configuración en `backend/config/cors.php`
2. Asegúrate de que las sesiones están correctamente configuradas
3. Revisa que las URLs en `config.js` son correctas

### Archivo .env
Si encuentras problemas con las peticiones:
1. Revisa el archivo .env, comenta las de producción y descomenta las opciones del modo dev

### Problemas de build
Si el build del frontend no funciona correctamente:
1. Limpia la caché: `npm run clean`
2. Reinstala las dependencias: `npm install`
3. Intenta el build nuevamente: `npm run build`

## Contribución

Para contribuir al proyecto, sigue estos pasos:

1. **Fork del proyecto:**
   - Ve a la página principal del repositorio en GitHub
   - Haz clic en el botón "Fork" en la esquina superior derecha
   - Esto creará una copia del proyecto en tu cuenta de GitHub

2. **Clonar tu fork:**
   ```bash
   git clone https://github.com/tu-usuario/Portfolio/Proyecto_final.git
   ```

3. **Crear una rama para tu feature:**
   ```bash
   git checkout -b feature/NuevaCaracteristica
   ```

4. **Realizar tus cambios y commitear:**
   ```bash
   git add .
   git commit -m 'Añadir nueva característica'
   ```

5. **Subir tus cambios:**
   ```bash
   git push origin feature/NuevaCaracteristica
   ```

6. **Crear un Pull Request:**
   - Ve a tu fork en GitHub (https://github.com/tu-usuario/Portfolio/Proyecto_final)
   - Verás un mensaje indicando que has subido una nueva rama con un botón "Compare & pull request"
   - Haz clic en ese botón
   - En la página de creación del Pull Request:
     - Añade un título descriptivo que resuma tus cambios
     - En la descripción, detalla:
       - Qué cambios has realizado
       - Por qué son necesarios estos cambios
       - Cómo has implementado la solución
     - Añade capturas de pantalla si es relevante
     - Selecciona la rama principal del proyecto como destino
   - Haz clic en "Create pull request"
   - Espera a que se revisen tus cambios

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Autor

José Antonio Oliva Cortés - [GitHub](https://github.com/jaolivacortes)
