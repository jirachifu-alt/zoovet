# Cumplimiento de la rúbrica — ZooVet / VetCare Pro

Este documento relaciona cada criterio de la rúbrica con la implementación real del repositorio y con las verificaciones realizadas.

---

## 1. Arquitectura y componentes Angular (4 pts)

### Implementación

- Aplicación **Angular 21** basada en **componentes standalone**, la arquitectura recomendada actualmente por Angular. No se usan `NgModule`; cada componente declara explícitamente sus dependencias con `imports`.
- Separación por capas:
  - `core/`: modelos tipados, servicios REST, guards, interceptor JWT y utilidades.
  - `shared/`: componentes reutilizables (`IconComponent`, `ModalComponent`, `ConfirmComponent`, `FieldErrorComponent`).
  - `layout/`: shell de la aplicación autenticada.
  - `pages/`: páginas de funcionalidad (dashboard, mascotas, citas, historial, vacunas, usuarios y autenticación).
- Servicios inyectables con `providedIn: 'root'` y uso de `inject()`.
- Modelos TypeScript para las entidades y DTO (`Pet`, `Appointment`, `MedicalRecord`, `VaccineRecord`, `User`, etc.).
- Componentes de página cargados de forma diferida desde `app.routes.ts`.

### Archivos de referencia

- `frontend/src/app/app.routes.ts`
- `frontend/src/app/app.config.ts`
- `frontend/src/app/core/services/`
- `frontend/src/app/shared/components/`
- `frontend/src/app/pages/`

---

## 2. Navegación y rutas protegidas (4 pts)

### Implementación

- Rutas públicas: `/login` y `/registro`.
- Rutas privadas dentro del layout autenticado: `/dashboard`, `/mascotas`, `/citas`, `/historial`, `/vacunas` y `/usuarios`.
- `authGuard` protege el layout completo; si no hay token redirige al login.
- `roleGuard` protege `/usuarios` y solo permite `ROLE_ADMIN`.
- Redirección de `/` a `/dashboard`, ruta comodín `**` y títulos de página en cada ruta.
- Restauración de scroll y navegación por anclas mediante `withInMemoryScrolling`.
- Navegación lateral con secciones por rol y cierre de sesión.

### Archivos de referencia

- `frontend/src/app/app.routes.ts`
- `frontend/src/app/app.config.ts`
- `frontend/src/app/core/guards/auth.guard.ts`
- `frontend/src/app/core/guards/role.guard.ts`
- `frontend/src/app/layout/layout.component.ts`

### Verificación

- Un usuario sin sesión que visita `/dashboard` es enviado a `/login`.
- Un usuario con rol distinto de administrador no puede acceder a `/usuarios`.
- El título del documento cambia según la ruta (por ejemplo, `Mascotas · ZooVet`).

---

## 3. Formularios reactivos, validaciones y manejo de errores (4 pts)

### Implementación

Todos los formularios de negocio usan `ReactiveFormsModule`, `FormBuilder` y `Validators`:

| Formulario | Validaciones principales |
|---|---|
| Login | correo obligatorio y con formato válido; contraseña obligatoria y mínimo 6 caracteres |
| Registro | nombre mínimo 3 caracteres; correo válido; teléfono con formato; contraseña mínimo 6; confirmación coincidente |
| Mascotas | nombre, especie y propietario obligatorios; fecha de nacimiento no futura; peso entre 0 y 500 kg; URL de foto válida |
| Citas | paciente obligatorio; fecha y hora futuras; motivo obligatorio entre 3 y 200 caracteres |
| Historial clínico | paciente, veterinario, fecha y motivo obligatorios; peso entre 0 y 500 kg |
| Vacunas | paciente, nombre y fecha de aplicación obligatorios; próximo refuerzo igual o posterior a la aplicación |
| Usuarios | nombre, correo, rol y contraseña obligatorios; correo válido; teléfono con formato; contraseña mínimo 6 |

Además:

- `FieldErrorComponent` centraliza los mensajes inline y solo los muestra cuando el campo está `touched` o `dirty`.
- Los controles inválidos reciben la clase `.is-invalid`, borde rojo y `aria-invalid`.
- Los errores del servidor se muestran dentro del modal o formulario mediante `apiErrorMessage()`.
- El botón de envío se deshabilita mientras se procesa la petición.
- La confirmación de contraseña se revalida cuando cambia la contraseña.
- La fecha de refuerzo de vacunas se revalida cuando cambia la fecha de aplicación.
- La creación de usuarios desde `/usuarios` usa `AuthService.createUser()` y **no reemplaza la sesión del administrador**.

