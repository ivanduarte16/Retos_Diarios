# Informe Maestro v1 - Proyecto Retos Diarios

> Fecha de elaboracion: 2026-03-05  
> Version del informe: v1  
> Repositorio local: `C:\Users\ivand\Retos_Diarios`

---

## 1. Objetivo de este documento

Este informe describe de forma completa el estado actual del proyecto **Retos Diarios**:

- arquitectura tecnica
- estructura de carpetas y archivos
- flujos funcionales principales
- modelo de datos
- seguridad y reglas
- despliegue y operacion
- deuda tecnica y mejoras recomendadas

El objetivo es que cualquier persona (tu, otra persona del equipo o un futuro mantenimiento) pueda entender rapidamente **como funciona todo el sistema** y donde tocar cada parte.

---

## 2. Resumen ejecutivo

**Retos Diarios** es una SPA en React con backend en Firebase (Auth, Firestore y Storage), pensada para dos usuarios autorizados que comparten:

- un reto diario aleatorio
- subida de respuestas (texto + fotos)
- historial visual tipo album
- estadisticas de racha conjunta

El proyecto tiene dos modos de funcionamiento:

1. **Modo real Firebase**: usa datos reales en nube.
2. **Modo demo**: si faltan variables `VITE_FIREBASE_*`, usa almacenamiento local en memoria + `localStorage`.

Estado global actual:

- arquitectura razonablemente limpia y modular
- capa de servicios centralizada
- reglas Firestore mas restrictivas que en la version inicial
- manejo de concurrencia mejorado en logica critica
- build de produccion funcional

---

## 3. Stack y dependencias

## 3.1 Frontend

- React 18
- React Router DOM 6
- Framer Motion (animaciones)
- Lucide React (iconos)
- Tailwind CSS 3
- Vite 5

## 3.2 Backend as a Service

- Firebase Auth (email/password)
- Cloud Firestore (datos)
- Firebase Storage (imagenes)

## 3.3 Fechas y utilidades

- `date-fns`
- `date-fns-tz` (zona fija `Europe/Madrid`)

## 3.4 Herramientas de mantenimiento

- `firebase-admin` en devDependencies para scripts Node de importacion masiva de retos

---

## 4. Estructura del proyecto

```txt
Retos_Diarios/
|- public/
|  |- favicon.svg
|  |- manifest.json              (NUEVO v2 — PWA)
|- scripts/
|  |- add_retos.js
|  |- import_retos_firestore.js
|- src/
|  |- components/
|  |  |- BottomNav.jsx
|  |  |- ModalRespuesta.jsx
|  |  |- ModalVerRespuestas.jsx
|  |  |- Onboarding.jsx               (NUEVO v3 — pantalla intro)
|  |  |- ui/
|  |     |- ActivityHeatmap.jsx        (NUEVO v3 — heatmap actividad)
|  |     |- AnimatedCounter.jsx        (NUEVO v3 — contador animado)
|  |     |- InlineError.jsx
|  |     |- ModalShell.jsx
|  |     |- PageTransition.jsx         (NUEVO v3 — transiciones pagina)
|  |     |- Skeleton.jsx               (NUEVO v3 — skeleton loaders)
|  |     |- ToastCenter.jsx
|  |- contexts/
|  |  |- AuthContext.jsx
|  |- data/
|  |  |- retosIniciales.js        (NUEVO v2 — datos extraidos de demoData)
|  |- hooks/
|  |  |- useNombresPorUid.js      (NUEVO v2 — hook de resolucion nombres)
|  |- pages/
|  |  |- LoginPage.jsx
|  |  |- HomePage.jsx
|  |  |- HistorialPage.jsx
|  |  |- AnadirRetoPage.jsx
|  |  |- PerfilPage.jsx
|  |- services/
|  |  |- firebaseService.js
|  |  |- demoData.js
|  |- utils/
|  |  |- categorias.js            (NUEVO v2 — constantes unificadas)
|  |  |- date.js
|  |  |- streak.js                (NUEVO v2 — funciones racha/fecha)
|  |  |- user.js
|  |- App.jsx
|  |- firebase.js
|  |- index.css
|  |- main.jsx
|- .env.example
|- firestore.rules
|- index.html
|- package.json
|- tailwind.config.js
|- vite.config.js
```

---

## 5. Arquitectura de aplicacion (alto nivel)

Flujo principal:

1. `main.jsx` monta `App`.
2. `App.jsx` define rutas con `ProtectedRoute`.
3. `AuthProvider` en `AuthContext` resuelve sesion actual.
4. Las paginas consumen datos via `firebaseService`.
5. `firebaseService` deriva a:
   - Firebase real (`db`, `storage`)
   - o `demoStore` (`demoData.js`) si no hay env valida.

Separacion por capas:

- **UI/rutas**: `pages/*`
- **componentes reutilizables**: `components/*`, `components/ui/*`
- **estado global auth**: `contexts/AuthContext.jsx`
- **acceso a datos**: `services/firebaseService.js`
- **fallback offline/demo**: `services/demoData.js`
- **utilidades puras**: `utils/*`

---

## 6. Configuracion y variables de entorno

Archivo base: `.env.example`

Variables esperadas:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Regla actual de modo demo:

- Si `VITE_FIREBASE_API_KEY` no existe o vale `YOUR_API_KEY`, la app entra en demo.

---

## 7. Inicializacion Firebase

Archivo: `src/firebase.js`

Puntos clave:

- Inicializa `app` con config real o demo.
- Exporta `auth`, `db`, `storage`, `isDemoMode`.
- Firestore se inicializa con cache local persistente:
  - `initializeFirestore(app, { localCache: persistentLocalCache() })`

Implicacion:

- mejora experiencia offline/cold start respecto a API antigua de persistencia.

---

## 8. Autenticacion y perfiles

Archivo: `src/contexts/AuthContext.jsx`

