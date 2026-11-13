# Directorio CCU

Aplicación móvil desarrollada como Trabajo Final de la materia **Desarrollo para Dispositivos Móviles**, correspondiente a la Tecnicatura Universitaria en Desarrollo Web.

El proyecto busca digitalizar y facilitar el acceso al directorio de comercios del **Centro Comercial, Industrial y de Servicios de Concepción del Uruguay**, ofreciendo a los vecinos una herramienta para descubrir comercios, consultar sus ubicaciones y acceder a promociones.

La aplicación se conecta con una API REST desarrollada con NestJS y permite diferenciar las funcionalidades según el tipo de usuario.

## Funcionalidades principales

### Directorio de comercios
- Consulta del listado de comercios.
- Visualización de nombres, direcciones y horarios.
- Filtro de comercios abiertos en el momento.
- Acceso a la información detallada de cada establecimiento.

### Mapa interactivo
- Visualización de comercios sobre un mapa.
- Ubicación geográfica de los establecimientos.
- Selección de marcadores para consultar información.
- Acceso desde el mapa al detalle de cada comercio.

### Promociones
- Consulta de promociones disponibles.
- Visualización de los detalles de cada promoción.
- Generación de códigos QR para utilizar promociones como vecino.

### Usuarios y autenticación
- Inicio de sesión.
- Registro de usuarios.
- Diferenciación de roles: vecino y comercio.
- Recuperación de la sesión al volver a abrir la aplicación.
- Cierre de sesión.

### Panel de comercio
- Acceso restringido a usuarios con rol de comercio.
- Acceso a la cámara del dispositivo.
- Lectura de códigos QR de promociones.
- Validación de códigos mediante la API.
- Control de promociones ya utilizadas, vencidas o pertenecientes a otro comercio.

## Tecnologías utilizadas

### Aplicación móvil

- **React Native:** desarrollo de la interfaz móvil.
- **Expo SDK 57:** herramientas y entorno de desarrollo.
- **TypeScript:** tipado estático.
- **Expo Router:** navegación entre pantallas.
- **React 19:** biblioteca de interfaz.
- **React Native Maps:** visualización de mapas.
- **Expo Camera:** acceso a la cámara y lectura de códigos.
- **Expo SecureStore:** almacenamiento seguro del token de sesión.
- **Expo SQLite:** configuración de almacenamiento local.
- **React Native QRCode SVG:** generación de códigos QR.
- **AsyncStorage:** almacenamiento local de preferencias y datos.

### Backend

El proyecto utiliza una API REST independiente desarrollada con:

- **NestJS**
- **TypeScript**
- **SQLite**
- **TypeORM**
- **Docker**
- **Swagger**

La API administra la autenticación, los comercios, las promociones y la validación de usos, entre otros recursos.

## Estructura del proyecto

La aplicación está organizada de la siguiente manera:

```text
directorio-ccu/
│
├── src/
│   ├── app/                 # Pantallas y navegación
│   │   ├── (tabs)/          # Pestañas principales
│   │   ├── auth/            # Autenticación
│   │   ├── comercio/        # Detalle de comercios
│   │   ├── comercio-panel/  # Panel del comercio
│   │   └── promocion/       # Detalle de promociones
│   │
│   ├── components/          # Componentes reutilizables
│   ├── constants/           # Constantes y temas
│   ├── context/             # Contextos globales
│   ├── db/                  # Configuración de SQLite
│   ├── hooks/               # Hooks personalizados
│   ├── mocks/               # Datos de prueba
│   ├── services/            # Comunicación con la API
│   ├── storage/             # Persistencia local
│   ├── types/               # Tipos e interfaces
│   └── utils/               # Funciones auxiliares
│
├── assets/                  # Recursos gráficos
├── app.json                 # Configuración de Expo
├── app.config.js            # Configuración dinámica
├── eas.json                 # Perfiles de compilación
├── package.json             # Dependencias y scripts
└── README.md
```

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js compatible con Expo SDK 57.
- npm.
- Git.
- Docker Desktop.
- Un dispositivo Android o emulador compatible.
- Una computadora y un dispositivo conectados a la misma red local para realizar pruebas desde un teléfono físico.

También se necesita configurar una clave de Google Maps para habilitar correctamente los mapas en Android.

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/martinmorondo/Tp-Final-Desarrollo-para-Moviles.git

cd Tp-Final-Desarrollo-para-Moviles
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_API_URL=http://IP_DE_TU_PC:3000
```

Reemplazar `IP_DE_TU_PC` por la dirección IP local de la computadora donde se ejecuta el backend.

Por ejemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
```

La dirección debe corresponder a la IP real de la computadora en la red local.

**Importante:** no utilizar `localhost` como dirección de la API cuando se ejecuta la aplicación en un teléfono físico. En ese caso, `localhost` hace referencia al propio dispositivo.

