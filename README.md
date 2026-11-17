# ZooVet / VetCare Pro

Sistema de gestión veterinaria **full stack** para administrar pacientes, citas, historial clínico, vacunas y usuarios.

- **Frontend:** Angular 21 con componentes standalone, formularios reactivos y consumo de API REST.
- **Backend:** Spring Boot 3 + Spring Security + JWT.
- **Base de datos:** MySQL 8.

---

## Estructura del repositorio

```text
zoovet/
├── backend/                 API REST en Spring Boot
├── database/                Esquema y script SQL con datos de ejemplo
├── frontend/                Aplicación Angular
│   └── src/app/
│       ├── core/            Servicios, modelos, guards, interceptor y utilidades
│       ├── shared/          Componentes reutilizables (modal, iconos, errores de campo)
│       ├── layout/          Shell autenticado (sidebar, header, navegación)
│       └── pages/           Dashboard, mascotas, citas, historial, vacunas, usuarios y auth
├── docs/                    Documentación y evidencias de la rúbrica
└── README.md
```

## Requisitos

- Node.js 20+ y npm
- Java 21 y Maven (o usar `mvnw`)
- MySQL 8 en `localhost:3306`

## Ejecución local

### 1. Base de datos

Crear la base `zoovet_db` y cargar el script de ejemplo:

```bash
mysql -u root -p < database/zoovet_completo_con_datos.sql
```

También se puede restaurar desde la pantalla de login con el botón **Base de Datos SQL**, que llama a `POST /api/database/inject-sql`.

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

En Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

La API queda disponible en `http://localhost:8080/api`.

### 3. Frontend

```bash
cd frontend
npm ci
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

## Credenciales de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@zoovet.com` | `admin123` |
| Veterinario | `vet@zoovet.com` | `vet123` |
| Cliente | `cliente@zoovet.com` | `cliente123` |

La pantalla de login incluye botones de acceso rápido para los tres roles.

## Funcionalidades principales

- Dashboard con métricas de la clínica y próximas citas.
- CRUD de mascotas con datos del propietario, peso, color y foto.
- Agenda de citas con estados y cambio de estado desde la tabla.
- Historial clínico con diagnóstico, tratamiento, receta y peso registrado.
- Registro de vacunas con cálculo de vigencia y próximo refuerzo.
- Administración de usuarios y roles; la creación de usuarios no cierra la sesión del administrador.
- Rutas protegidas por autenticación y por rol (`ROLE_ADMIN` para `/usuarios`).
- Formularios reactivos con validaciones inline y mensajes de error del servidor.
- Interfaz responsive con menú lateral adaptativo, tablas desplazables y modales.

## Formularios reactivos

Todos los formularios de negocio usan `ReactiveFormsModule`, `FormBuilder` y `Validators`:

- Login y registro: correo válido, contraseña mínima y confirmación de contraseña.
- Mascotas: nombre, especie y propietario obligatorios; fecha de nacimiento no futura; peso y URL validados.
- Citas: paciente, fecha futura y motivo obligatorios.
- Historial: paciente, veterinario, fecha y motivo obligatorios.
- Vacunas: paciente, nombre y fecha de aplicación obligatorios; el refuerzo no puede ser anterior a la aplicación.
- Usuarios: nombre, correo, rol y contraseña obligatorios; formato de correo y teléfono validados.

El componente reutilizable `FieldErrorComponent` muestra el mensaje correspondiente y `apiErrorMessage()` normaliza los errores HTTP para mostrarlos en la interfaz.

## Rutas principales

| Ruta | Descripción | Protección |
|---|---|---|
| `/login` | Inicio de sesión | Pública |
| `/registro` | Registro de clientes | Pública |
| `/dashboard` | Panel general | Autenticado |
| `/mascotas` | Gestión de mascotas | Autenticado |
| `/citas` | Agenda de citas | Autenticado |
| `/historial` | Historial clínico | Autenticado |
| `/vacunas` | Control de vacunación | Autenticado |
| `/usuarios` | Administración de usuarios | Solo `ROLE_ADMIN` |

Las rutas usan carga diferida (`loadComponent`), títulos de página, restauración de scroll y una ruta comodín que redirige al inicio.

## Verificación

```bash
cd frontend
npm run build
```

Para la compilación del backend:

```bash
cd backend
./mvnw test
```

## Documentación de la rúbrica

El detalle del cumplimiento de los cinco criterios, con archivos y evidencias, está en:

- [`docs/CUMPLIMIENTO_RUBRICA_APF3.md`](docs/CUMPLIMIENTO_RUBRICA_APF3.md)
