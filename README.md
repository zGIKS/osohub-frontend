# OSOHUB Frontend

Una aplicación de red social para compartir imágenes construida con React y Vite.

## 🚀 Configuración rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia el archivo de ejemplo y ajusta las variables:
```bash
cp .env.example .env
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

## 🔧 Variables de entorno

El proyecto utiliza las siguientes variables de entorno (definidas en `.env`):

### API Configuration
- `VITE_API_BASE_URL`: URL base del backend API (default: `http://localhost:8080`)
- `VITE_API_TIMEOUT`: Timeout para peticiones API en ms (default: `10000`)

### App Configuration
- `VITE_APP_NAME`: Nombre de la aplicación (default: `OSOHUB`)
- `VITE_APP_VERSION`: Versión de la aplicación (default: `1.0.0`)

### Development flags
- `VITE_ENABLE_MOCK_DATA`: Habilita datos mock cuando el backend no está disponible (default: `true`)
- `VITE_DEBUG_API`: Habilita logs detallados de las peticiones API (default: `true`)

### Ejemplo de configuración para producción:
```env
VITE_API_BASE_URL=https://api.osohub.com
VITE_API_TIMEOUT=15000
VITE_ENABLE_MOCK_DATA=false
VITE_DEBUG_API=false
```

**Nota**: Las claves de localStorage para autenticación (`authToken`, `currentUserId`) están definidas como constantes en el código, no como variables de entorno, ya que no deberían variar entre entornos.

## 📁 Estructura del proyecto

```
src/
├── config/           # Configuración centralizada
├── shared/
│   └── api/         # Cliente API y configuración
├── auth/            # Autenticación y gestión de usuarios
│   ├── pages/       # Login, SignUp, Profile, Settings
│   └── services/    # userService
├── images/          # Gestión de imágenes
│   ├── components/  # ImageCard, modales
│   ├── pages/       # Feed
│   └── services/    # imageService
└── router/          # Configuración de rutas
```

## 🔗 API Endpoints

El frontend está configurado para trabajar con los siguientes endpoints:

### Autenticación
- `POST /auth/login` - Login de usuario

### Usuarios
- `GET /users/:user_id` - Obtener usuario por ID
- `POST /users` - Crear nuevo usuario
- `PATCH /users/me` - Actualizar perfil
- `GET /users/:user_id/images` - Obtener imágenes de usuario

### Imágenes
- `GET /feed` - Obtener feed de imágenes
- `POST /images` - Subir nueva imagen
- `GET /images/byid/:image_id` - Obtener imagen por ID
- `DELETE /images/:image_id` - Eliminar imagen
- `POST /images/:image_id/like` - Like a imagen
- `DELETE /images/:image_id/like` - Quitar like
- `POST /images/:image_id/report` - Reportar imagen

## 🛠️ Scripts disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecutar linter

## 🎨 Características

- ✅ Autenticación JWT
- ✅ Upload de imágenes con modal moderno
- ✅ Feed de imágenes responsivo
- ✅ Sistema de likes y reportes
- ✅ Gestión de perfil de usuario
- ✅ Diseño responsivo (mobile-first)
- ✅ Modo fallback con datos mock
- ✅ Logging detallado para desarrollo
- ✅ Configuración centralizada con variables de entorno

## 📱 Compatibilidad

- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+

## 🔒 Seguridad

- Tokens JWT almacenados en localStorage
- Interceptores para manejo automático de autenticación
- Redirección automática en caso de tokens expirados+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