Funcionalidad:

- `login(email, password)`:
  - en demo valida contra `DEMO_USERS`
  - en real usa `signInWithEmailAndPassword`
- `logout()`:
  - limpia estado demo o llama `signOut`
- `onAuthStateChanged`:
  - si usuario real no tiene doc en `usuarios/{uid}`, lo crea con valores por defecto.

Estado global expuesto por contexto:

- `currentUser`
- `userProfile`
- `setUserProfile`
- `login`
- `logout`
- `isDemoMode`

---

## 9. Capa de datos central (firebaseService)

Archivo: `src/services/firebaseService.js`

Este archivo es el "core" funcional del proyecto.

## 9.1 Gestion de retos diarios

- `getFechaHoy()` fija fecha en `Europe/Madrid`.
- `getRetoDiario()`:
  - intenta leer `reto_diario/{yyyy-mm-dd}`
  - si no existe, elige reto no usado y crea reto diario
  - usa `runTransaction` para evitar colisiones concurrentes
  - reintenta hasta 8 veces si detecta contencion
- `getRetosDisponibles()`:
  - si no quedan retos libres, resetea flag `usado`
  - deja log de reinicio de ciclo

## 9.2 CRUD de retos

- `getRetos()`
- `addReto(texto, categoria, creadoPor)`
- `deleteReto(id)`

## 9.3 Posts/respuestas

- `getPost(fecha)`
- `getPosts()`
- `subirRespuesta(fecha, usuario, texto, archivos)`:
  - sube fotos a Storage
  - usa `Promise.allSettled` para controlar fallos parciales de subida
  - persiste post con `runTransaction` para evitar race condition entre usuarios

## 9.4 Usuarios y stats

- `getUsuario(uid)`
- `updateUsuario(uid, data)`
- `getStats()`
  - calcula total completados
  - calcula racha actual
  - calcula racha maxima historica
- `calcStats(posts)` (NUEVO v2)
  - misma logica que `getStats()` pero recibe array de posts ya cargado
  - evita lecturas duplicadas a Firestore cuando caller ya tiene los posts

---

## 10. Modo demo (demoData)

Archivo: `src/services/demoData.js`

Proposito:

- simular backend completo cuando no hay Firebase configurado.

Contenido:

- lista extensa de retos iniciales (incluye retos base + importados)
- posts demo precargados
- usuarios demo

Persistencia:

- mantiene estado en `localStorage` (`demoStore`).

Capacidades:

- replica metodos equivalentes a `firebaseService`:
  - retos, reto diario, posts, usuarios, stats

Limitacion:

- no hay seguridad real de servidor (todo corre en cliente, como es esperado en demo).

---

## 11. Paginas y experiencia de usuario

## 11.1 Login (`LoginPage.jsx`)

- formulario email/password
- muestra errores inline
- pista de credenciales demo

## 11.2 Home (`HomePage.jsx`)

- carga reto del dia + post + stats
- animacion "bingo" previa a mostrar tarjeta
- anti repeticion de animacion por dia con `localStorage` (`retos_diarios_bingo_seen_date`)
- acciones:
  - subir/actualizar respuesta
  - ver respuestas
- muestra racha y estado de ambos usuarios

## 11.3 Historial (`HistorialPage.jsx`)

- lista de posts en grid
- filtros por categoria y completados
- modal de detalle por reto/post
- resolucion de nombres por `uid` para evitar "Usuario" generico

## 11.4 Anadir reto (`AnadirRetoPage.jsx`)

- crea retos personalizados
- selector de categoria
- lista de retos propios con opcion de borrado (si no usado)

## 11.5 Perfil (`PerfilPage.jsx`)

- edicion de nombre, emoji y color
- estadisticas resumidas
- logout

---

## 12. Componentes reutilizables

## 12.1 Navegacion

- `BottomNav.jsx`:
  - modo barra lateral desktop
  - modo bottom nav en movil

## 12.2 Modales funcionales

- `ModalRespuesta.jsx`: formulario de respuesta y carga de imagenes
- `ModalVerRespuestas.jsx`: comparativa de respuestas de ambos

## 12.3 UI base (`components/ui`)

- `ModalShell`: estructura estandar de modal + backdrop + animacion
- `ToastCenter`: feedback centrado temporal
- `InlineError`: caja de error estandar

---

## 13. Utilidades

## 13.1 `utils/date.js`

- normaliza fechas Firestore/Date/string
- formatea fechas de cabecera/corta/larga en locale `es-ES`

## 13.2 `utils/user.js`

- detecta nombres genericos (`usuario`)
- resuelve nombre final mostrado en UI a partir de perfil/respuesta/fallback

---

## 14. Modelo de datos (Firestore + Storage)

## 14.1 Coleccion `usuarios`

Documento: `usuarios/{uid}`

Campos habituales:

- `nombre`
- `emoji`
- `color`

## 14.2 Coleccion `retos`

Documento: `retos/{id}`

Campos:

- `texto`
- `categoria`
- `creadoPor`
- `fechaCreacion`
- `usado`
- `fechaUsado`

## 14.3 Coleccion `reto_diario`

Documento: `reto_diario/{yyyy-mm-dd}`

Campos:

- `retoId`
- `retoTexto`
- `categoria`
- `fecha`
- `completado`

## 14.4 Coleccion `posts`

Documento: `posts/{yyyy-mm-dd}`

Campos:

- `retoId`
- `retoDiarioId`
- `retoTexto`
- `categoria`
- `fecha`
- `respuestas[]`
  - `usuarioId`
  - `usuarioNombre`
  - `emoji`
  - `texto`
  - `fotos[]`
  - `fechaSubida`
- `completadoPor[]`
- `completadoTotal`

## 14.5 Firebase Storage

Ruta de subida de imagenes:

- `posts/{fecha}/{uid}/{nombre_archivo}`

---

## 15. Seguridad y reglas

