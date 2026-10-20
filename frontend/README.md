# ZooVet - Frontend (Angular)

Aplicación frontend moderna desarrollada en **Angular** para el sistema de gestión veterinaria **ZooVet / VetCare Pro**, conectada al backend de **Spring Boot**.

---

## 🚀 Requisitos y Conexión con el Backend

El backend en Spring Boot corre por defecto en:
- **URL Base:** `http://localhost:8080`
- **Endpoints API:** `http://localhost:8080/api`

El frontend de Angular está configurado con:
- `src/environments/environment.ts`: `apiUrl: 'http://localhost:8080/api'`
- `proxy.conf.json`: Proxy automático de `/api` hacia `http://localhost:8080` al usar `ng serve` o `npm start`.

---

## 💻 Comandos Principales

Dentro de la carpeta `frontend`:

```bash
# Iniciar servidor de desarrollo (http://localhost:4200)
npm start
# o también:
npm run dev
# o con Angular CLI:
ng serve

# Compilar para producción
npm run build
```

---

## 🔑 Cuentas de Acceso (Cargadas por el Seeder del Backend)

| Rol | Correo | Contraseña |
|---|---|---|
| **Administrador** | `admin@zoovet.com` | `admin123` |
| **Veterinario** | `vet@zoovet.com` | `vet123` |
| **Cliente** | `cliente@zoovet.com` | `cliente123` |

*En la pantalla de Login hay botones de acceso rápido que rellenan e inician sesión automáticamente con cualquiera de estos 3 roles.*

---

## 📁 Estructura del Proyecto Angular

```text
frontend/src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts           # Protección de rutas privadas
│   │   └── role.guard.ts           # Control de acceso por roles (p.ej. ROLE_ADMIN)
│   ├── interceptors/
│   │   └── auth.interceptor.ts     # Inyección de token JWT (Bearer) y captura de 401
│   ├── models/
│   │   ├── user.model.ts           # Tipos de Usuario, Autenticación y Roles
│   │   ├── pet.model.ts            # Mascotas y DTOs
│   │   ├── appointment.model.ts    # Citas médicas y estados
│   │   ├── medical-record.model.ts # Historiales clínicos
│   │   ├── vaccine.model.ts        # Control de vacunación
│   │   └── dashboard.model.ts      # Métricas y estadísticas
│   ├── services/
│   │   ├── auth.service.ts         # Login, registro, sesiones y señales reactivas
│   │   ├── pet.service.ts          # CRUD de mascotas
│   │   ├── appointment.service.ts  # CRUD de citas y cambio de estados
│   │   ├── medical-record.service.ts # Consultas e historias clínicas
│   │   ├── vaccine.service.ts      # Registro y estados de vacunas
│   │   ├── dashboard.service.ts    # KPIs del panel
│   │   └── user.service.ts         # Directorio de clientes y veterinarios
│   └── utils/
│       └── format.ts               # Fechas, edades, iniciales y placeholders
├── layout/
│   └── layout.component.ts         # Sidebar receptivo, barra superior y navegación
├── pages/
│   ├── auth/                       # Iniciar sesión y Registro
│   ├── dashboard/                  # Estadísticas, citas y pacientes recientes
│   ├── pets/                       # Gestión y filtro de mascotas
│   ├── appointments/               # Agenda de citas y flujo de atención
│   ├── medical-records/            # Historial clínico y diagnósticos
│   ├── vaccines/                   # Inmunizaciones y alertas de vencimiento
│   └── users/                      # Administración de usuarios (solo admin)
└── shared/
    └── components/
        ├── icon/                   # Iconos SVG vectoriales basados en Lucide
        ├── modal/                  # Ventana modal reutilizable
        └── confirm/                # Diálogo de confirmación para eliminar
```
