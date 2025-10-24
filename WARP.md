# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Profesort Analytics** is an Angular 20 educational analytics platform for managing teachers, students, courses, and attendance with integrated statistical analysis and alerting system.

The application demonstrates statistical concepts through real-time data visualization, including descriptive statistics (mean, median, mode, standard deviation, variance, coefficient of variation) applied to academic load distribution and student attendance tracking.

## Development Commands

### Building & Running
```powershell
# Install dependencies
npm install

# Start development server (default port 4200)
npm start

# Build for production
npm run build

# Build with file watching (development mode)
npm run watch

# Run tests
npm test
```

### Mock API (Optional Backend)
```powershell
# Start mock JSON server on port 3001
npm run mock-api

# Run frontend + mock API concurrently
npm run dev:with-mock
```

### Demo Data Management
```powershell
# In browser console (F12):
cargarDatosDemo()      # Load demo data with statistical scenarios
verAlertas()           # Display current alerts
verEstadisticas()      # Show system statistics
resetearSistema()      # Clear all data and reload
```

## Architecture

### Data Storage Strategy

**Dual-Mode Operation:** The application supports both LocalStorage and REST API backends, controlled via `environment.useLocalStorage`.

- **LocalStorage Mode (default):** All CRUD operations use browser storage via `LocalStorageService`
- **API Mode:** Services communicate with backend at `environment.apiUrl` (http://localhost:8000)

Each domain service has `-local` variants (e.g., `informes-local.service.ts`, `asistencia-local.service.ts`) that implement localStorage logic, while base services (e.g., `informes.service.ts`) handle API communication.

### Core Service Architecture

**Service Pattern:** All services follow Angular's `providedIn: 'root'` singleton pattern. Key service categories:

1. **Authentication & Authorization**
   - `AuthService` (src/app/core/services/services.ts): Session management, role-based access (Admin/Teacher/Student)
   - Guards: `AuthGuard`, `AdminGuard`, `TeacherGuard`, `InformesGuard` in `src/app/core/guards/guards.ts`

2. **Domain Services** (src/app/core/services/)
   - `EstudiantesService` / `EstudiantesLocalService`: Student CRUD
   - `MateriasService` / `MateriasLocalService`: Course/subject management
   - `AsistenciaService` / `AsistenciaLocalService`: Attendance records
   - `AdminDocenteService` / `AdminDocenteLocalService`: Teacher management
   - `AsignacionesService`: Teacher-course assignments

3. **Analytics & Statistics**
   - `InformesService` / `InformesLocalService`: Statistical calculations (mean, median, mode, σ, CV)
   - `AlertasEstadisticasService`: Statistical threshold detection
   - `AlertasService`: Alert aggregation and prioritization

4. **UI Support Services**
   - `ResaltadorService`: Visual element highlighting with animations
   - `DatosDemoService`: Demo data generation with statistical scenarios

### Routing & Lazy Loading

**Route Structure:**
```
/ (PublicLayout)
  ├─ /home
  ├─ /about
  ├─ /contact
  └─ /portfolio/* (4 portfolio pages)
/login
/register
/admin (AdminGuard) [lazy loaded]
  ├─ /admin (inicio)
  ├─ /admin/docentes
  ├─ /admin/estudiantes
  │   ├─ /admin/estudiantes/listado
  │   └─ /admin/estudiantes/asistencia
  ├─ /admin/materias
  └─ /admin/informes (InformesGuard)
/docente (TeacherGuard) [lazy loaded]
  ├─ /docente (inicio)
  ├─ /docente/estudiantes
  ├─ /docente/materias
  ├─ /docente/asistencia
  └─ /docente/perfil
```

Admin and teacher routes are lazy loaded via `loadChildren()` in `app.routes.ts`.

### Statistical Analysis System

**Key Calculations** (implemented in `InformesLocalService`):

- **Descriptive Statistics:** Mean, median, mode, range for academic load
- **Dispersion Metrics:** Standard deviation (σ), variance (σ²), coefficient of variation (CV)
- **Interpretation Thresholds:**
  - σ < 1.0: Excellent distribution
  - σ < 1.5: Good distribution
  - σ < 2.0: Regular (needs minor adjustments)
  - σ ≥ 2.0: Critical (requires redistribution)

**Alert System** (AlertasService + AlertasEstadisticasService):

Automatically generates prioritized alerts (1-5 scale) based on:
- Student attendance < 60% (critical) or 60-70% (warning)
- Teachers with > μ + 2σ courses (overloaded) or < 2 courses (underutilized)
- Unassigned courses > 5 (critical)
- High CV > 50% (unequal distribution)
- High σ > 1.5 (redistribution needed)

Alerts are contextually filtered by panel (e.g., teacher panel shows only teacher-related alerts).

### Component Communication

**Banner Alert System** (`BannerAlertasComponent`):
- Subscribes to `AlertasService.getAlertas()`
- Filters alerts by category based on current panel
- Provides "Ver y Corregir" (View & Fix) buttons that:
  1. Navigate to the relevant admin panel
  2. Trigger `ResaltadorService` to highlight problem elements
  3. Scroll to the highlighted element with smooth animation

**State Management:** No global state library. Services use RxJS `BehaviorSubject` for reactive state (e.g., `currentUser$` in AuthService).

## Development Patterns

### TypeScript Configuration
- **Strict mode enabled**: All strict TypeScript checks active
- **Path aliases:** Use `src/*` imports (configured in tsconfig.json)
- **Angular strict templates:** Template type checking enabled

### Service Injection Pattern
When creating new services that need dual-mode support:
1. Create base service with API logic (e.g., `nuevo.service.ts`)
2. Create local variant (e.g., `nuevo-local.service.ts`)
3. Base service conditionally delegates to local service based on `environment.useLocalStorage`

### Data Models
Core interfaces defined in:
- `src/app/core/models/models.ts` (basic models)
- `src/app/core/services/local-storage.service.ts` (LocalStorage-specific interfaces)
- `src/app/core/services/services.ts` (Auth-related interfaces)

### Testing Demo Scenarios
The system includes pre-configured demo data (via `cargarDatosDemo()`) designed to trigger specific statistical alerts:
- 3 students with critical attendance (< 60%)
- 2 overloaded teachers (7-8 courses)
- 2 underutilized teachers (1 course)
- 10 unassigned courses
- High σ ≈ 2.4 and CV ≈ 68%

Use this for testing alert generation and UI responses.

## File Organization

```
src/app/
├── core/
│   ├── guards/          # Route guards (AuthGuard, AdminGuard, TeacherGuard)
│   ├── models/          # TypeScript interfaces
│   └── services/        # Business logic & data services
├── features/
│   ├── admin/           # Admin dashboard (docentes, estudiantes, materias, informes)
│   ├── auth/            # Login/register components
│   ├── docente/         # Teacher dashboard
│   └── public/          # Public pages (home, about, portfolios)
└── shared/
    ├── components/      # Reusable components (banner-alertas, footer, header)
    ├── directives/
    ├── pipes/
    └── styles/          # Global styles
```

## Key Technical Details

- **Angular Version:** 20.1.0 with standalone components (no NgModules)
- **UI Framework:** Bootstrap 5.3.7 + Bootstrap Icons
- **Charts:** Chart.js 4.5.1 for statistical visualizations
- **Browser Storage Keys:** 
  - `profesort_usuarios`
  - `profesort_materias`
  - `profesort_asignaciones`
  - `profesort_asistencias`
  - `profesort_alertas`
  - `profesort_initialized`

## Environment Configuration

Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  useLocalStorage: true  // Toggle between LocalStorage and API mode
};
```

For production builds, Angular uses file replacement to load `environment.prod.ts` (configured in angular.json).

## Common Workflows

### Adding a New Statistical Metric
1. Update calculation logic in `InformesLocalService.getEstadisticasCarga()`
2. Add interface property to `EstadisticasCarga` in `informes.service.ts`
3. Create/update chart visualization in relevant component (e.g., `informes.component.ts`)
4. If threshold-based, add alert logic to `AlertasEstadisticasService`

### Creating a New Alert Type
1. Add detection logic to `AlertasEstadisticasService.calcularMetricasYAlertas()`
2. Return `AlertaEstadistica` object with appropriate priority (1-5)
3. Banner will automatically display and filter the new alert
4. Optionally add navigation logic to `BannerAlertasComponent.verProblema()`

### Adding a New Role/Guard
1. Define role ID in `UsuarioLocal.id_rol` (1=Admin, 2=Teacher, 3=Student)
2. Create guard class in `guards.ts` implementing `CanActivate`
3. Add role check method to `AuthService` (e.g., `isTeacher()`)
4. Apply guard to routes in `admin.routes.ts` or `docente.routes.ts`