Archivo: `firestore.rules`

Esquema actual:

- funcion `isAllowedUser()` restringe a 2 UIDs concretos.
- `usuarios/{uid}`:
  - lectura para usuarios permitidos
  - escritura solo del propio `uid`
- `retos/{id}`:
  - lectura permitida
  - create/delete ligado a `creadoPor`
  - update permitido con condicion de coherencia
- `reto_diario/{fecha}` y `posts/{fecha}`:
  - lectura/escritura para usuarios permitidos

Notas:

- El archivo de clave de servicio esta ignorado en `.gitignore`.
- Aun asi, si alguna clave llego a remoto historicamente, debe revocarse y rotarse.
- En entornos CI/CD o Vercel, los scripts admin **siempre** deben autenticarse via la variable de entorno `GOOGLE_APPLICATION_CREDENTIALS` apuntando a un secreto de plataforma. Nunca usar el archivo fisico `serviceAccountKey.json` fuera del entorno local de desarrollo.

---

## 16. Scripts de mantenimiento

## 16.1 `scripts/import_retos_firestore.js`

Uso:

- importar retos desde `ListaRetos.txt` a Firestore
- evita duplicados por texto normalizado
- clasifica categoria por heuristicas de palabras
- usa lotes (`batch`) para eficiencia

Dependencias:

- `firebase-admin`
- clave de servicio por `GOOGLE_APPLICATION_CREDENTIALS` o `serviceAccountKey.json` local

## 16.2 `scripts/add_retos.js`

Uso:

- script utilitario de insercion en `demoData.js` (actualmente secundario)

---

## 17. Estilos y diseno

- Tailwind como base de utilidades.
- Tokens extendidos en `tailwind.config.js`:
  - paleta `cream/coral/mustard/ink`
  - tipografias `Playfair Display` y `DM Sans`
  - sombras y animaciones custom
- Estilos globales y clases de composicion en `src/index.css`.
- Safe area para nav movil con `.safe-bottom`.

---

## 18. Build y despliegue

Scripts npm:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run import:retos`

Despliegue esperado:

- GitHub + Vercel (auto deploy por push a `main`).

Observacion de build actual:

- warning de bundle grande (`~970 kB`) por peso de dependencias Firebase y app en un chunk principal.
- Recomendado: separar Firebase en su propio chunk via code splitting manual en `vite.config.js`:

```js
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        firebase: [
          "firebase/app",
          "firebase/auth",
          "firebase/firestore",
          "firebase/storage",
        ];
      }
    }
  }
}
```

---

## 19. Variables sensibles en Vercel

Todas las variables `VITE_FIREBASE_*` deben configurarse en:

- Vercel Dashboard → proyecto → Settings → Environment Variables

Reglas de buenas practicas:

- marcar cada variable como **Sensitive** (Vercel las oculta en logs y previsualizaciones)
- no exponer valores reales en el repositorio bajo ningun nombre de archivo `.env.*` salvo `.env.example`
- si se rotan las claves de Firebase (por seguridad o incidente), actualizar las variables en Vercel y forzar un redeploy
- no loguear en consola ninguna variable de entorno en codigo de produccion

---

## 20. Observaciones tecnicas relevantes

1. Hay partes de UI/texto con codificacion inconsistente visible en consola (`Ã`, `ðŸ`, etc).  
   Causa probable: archivos guardados en Windows con codificacion distinta a UTF-8.  
   Solucion: abrir cada archivo afectado en VS Code → barra inferior → clic en la codificacion actual → "Reopen with Encoding" → UTF-8 → guardar. Unificar codificacion UTF-8 en todos los archivos del proyecto.

2. Falta suite de tests automatizados (unit/integration/e2e).  
   Recomendado: empezar por tests de servicios (`getRetoDiario`, `subirRespuesta`, `getStats`).

3. Falta definicion formal de indices Firestore (`firestore.indexes.json`) para escalado futuro.

4. `scripts/add_retos.js` es fragil (insercion por indice de `]`); mantenerlo solo como herramienta puntual.

---

## 21. Checklist operativo rapido

Para levantar entorno productivo de cero:

1. Configurar proyecto Firebase (Auth, Firestore, Storage).
2. Crear 2 usuarios en Auth y obtener UIDs.
3. Ajustar `firestore.rules` con UIDs correctos y publicar.
4. Configurar variables `VITE_FIREBASE_*` en Vercel.
5. Ejecutar import de retos (script admin) si aplica.
6. Desplegar en Vercel.
7. Validar:
   - login
   - carga de reto diario
   - subida de respuesta con fotos
   - visualizacion en historial
   - racha

---

## 22. Conclusiones

El proyecto esta en una fase funcional buena y con base tecnica valida para uso real de dos usuarios.
Los flujos principales estan resueltos y la arquitectura ya separa UI, estado, servicios y utilidades.

Para pasar de "funciona bien" a "operacion robusta a largo plazo", lo prioritario seria:

1. normalizar codificacion/textos
2. añadir tests automaticos
3. mejorar observabilidad/monitorizacion de errores
4. plan de hardening de seguridad (rotacion de secretos + auditoria de reglas periodica)

---

## 23. Historial del informe

- `v1` (2026-03-05): primera version integral del estado actual del proyecto.
- `v2` (2026-03-05): refactorizacion completa — eliminacion de codigo duplicado, optimizacion de rendimiento, soporte PWA. Detalle en seccion 24.
- `v3` (2026-03-05): mejoras visuales y de UX — glassmorphism, transiciones, skeletons, heatmap, confeti, onboarding, micro-animaciones. Detalle en seccion 25.
- `v4` (2026-03-05): features premium — dark mode, temas de color, logros, notas de amor, countdown, lightbox, timeline, code splitting, compresion imagenes, error boundary. Detalle en seccion 26.
- `v5` (2026-03-05): toques finales — splash screen, login rediseñado, haptic feedback, compartir reto, weekly recap, pull-to-refresh. Detalle en seccion 27.

---

## 24. Cambios v2 — Refactorizacion y optimizacion (2026-03-05)

Esta seccion detalla todos los cambios realizados en la version v2.

### 24.1 Eliminacion de codigo duplicado: funciones de racha y fecha

**Problema:** Las funciones `getFechaKey`, `isFechaKey`, `plusDays`, `getRachaActual`, `getRachaMax` y `getCompletadoKeySet` estaban duplicadas entre `firebaseService.js` y `demoData.js` (aprox. 60 lineas identicas en cada archivo).

**Solucion:** Se creo `src/utils/streak.js` con todas las funciones compartidas. Ambos servicios ahora importan de este modulo.

**Archivos afectados:**

- `src/utils/streak.js` (NUEVO)
- `src/services/firebaseService.js` (eliminadas funciones locales)
- `src/services/demoData.js` (eliminadas funciones locales)

---

### 24.2 Hook `useNombresPorUid` — resolucion de nombres

**Problema:** La logica de `loadNombres` (useEffect con async fetch de perfiles por UID) y `resolveNombre` estaban duplicadas en `ModalVerRespuestas.jsx` (50 lineas) y `HistorialPage.jsx > PostDetail` (50 lineas identicas).

**Solucion:** Se creo el custom hook `src/hooks/useNombresPorUid.js` que encapsula toda la logica. Ambos componentes ahora llaman `const { resolveNombre } = useNombresPorUid(post)`.

**Archivos afectados:**

- `src/hooks/useNombresPorUid.js` (NUEVO)
- `src/components/ModalVerRespuestas.jsx` (simplificado de 129 a 80 lineas)
- `src/pages/HistorialPage.jsx` (eliminadas 50 lineas duplicadas en PostDetail)

---

### 24.3 Constante `CATEGORIAS` unificada

**Problema:** La lista de categorias se definia en 3 sitios diferentes (HomePage, HistorialPage, AnadirRetoPage) con formatos ligeramente distintos.

**Solucion:** Se creo `src/utils/categorias.js` con:

- `CATEGORIA_CONFIG`: objeto mapa (para HomePage card badges)
- `CATEGORIAS`: array para selectores (AnadirRetoPage)
- `CATEGORIAS_HISTORIAL`: array extendido con filtros "Todos" y "Los dos" (HistorialPage)

**Archivos afectados:**

- `src/utils/categorias.js` (NUEVO)
- `src/pages/HomePage.jsx` (importa `CATEGORIA_CONFIG`)
- `src/pages/HistorialPage.jsx` (importa `CATEGORIAS_HISTORIAL`)
- `src/pages/AnadirRetoPage.jsx` (importa `CATEGORIAS`)

---

### 24.4 Layout routes en App.jsx

**Problema:** Cada ruta protegida repetia `<ProtectedRoute><AppLayout>...</AppLayout></ProtectedRoute>` — 4 veces.

**Solucion:** Se refactorizo usando React Router v6 layout routes con `<Outlet>`. `ProtectedRoute` y `AppLayout` ahora usan `<Outlet />` para renderizar las rutas hijas.

**Antes:**

```jsx
<Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
<Route path="/historial" element={<ProtectedRoute><AppLayout><HistorialPage /></AppLayout></ProtectedRoute>} />
```

**Despues:**

```jsx
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route index element={<HomePage />} />
    <Route path="historial" element={<HistorialPage />} />
  </Route>