### Archivos de referencia

- `frontend/src/app/shared/components/field-error/field-error.component.ts`
- `frontend/src/app/core/utils/validators.ts`
- `frontend/src/app/core/utils/api-error.ts`
- `frontend/src/app/pages/auth/auth.component.ts`
- `frontend/src/app/pages/pets/pets.component.ts`
- `frontend/src/app/pages/appointments/appointments.component.ts`
- `frontend/src/app/pages/medical-records/medical-records.component.ts`
- `frontend/src/app/pages/vaccines/vaccines.component.ts`
- `frontend/src/app/pages/users/users.component.ts`
- `frontend/src/styles.css` (estilos `.is-invalid` y `.field-error`)

### Verificación E2E realizada

Con Chrome headless y la API real en ejecución se comprobó:

- Login vacío: aparecen los errores de correo y contraseña y los campos quedan marcados.
- Mascotas vacío: aparecen los errores de nombre y propietario.
- Citas vacío: aparece el error de motivo.
- Historial vacío: aparecen los errores de paciente y motivo.
- Vacunas vacío: aparecen los errores de paciente y nombre de vacuna.
- Usuarios vacío: aparecen los errores de nombre, correo y contraseña.
- Se creó una mascota desde la UI y se eliminó después mediante la API.
- Se creó un usuario desde `/usuarios` y la sesión permaneció como `ROLE_ADMIN` en la misma ruta.
- No se registraron excepciones de JavaScript ni respuestas HTTP 4xx/5xx inesperadas durante el recorrido.

---

## 4. Consumo de API REST y manejo de respuestas/errores (5 pts)

### Implementación

- `HttpClient` con servicios tipados para cada recurso:
  - `AuthService`
  - `PetService`
  - `AppointmentService`
  - `MedicalRecordService`
  - `VaccineService`
  - `UserService`
  - `DashboardService`
  - `DatabaseService`
- URL base centralizada en `environment.apiUrl` (`http://localhost:8080/api`).
- Interceptor `authInterceptor` que agrega el token `Bearer` y redirige al login ante un `401`.
- Uso de `Observable` y `subscribe` con callbacks `next` y `error`.
- Estados de carga (`loading`, `saving`, `deleting`) y estados vacíos en las páginas.
- Normalización de errores con `apiErrorMessage()`, incluyendo mensajes del backend y errores de red.
- Operaciones CRUD completas: listar, crear, actualizar, cambiar estado y eliminar según el recurso.
- Rutas de API alineadas con los controladores Spring Boot.

### Verificación

- `POST /api/auth/login` respondió `200` con token JWT y datos del usuario.
- `GET /api/pets` respondió `200` con el listado.
- `POST /api/pets` respondió `200` y la mascota apareció en la UI.
- `DELETE /api/pets/{id}` respondió `200` y se usó para limpiar el dato de prueba.
- `POST /api/auth/register` respondió `200` al crear el usuario de prueba desde el módulo administrativo.
- No se observaron errores de consola ni respuestas HTTP inesperadas.

---

## 5. UI/UX responsive (3 pts)

### Implementación

- Interfaz con variables CSS, tarjetas, tablas, chips de filtros, modales y estados vacíos.
- Breakpoints responsive en `1100px`, `900px` y `520px`:
  - El sidebar se convierte en menú desplegable en pantallas pequeñas.
  - Las filas de formularios pasan de dos columnas a una.
  - Las tablas usan contenedor con desplazamiento horizontal.
  - Botones y barras de herramientas se adaptan al ancho disponible.
- Etiquetas `label` asociadas a los campos, `aria-invalid` en controles inválidos y `aria-label` en botones de icono.
- Mensajes de error inline y alertas visibles sin depender solo del color.
- Pantalla de login con panel visual y formularios accesibles.
- Dashboard con métricas, próximas citas y acciones rápidas.

### Archivos de referencia

- `frontend/src/styles.css`
- `frontend/src/app/layout/layout.component.ts`
- `frontend/src/app/pages/auth/auth.component.ts`
- `frontend/src/app/shared/components/modal/modal.component.ts`

---

## Comandos de verificación

```bash
# Compilación del frontend
cd frontend
npm run build

# Compilación y pruebas del backend
cd backend
./mvnw test
```

## Resultado

- `npm run build` finaliza correctamente.
- Los formularios de negocio usan formularios reactivos con validaciones.
- Las rutas privadas y la ruta de administración están protegidas.
- El consumo de API y los errores HTTP están implementados de forma consistente.
- La interfaz es responsive y mantiene la identidad visual del proyecto.
