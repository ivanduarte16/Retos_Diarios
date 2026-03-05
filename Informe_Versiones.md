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
|  |  |- ui/
|  |     |- InlineError.jsx
|  |     |- ModalShell.jsx
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