</Route>
```

**Archivo afectado:** `src/App.jsx` (reducido y mas mantenible)

---

### 24.5 Optimizacion de rendimiento: `calcStats`

**Problema:** `getStats()` llamaba internamente a `getPosts()`, haciendo una lectura extra a Firestore. En HomePage y HistorialPage, ya se tenian los posts cargados, por lo que la lectura era redundante.

**Solucion:** Se creo `calcStats(posts)` que calcula las estadisticas a partir de un array de posts ya cargado. `getStats()` se mantiene como wrapper para retrocompatibilidad.

**Archivos afectados:**

- `src/services/firebaseService.js` (nueva funcion `calcStats`)
- `src/pages/HomePage.jsx` (usa `getPosts()` + `calcStats()` en vez de `getStats()` separado)
- `src/pages/HistorialPage.jsx` (idem)

---

### 24.6 Separacion de `demoData.js`

**Problema:** `demoData.js` tenia 393 lineas mezclando 97 retos iniciales (datos estaticos), posts de ejemplo, y la logica de DemoStore.

**Solucion:** Se extrajo la lista de retos a `src/data/retosIniciales.js`. El archivo `demoData.js` se redujo a ~210 lineas con solo la logica de DemoStore y posts de ejemplo.

**Archivos afectados:**

- `src/data/retosIniciales.js` (NUEVO — 97 retos)
- `src/services/demoData.js` (reducido de 393 a ~210 lineas)

---

### 24.7 Manejo de errores en logout

**Problema:** `handleLogout()` en PerfilPage no tenia try/catch. Si `signOut()` fallaba, la app no mostraba nada.

**Solucion:** Se envolvio en try/catch con mensaje de error al usuario.

**Archivo afectado:** `src/pages/PerfilPage.jsx`

---

### 24.8 Correccion de memory leak en HomePage

**Problema:** La funcion `loadData` en HomePage hacia `setState` sin verificar si el componente seguia montado. Solo `setStage` verificaba el flag `alive`.

**Solucion:** Se refactorizo `loadData` como `useCallback` con un parametro `alive` de tipo `{ current: boolean }`. Todos los `setState` dentro de `loadData` verifican `alive.current` antes de ejecutarse. Las dependencias del `useEffect` ahora incluyen `loadData`.

**Archivo afectado:** `src/pages/HomePage.jsx`

---

### 24.9 Soporte PWA

**Problema:** La app no tenia manifest PWA ni meta `theme-color`, impidiendo instalarse en movil y perdiendo personalizacion del navegador.

**Solucion:**

- Se creo `public/manifest.json` con nombre, colores del tema, e icono
- Se anadio `<meta name="theme-color" content="#E8614A">` y `<link rel="manifest">` a `index.html`

**Archivos afectados:**

- `public/manifest.json` (NUEVO)
- `index.html` (nuevas meta tags)

---

### 24.10 Resumen de archivos

| Tipo       | Archivo                                 | Cambio                                               |
| ---------- | --------------------------------------- | ---------------------------------------------------- |
| NUEVO      | `src/utils/streak.js`                   | Funciones de racha/fecha compartidas                 |
| NUEVO      | `src/utils/categorias.js`               | Constante CATEGORIAS unificada                       |
| NUEVO      | `src/hooks/useNombresPorUid.js`         | Hook de resolucion de nombres                        |
| NUEVO      | `src/data/retosIniciales.js`            | Datos de retos extraidos de demoData                 |
| NUEVO      | `public/manifest.json`                  | Manifest PWA                                         |
| MODIFICADO | `src/services/firebaseService.js`       | Eliminadas funciones duplicadas, anadido `calcStats` |
| MODIFICADO | `src/services/demoData.js`              | Eliminadas funciones duplicadas, extraidos retos     |
| MODIFICADO | `src/App.jsx`                           | Layout routes con Outlet                             |
| MODIFICADO | `src/pages/HomePage.jsx`                | calcStats, CATEGORIA_CONFIG import, fix memory leak  |
| MODIFICADO | `src/pages/HistorialPage.jsx`           | useNombresPorUid hook, calcStats, CATEGORIAS import  |
| MODIFICADO | `src/pages/AnadirRetoPage.jsx`          | CATEGORIAS import                                    |
| MODIFICADO | `src/pages/PerfilPage.jsx`              | try/catch en handleLogout                            |
| MODIFICADO | `src/components/ModalVerRespuestas.jsx` | useNombresPorUid hook                                |
| MODIFICADO | `index.html`                            | theme-color + manifest link                          |

---

## 25. Cambios v3 — Mejoras visuales y UX premium (2026-03-05)

Esta seccion detalla las 12 mejoras visuales, de experiencia de usuario y de wow-factor.

### 25.1 Glassmorphism en navegacion y modales

**Cambio:** Fondos solidos blancos reemplazados por fondos translucidos con efecto de cristal esmerilado.

**Implementacion:**

- Nueva clase CSS `.glass` (`bg-white/70 backdrop-blur-xl border border-white/30`)
- `BottomNav.jsx`: barra inferior ahora usa `.glass` en vez de `bg-surface`
- `ModalShell.jsx`: backdrop con `backdrop-blur-md` (incrementado de `blur-sm`)

---

### 25.2 Transiciones de pagina fluidas

**Cambio:** Al cambiar entre pestanas, el contenido ahora hace un fade + slide sutil en vez de aparecer instantaneamente.

**Implementacion:**

- `PageTransition.jsx` (NUEVO): wrapper con `motion.div` que aplica fade + 20px slide vertical
- `App.jsx`: nuevo componente `AnimatedOutlet` que envuelve `Outlet` en `AnimatePresence mode="wait"` + `PageTransition`

---

### 25.3 Skeleton loaders

**Cambio:** Pantallas vacias durante la carga reemplazadas por placeholders pulsantes que simulan la estructura del contenido.

**Componentes creados en `Skeleton.jsx`:**

- `Skeleton`: base con animacion shimmer
- `SkeletonCard`: placeholder de post card
- `SkeletonRetoCard`: placeholder de la tarjeta del reto
- `SkeletonStats`: 3 chips de estadisticas
- `SkeletonProfile`: avatar + nombre del perfil

**Uso:** `HomePage.jsx` (stage loading), `HistorialPage.jsx` (loading grid), `PerfilPage.jsx` (perfil + stats)

---

### 25.4 Header con gradiente dinamico segun hora

**Cambio:** El saludo de la home page cambia segun la hora del dia y tiene un degradado de fondo acorde.

- 00:00-06:59: "Buenas noches" + degradado indigo/purpura
- 07:00-12:59: "Buenos dias" + degradado mustard/coral
- 13:00-19:59: "Buenas tardes" + degradado coral/pink
- 20:00-23:59: "Buenas noches" + degradado indigo/purpura

**Archivo:** `src/pages/HomePage.jsx`

---

### 25.5 Confeti tematico al completar ambos

**Cambio:** Cuando ambos usuarios completan el reto del dia, se dispara una explosion de confeti con los colores del tema (coral, mustard, pink, purple).

**Implementacion:** Usa `canvas-confetti` (ya estaba en dependencies). Doble rafaga con 300ms de delay para efecto mas rico. Se detecta el cambio de `completadoTotal` para evitar repetir en recargas.

**Archivo:** `src/pages/HomePage.jsx`

---

### 25.6 Calendario de actividad (heatmap)

**Cambio:** Mapa de calor estilo GitHub que muestra los ultimos 84 dias de actividad.

- Verde = completado por ambos
- Amarillo = completado parcialmente
- Gris = sin actividad

**Implementacion:** `ActivityHeatmap.jsx` (NUEVO), CSS grid puro sin librerias. Cada celda entra con animacion escalonada (`scale: 0 -> 1`).

**Uso:** `HistorialPage.jsx` y `PerfilPage.jsx`

---

### 25.7 Contadores animados de estadisticas

**Cambio:** Los numeros de racha, total de retos y record ahora "ruedan" hacia arriba con efecto odometro.

**Implementacion:** `AnimatedCounter.jsx` (NUEVO). Interpolacion por pasos con `setInterval`, maximo 20 frames, con micro-animacion de `motion.span` en cada cambio.

**Uso:** Stats en `HomePage.jsx`, `HistorialPage.jsx`, `PerfilPage.jsx`, y chip de racha

---

### 25.8 Revelacion progresiva del texto del reto

**Cambio:** Al voltear la tarjeta del reto, el texto aparece con efecto blur-to-focus (desenfoque a enfoque) que simula el enfoque de una camara.

**Implementacion:** `motion.p` con `filter: blur(12px) -> blur(0px)` y opacity animada. Las barras decorativas inferiores tambien aparecen escalonadas.

**Archivo:** `src/pages/HomePage.jsx > RetoCard`

---

### 25.9 Onboarding de primera vez

**Cambio:** La primera vez que se abre la app, se muestra una pantalla de introduccion de 3 slides con emojis animados, textos explicativos y navegacion por puntos.

**Slides:**

1. "Cada dia, un reto diferente" (bola bingo)
2. "Comparte con tu persona especial" (corazones)
3. "Manten la racha viva" (fuego)

**Implementacion:** `Onboarding.jsx` (NUEVO). Flag en `localStorage` para no repetir. Boton "Saltar" y "Siguiente" con transiciones horizontales.

**Archivo:** `src/App.jsx` (condicional en `AppContent`)

---

### 25.10 Empty states con personalidad

**Cambio:** Cuando no hay contenido (historial vacio, sin retos propios), en vez de texto plano se muestra un emoji grande animado (flotando) con texto motivacional contextual.

**Archivos:**

- `HistorialPage.jsx`: emoji diferente segun filtro activo (📭, 🌟, 🔍)
- `AnadirRetoPage.jsx`: emoji 🎰 con texto "Mete tu primer reto al bingo"

---

### 25.11 Micro-animaciones mejoradas

**Cambio:** Botones, inputs y selectores tienen feedback tactil mas pronunciado.

- Botones: `scale(0.93)` en vez de `scale(0.95)`, mas `hover:shadow-paper-lg`
- Inputs: `border-2 border-transparent` + glow coral suave en foco + cambio de fondo
- Emoji/color selectors en Perfil: `motion.button` con `whileTap={{ scale: 0.85 }}`
- Filter chips con hover shadow

**Archivos:** `index.css`, `HomePage.jsx`, `AnadirRetoPage.jsx`, `PerfilPage.jsx`

---

### 25.12 Resumen de archivos v3

| Tipo       | Archivo                                 | Cambio                                               |
| ---------- | --------------------------------------- | ---------------------------------------------------- |
| NUEVO      | `src/components/ui/Skeleton.jsx`        | 5 componentes skeleton loader                        |
| NUEVO      | `src/components/ui/AnimatedCounter.jsx` | Contador con efecto odometro                         |
| NUEVO      | `src/components/ui/PageTransition.jsx`  | Wrapper de transicion de pagina                      |
| NUEVO      | `src/components/ui/ActivityHeatmap.jsx` | Heatmap de actividad tipo GitHub                     |
| NUEVO      | `src/components/Onboarding.jsx`         | Pantalla intro de 3 slides                           |
| MODIFICADO | `src/index.css`                         | `.glass`, shimmer, micro-animaciones, scrollbar-hide |
| MODIFICADO | `src/App.jsx`                           | AnimatedOutlet, Onboarding condicional               |
| MODIFICADO | `src/components/BottomNav.jsx`          | Glassmorphism en barra inferior                      |
| MODIFICADO | `src/components/ui/ModalShell.jsx`      | backdrop-blur-md                                     |
| MODIFICADO | `src/pages/HomePage.jsx`                | Gradiente, skeletons, confeti, blur reveal, counters |
| MODIFICADO | `src/pages/HistorialPage.jsx`           | Heatmap, skeletons, counters, empty states           |
| MODIFICADO | `src/pages/AnadirRetoPage.jsx`          | Empty state animado, micro-animaciones               |
| MODIFICADO | `src/pages/PerfilPage.jsx`              | Heatmap, skeletons, counters, micro-animaciones      |

---

## 26. Cambios v4 — Features premium, dark mode y robustez (2026-03-05)

Esta seccion detalla las 20 mejoras de la v4: dark mode, temas, nuevos features, animaciones avanzadas, y robustez tecnica.

### 26.1 Modo oscuro con toggle

**Cambio:** Switch animado en la pagina de Perfil que alterna entre tema claro y oscuro. Fondo `#0F0F14`, cards `#1E1E2A`, texto `#F0F0F0`.