El archivo `.env` no debe subirse al repositorio.

### 4. Configurar Google Maps

La aplicación utiliza `GOOGLE_MAPS_API_KEY` desde `app.config.js` para configurar Google Maps en Android.

Se debe proporcionar una clave válida mediante la variable de entorno:

```env
GOOGLE_MAPS_API_KEY=TU_CLAVE_DE_GOOGLE_MAPS
```

La clave debe estar habilitada para el servicio de mapas correspondiente en Google Cloud.

No publicar claves privadas ni credenciales en el repositorio.

## Configuración del backend

El backend se encuentra en un repositorio independiente.

Para obtenerlo, se debe clonar el proyecto correspondiente y acceder a su carpeta:

```bash
git clone https://github.com/franco-ruisdias-uner/api-proyectos-mobile.git

cd api-proyectos-mobile
```

Con Docker Desktop instalado y en ejecución, iniciar la API:

```bash
docker compose up --build
```

La primera ejecución puede demorar algunos minutos mientras Docker construye la imagen y prepara los servicios.

El entorno de demostración utiliza SQLite y carga datos iniciales automáticamente.

Cuando el servidor esté funcionando, se puede verificar desde el navegador:

- API: `http://localhost:3000`
- Estado del servidor: `http://localhost:3000/salud`
- Documentación Swagger: `http://localhost:3000/docs`

Para detener el backend:

```bash
Ctrl + C
```

También se puede utilizar:

```bash
docker compose down
```

**Importante:** el backend debe estar iniciado antes de utilizar las funcionalidades que requieren conexión con la API.

## Ejecutar la aplicación

El proyecto utiliza un cliente de desarrollo de Expo, por lo que se debe iniciar con:

```bash
npx expo start --dev-client --lan --clear
```

Una vez iniciado Metro:

1. Verificar que el teléfono y la computadora estén conectados a la misma red Wi-Fi.
2. Escanear el código QR mostrado en la terminal con el cliente de desarrollo instalado en el dispositivo.
3. Esperar a que la aplicación cargue.

Para estas pruebas se utiliza un Development Build compatible con las dependencias nativas del proyecto.

## Compilación con EAS

El proyecto incluye perfiles de compilación configurados en `eas.json`.

Para generar una compilación de desarrollo para Android:

```bash
eas build --platform android --profile development
```

Para generar una versión de prueba:

```bash
eas build --platform android --profile preview
```

Se necesita tener EAS CLI instalado y una sesión iniciada:

```bash
npm install -g eas-cli
eas login
```

## Cuentas de demostración

El backend incluye usuarios de prueba con una contraseña común:

**Contraseña:** `demo1234`

| Correo electrónico | Rol |
|---|---|
| `marta@mail.com` | Vecina |
| `nuevo@demo.ar` | Vecino |
| `tornillo@demo.ar` | Comercio |
| `otro.comercio@demo.ar` | Comercio |

Estas credenciales corresponden exclusivamente al entorno de demostración.

## Pruebas funcionales realizadas

Se realizaron pruebas sobre los principales recorridos de la aplicación:

| Funcionalidad | Resultado |
|---|---|
| Visualización del directorio | Correcto |
| Filtro de comercios abiertos | Correcto |
| Detalle de comercios | Correcto |
| Visualización del mapa | Correcto |
| Selección de marcadores | Correcto |
| Consulta de promociones | Correcto |
| Generación de QR por vecinos | Correcto |
| Inicio y cierre de sesión | Correcto |
| Persistencia de sesión | Correcto |
| Restricciones según el rol | Correcto |
| Acceso al panel de comercio | Correcto |
| Permisos y acceso a la cámara | Correcto |
| Validación de QR | Correcto |
| Rechazo de QR inválidos o duplicados | Correcto |
| Manejo de errores de conexión | Correcto |
| Recuperación al restablecer el backend | Correcto |

## Consideraciones

- La aplicación necesita conexión con el backend para las funcionalidades que consumen información de la API.
- Para utilizar la aplicación desde un teléfono físico, la API debe ser accesible mediante la IP local de la computadora.
- El funcionamiento de Google Maps depende de una clave válida.
- La disponibilidad de fotografías y videos depende del contenido cargado para cada comercio.
- Las funcionalidades de administración de promociones y otras operaciones del backend pueden requerir integración adicional en la interfaz móvil.

## Documentación de la API

La API cuenta con documentación interactiva generada mediante Swagger.

Una vez iniciado el backend, se puede acceder a:

```text
http://localhost:3000/docs
```

Desde allí es posible consultar los endpoints disponibles y sus parámetros.

---

**Proyecto académico — Trabajo Final de Desarrollo para Dispositivos Móviles.**

Centro Comercial, Industrial y de Servicios de Concepción del Uruguay.