**Implementacion:**

- `ThemeContext.jsx` (NUEVO): contexto React que gestiona dark/light state
- `index.css`: todas las clases migradas a CSS custom properties que responden a `.dark`
- `tailwind.config.js`: `darkMode: 'class'`
- `PerfilPage.jsx`: toggle animado con spring physics

---

### 26.2 Temas de color de pareja

**Cambio:** 5 temas seleccionables: Coral 🌺, Ocean 🌊, Forest 🌿, Sunset 🌅, Sakura 🌸. Cada uno cambia los colores de acento a traves de CSS custom properties.

**Implementacion:** `ThemeContext.jsx` almacena el tema en `localStorage` y aplica `--color-accent`, `--color-accent-dark`, `--color-secondary` al root.

---

### 26.3 Galeria lightbox a pantalla completa

**Cambio:** Al pulsar una foto en el historial, se abre un visor fullscreen con fondo blur, navegacion con flechas (+ teclado), y contador de fotos.

**Archivo:** `src/components/ui/Lightbox.jsx` (NUEVO). Integrado en `HistorialPage > PostDetail`.

---

### 26.4 Particulas flotantes decorativas

**Cambio:** Circulos sutiles (opacity 4%) en color del tema que flotan lentamente por el fondo. Respetan `prefers-reduced-motion`.

**Archivo:** `src/components/ui/FloatingParticles.jsx` (NUEVO). Integrado en `App.jsx > AppLayout`.

---

### 26.5 Listas escalonadas (staggered animations)

**Cambio:** Los posts del historial, las stats, y los logros aparecen en cascada (uno tras otro, 60ms de delay) en vez de todos a la vez.

**Implementacion:** `stagger` + `fadeUp` variants de Framer Motion en `HistorialPage`, `PerfilPage`.

---

### 26.6 Vista timeline en historial

**Cambio:** Boton toggle en historial para cambiar entre vista grid (actual) y vista timeline vertical: una linea continua con puntos (verde = completo, gris = parcial) y texto resumido.

**Archivo:** `HistorialPage.jsx` — nuevo componente `TimelineItem` + toggle `Grid3X3`/`List`.

---

### 26.7 Sistema de logros / badges

**Cambio:** 9 logros desbloqueables que aparecen en Perfil:

- 🎯 Primeros pasos (1 reto)
- 🔥 Semana de fuego (racha 7)
- 💪 Imparables (racha 14)
- 👑 Mes perfecto (racha 30)
- ⭐ Diez de diez (10 retos)
- 🏆 Medio centenar (50 retos)
- 💎 Centenario (100 retos)
- 📸 Fotografos (10 fotos)
- 🖼️ Galeria (50 fotos)

Desbloqueados aparecen con animacion `scale`, bloqueados en gris con 🔒.

**Archivos:** `src/utils/achievements.js` (NUEVO), `PerfilPage.jsx`.

---

### 26.8 Notas de amor / mensajes rapidos

**Cambio:** Sistema de mensajes cortos entre la pareja:

- `LoveNoteComposer`: campo de texto en la home para enviar una nota (max 200 chars)
- `LoveNoteBanner`: banner destacado en la home cuando hay una nota sin leer del otro

**Archivo:** `src/components/LoveNotes.jsx` (NUEVO). Almacenamiento en `localStorage`.

---

### 26.9 Cuenta atras para fechas especiales

**Cambio:** Widget en Perfil donde puedes agregar fechas (aniversario, cumpleanos, vacaciones) y ver los dias que faltan. Ordenado por mas cercano. Las pasadas se muestran como completadas.

**Archivo:** `src/components/CountdownWidget.jsx` (NUEVO). Datos en `localStorage`.

---

### 26.10 Error Boundary global

**Cambio:** Si algo falla en React (error no capturado), en vez de pantalla blanca se muestra emoji 😵‍💫, mensaje amigable, y boton "Recargar".

**Archivo:** `src/components/ErrorBoundary.jsx` (NUEVO). Envuelve toda la app en `App.jsx`.

---

### 26.11 Compresion de imagenes antes de subir

**Cambio:** Las fotos se comprimen client-side antes de subir a Firebase Storage:

- Max 1200px de ancho/alto
- 80% calidad JPEG
- Fotos de 3-5MB → ~200KB sin perdida visible

**Archivo:** `src/utils/compressImage.js` (NUEVO). Integrado en `ModalRespuesta.jsx`.

---

### 26.12 Code splitting con lazy imports

**Cambio:** Las 5 paginas se cargan bajo demanda con `React.lazy()`. Bundle principal reducido de 977KB → 872KB. Cada pagina se descarga solo cuando el usuario navega a ella.

**Chunks generados:**

- `LoginPage` → 2.78 KB
- `HomePage` → 30.39 KB
- `HistorialPage` → 11.57 KB
- `AnadirRetoPage` → 5.71 KB
- `PerfilPage` → 15.19 KB

**Archivo:** `src/App.jsx` + `src/components/ui/PageLoader.jsx` (NUEVO, spinner de Suspense).

---

### 26.13 CSS migrado a custom properties

**Cambio:** Todos los colores de clases CSS (`.btn-primary`, `.btn-secondary`, `.card`, `.input-field`, `.glass`) ahora usan CSS custom properties en vez de colores Tailwind hardcodeados. Esto permite que dark mode y temas funcionen sin duplicar clases.

**Archivo:** `src/index.css` (reescrito).

---

### 26.14 Resumen de archivos v4

| Tipo       | Archivo                                   | Cambio                                                          |
| ---------- | ----------------------------------------- | --------------------------------------------------------------- |
| NUEVO      | `src/contexts/ThemeContext.jsx`           | Dark mode + 5 temas de color                                    |
| NUEVO      | `src/components/ErrorBoundary.jsx`        | Pantalla de error amigable                                      |
| NUEVO      | `src/components/LoveNotes.jsx`            | Notas de amor (banner + compositor)                             |
| NUEVO      | `src/components/CountdownWidget.jsx`      | Cuenta atras fechas especiales                                  |
| NUEVO      | `src/components/ui/Lightbox.jsx`          | Visor de fotos fullscreen                                       |
| NUEVO      | `src/components/ui/FloatingParticles.jsx` | Particulas decorativas                                          |
| NUEVO      | `src/components/ui/PageLoader.jsx`        | Spinner para Suspense                                           |
| NUEVO      | `src/utils/compressImage.js`              | Compresion de imagenes client-side                              |
| NUEVO      | `src/utils/achievements.js`               | Sistema de 9 logros                                             |
| MODIFICADO | `src/index.css`                           | Dark mode, CSS custom properties, placeholder fix               |
| MODIFICADO | `tailwind.config.js`                      | darkMode: class, colores CSS variable                           |
| MODIFICADO | `src/App.jsx`                             | ErrorBoundary, ThemeProvider, code splitting, FloatingParticles |
| MODIFICADO | `src/pages/HomePage.jsx`                  | LoveNotes integrado                                             |
| MODIFICADO | `src/pages/HistorialPage.jsx`             | Lightbox, timeline view, staggered lists                        |
| MODIFICADO | `src/pages/PerfilPage.jsx`                | Dark toggle, temas, logros, countdown                           |
| MODIFICADO | `src/components/ModalRespuesta.jsx`       | Compresion de imagenes                                          |

---

## 27. Cambios v5 — Toques finales (2026-03-05)

Dernier polish: 6 features enfocadas en la primera impresion, la sensacion tactil, y funcionalidades sociales.

### 27.1 Login page rediseñado

**Cambio:** Rediseño completo de la pagina de login:

- Emojis flotantes animados en el fondo (🎲📸💛🔥✨🎯)
- Circulos de gradiente decorativos con color del tema
- Logo RD con animacion spring (escala 0 + rotacion)
- Entradas escalonadas (logo → titulo → card → footer)
- Haptic feedback en login exitoso/fallido
- Icono `LogIn` de Lucide en boton, `Loader` animado al cargar
- Footer "Hecho con 💛 para nosotros"

**Archivo:** `src/pages/LoginPage.jsx` (reescrito)

---

### 27.2 Splash screen animado

**Cambio:** Al abrir la app por primera vez en la sesion, se muestra una pantalla con:

- Fondo gradiente en color del tema
- Logo RD con animacion spring (escala 0, rotacion -180°)
- Texto "Retos Diarios" + "Para ti y para mi" con fade escalonado
- Puntos de carga pulsantes
- Auto-cierre tras 2.5s

Se muestra una vez por sesion (controlado por `sessionStorage`).

**Archivos:** `src/components/SplashScreen.jsx` (NUEVO), `src/App.jsx`

---

### 27.3 Haptic feedback

**Cambio:** Vibraciones del dispositivo movil en interacciones clave:

- `hapticLight` (10ms): pulsar botones
- `hapticMedium` (25ms): login exitoso
- `hapticSuccess` (doble pulso): completar reto
- `hapticError` (triple pulso): error de login

No hace nada en navegadores sin soporte.

**Archivos:** `src/utils/haptics.js` (NUEVO), `HomePage.jsx`, `LoginPage.jsx`

---

### 27.4 Boton compartir reto

**Cambio:** Nuevo boton "Compartir reto" en la home page. Usa Web Share API nativa (WhatsApp, Telegram, etc.) o copia al portapapeles como fallback.

Texto compartido: "🎯 Reto del dia: [texto del reto] — Retos Diarios"

**Archivo:** `src/pages/HomePage.jsx`

---

### 27.5 Weekly recap (resumen semanal)

**Cambio:** Tarjeta en la home que muestra el resumen de la semana anterior:

- Retos completados juntos
- Fotos subidas
- Racha actual
- Mensaje motivacional segun tasa de completado (👑☝️💪🌱)

Solo aparece si hubo actividad la semana pasada.

**Archivo:** `src/components/WeeklyRecap.jsx` (NUEVO)

---

### 27.6 Pull-to-refresh

**Cambio:** Gesto de arrastrar hacia abajo en la home para recargar datos. Indicador visual con emoji rotante (↓ → 🎯 → 🔄). Usa un custom hook reutilizable.

**Archivos:** `src/hooks/usePullToRefresh.js` (NUEVO), `src/pages/HomePage.jsx`

---

### 27.7 Resumen de archivos v5

| Tipo       | Archivo                           | Cambio                                 |
| ---------- | --------------------------------- | -------------------------------------- |
| NUEVO      | `src/components/SplashScreen.jsx` | Splash animado con logo                |
| NUEVO      | `src/components/WeeklyRecap.jsx`  | Tarjeta recap semanal                  |
| NUEVO      | `src/utils/haptics.js`            | Vibraciones tactiles (5 patrones)      |
| NUEVO      | `src/hooks/usePullToRefresh.js`   | Hook pull-to-refresh                   |
| MODIFICADO | `src/pages/LoginPage.jsx`         | Rediseño completo                      |
| MODIFICADO | `src/App.jsx`                     | SplashScreen condicional               |
| MODIFICADO | `src/pages/HomePage.jsx`          | Pull-to-refresh, recap, haptics, share |

---

## 28. Cambios v6 — Rediseño con UI/UX Pro Max (2026-03-05)

Esta sección detalla los cambios de interfaz implementados utilizando el sistema de diseño derivado de la _skill_ **UI/UX Pro Max**.

### 28.1 Integración de UI/UX Pro Max Skill

**Cambio:** Se ha integrado la herramienta `ui-ux-pro-max-skill` en el proyecto para proveer lineamientos de diseño dirigidos por IA a través de generación de sistemas de diseño estructurados (como `MASTER.md`).

### 28.2 Sistema de Diseño: Claymorphism

**Cambio:** Se migró el diseño visual base del proyecto al estilo **Claymorphism**. Esto se logró siguiendo el nuevo documento semántico generado en `design-system/retos-diarios/MASTER.md`. Los cambios clave son:

- **Efectos y Sombras:** Uso de bordes suaves pero gruesos (2-4px), y sombras profundas pero sutiles en los botones y tarjetas para simular objetos 3D y componentes suaves y "burbujeantes".
- **Colores (Paleta base fría/fresca):** Sustitución de los tonos crema y corales originales por una progresión que va de **Cyan** (`#0891B2` como primary) a un fondo sumamente claro (`#ECFEFF`), y usando **Verde Esmeralda** (`#059669`) para elementos interactivos como botones con acciones afirmativas (Primary CTA).
- **Tipografía:** Transición general del stack tipográfico desde `Playfair Display/DM Sans` a la recomendada universal: **Inter**. Incrementando su legibilidad conservando una apariencia juguetona y precisa para aplicaciones móviles.

**Archivos afectados:**

- `tailwind.config.js` (Modificados tokens de temas)
- `index.html` (Nuevas fuentes)
- `src/index.css` (Variables CSS base reestructuradas bajo la guía Claymorphism)
- `src/App.jsx` y `src/pages/HomePage.jsx` (Redirección a las nuevas variables de color y esquemas de layout/border).
