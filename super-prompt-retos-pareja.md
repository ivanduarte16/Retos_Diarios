# 🎯 SUPER PROMPT — "Daily Challenge" App para Pareja

## CONTEXTO Y VISIÓN GENERAL

Crea una **aplicación web completa** para una pareja que vive a distancia durante la semana. La app funciona como una "bola de bingo de retos": cada día sale un reto diferente de una lista personalizada, la pareja lo realiza, sube fotos/texto como evidencia, y se guarda en un historial tipo álbum de recuerdos. El tono es íntimo, divertido y cálido — como un diario compartido gamificado.

---

## ARQUITECTURA TÉCNICA

### Stack recomendado
- **Frontend**: React + Vite (SPA, una sola página con rutas)
- **Estilos**: Tailwind CSS + Framer Motion para animaciones
- **Backend / Base de datos**: Firebase (Firestore + Firebase Storage) — gratuito hasta cierto límite y perfecto para este caso de uso de 2 usuarios
- **Autenticación**: Firebase Auth con 2 cuentas fijas (él y ella), login con email/contraseña
- **Almacenamiento de archivos**: Firebase Storage para fotos/vídeos subidos en los posts
- **Hosting**: Firebase Hosting o Vercel (deploy gratuito)

> ⚠️ Alternativa si el usuario prefiere Google Drive: implementar Google Drive API v3 con OAuth2 para guardar los posts como archivos JSON y las imágenes en carpetas de Drive. Pero Firebase es más sencillo para este caso.

---

## ESTRUCTURA DE DATOS (Firestore)

### Colección: `retos`
```
{
  id: string,
  texto: string,                  // "Mándame un selfie haciendo una mueca rara"
  categoria: string,              // "foto", "texto", "video", "tontería"
  creadoPor: "usuario1" | "usuario2",
  fechaCreacion: timestamp,
  usado: boolean,                 // true cuando ya ha salido como reto del día
  fechaUsado: timestamp | null
}
```

### Colección: `reto_diario`
```
{
  id: string,                     // formato "YYYY-MM-DD"
  retoId: string,                 // referencia al reto
  retoTexto: string,              // copia del texto para no perderlo
  fecha: timestamp,
  completado: boolean
}
```

### Colección: `posts`
```
{
  id: string,
  retoId: string,
  retoDiarioId: string,           // fecha "YYYY-MM-DD"
  retoTexto: string,
  fecha: timestamp,
  respuestas: [
    {
      usuarioId: string,
      usuarioNombre: string,       // "él" o "ella" (configurable)
      texto: string,               // descripción opcional
      fotos: string[],             // URLs de Firebase Storage
      fechaSubida: timestamp
    }
  ],
  completadoPor: string[],        // IDs de usuarios que han respondido
  completadoTotal: boolean        // true cuando ambos han respondido
}
```

### Colección: `usuarios`
```
{
  id: string,
  nombre: string,
  emoji: string,                  // emoji personalizado para el perfil
  color: string,                  // color de acento para su perfil
  retosCreados: number,
  retosCompletados: number
}
```

---

## FUNCIONALIDADES DETALLADAS

### 1. 🎰 PANTALLA PRINCIPAL — "El Reto de Hoy"

**Comportamiento:**
- Al abrir la app, si ya existe un reto asignado para hoy (consultando `reto_diario` con ID = fecha actual), lo muestra directamente.
- Si NO existe reto para hoy (primer acceso del día), muestra una animación tipo "bola de bingo girando" y selecciona aleatoriamente un reto de la colección `retos` donde `usado: false`.
- Marca el reto como `usado: true` en la colección `retos` y crea el documento en `reto_diario`.
- Si todos los retos han sido usados, reinicia todos a `usado: false` y empieza de nuevo (como un nuevo ciclo del bingo).

**UI:**
- Card central grande con el texto del reto, animación de entrada dramática (como una carta que se da la vuelta).
- Indicador de si ya lo has completado tú / si tu pareja ya lo ha completado.
- Botón "✅ Subir mi respuesta" que abre el modal de upload.
- Botón "👀 Ver respuestas" si alguno ya ha subido algo.
- Contador de racha: "🔥 X días consecutivos completando retos juntos".

### 2. 📤 MODAL — "Subir mi respuesta al reto"

**Campos:**
- Texto opcional (descripción, comentario divertido).
- Upload de hasta 4 fotos o 1 vídeo corto (máx. 50MB).
- Preview de las imágenes antes de enviar.
- Botón "Enviar" con animación de confetti al completar.

**Lógica:**
- Sube archivos a Firebase Storage en la ruta `/posts/{fecha}/{usuarioId}/{archivo}`.
- Actualiza el documento del post en Firestore.
- Si ambos usuarios han respondido → `completadoTotal: true` → muestra celebración especial.

### 3. 📚 HISTORIAL — "Nuestro Álbum de Retos"

**Vista:**
- Grid masonry de posts completados, ordenados del más reciente al más antiguo.
- Cada tarjeta muestra: fecha, texto del reto, miniaturas de fotos de ambos, badges de "✅ Completado por los dos" o "⏳ Solo uno".
- Filtros: por mes, por categoría, por "solo los completados por los dos".
- Al hacer click en una tarjeta → vista expandida tipo "post" con todas las fotos y textos de ambos en paralelo (él a la izquierda, ella a la derecha).

**Estadísticas en cabecera:**
- Total de retos completados juntos.
- Racha actual y racha máxima.
- Quién ha creado más retos.
- Mes con más retos completados.

### 4. ➕ AÑADIR RETO — "Meter una bola al bingo"

**Formulario:**
- Campo de texto: "Escribe el reto..." (máx. 200 caracteres).
- Selector de categoría: 📸 Foto / 💬 Texto / 🎥 Vídeo / 🤪 Tontería / 💌 Romántico / 🎮 Juego.
- Preview de cómo se verá el reto en la bola del bingo.
- Botón "Meter al bingo 🎰".

**Tras enviar:**
- Animación de la bola entrando en el bombo.
- Toast: "¡Reto añadido! Saldrá cuando toque 🎯".

**Lista de mis retos creados:**
- Ver todos los retos que has creado, cuáles han salido ya y cuáles están pendientes.
- Opción de editar o borrar retos que aún no han salido.

### 5. 👤 PERFIL Y CONFIGURACIÓN

- Cambiar nombre y emoji del perfil.
- Ver estadísticas personales.
- Sección "Nuestros nombres": configurar cómo se llaman los dos en la app (ej: "Manu" y "Laura").
- Toggle de notificaciones (si se implementa con FCM).
- Botón de cerrar sesión.

---

## DISEÑO VISUAL

**Estética:** Cálida, íntima, divertida pero no infantil. Como un diario analógico digitalizado.

**Paleta de colores:**
- Fondo: Crema suave `#FDF6EC` o blanco roto `#FAFAF8`
- Acento principal: Coral/terracota `#E8614A`
- Acento secundario: Amarillo mostaza `#F0B429`
- Texto principal: Casi negro `#1A1A1A`
- Superficies: Blanco `#FFFFFF` con sombras suaves

**Tipografía:**
- Títulos: `Playfair Display` o `Cormorant Garamond` (elegante, romántico)
- Cuerpo: `DM Sans` o `Nunito` (legible, amigable)

**Elementos visuales:**
- La "bola del bingo" en la pantalla principal debe ser un elemento visual animado (CSS 3D o Framer Motion).
- Cards con bordes redondeados, sombras suaves, sensación de "papel".
- Animaciones: flip de carta, confetti al completar, bounce en botones.
- Iconos: Lucide React o Heroicons.

**Mobile-first:** La app se usará principalmente en móvil. Diseñar primero para 390px, luego adaptar a desktop.

---

## FLUJO DE USUARIO (happy path)

```
1. Abrir app → Pantalla de login
2. Login con email/contraseña
3. Pantalla principal → Animación bola de bingo → Aparece el reto del día
4. Leer el reto → "Mándame un selfie haciendo una mueca rara"
5. Hacer el reto en la vida real
6. Volver a la app → "Subir mi respuesta" → Subir foto + comentario → Enviar
7. Notificación a la pareja (opcional) → La pareja sube su respuesta
8. Cuando los dos han subido → Celebración especial, el post se marca completo
9. Al día siguiente → Nuevo reto automático
10. Consultar historial → Ver todos los retos pasados con sus fotos
```

---

## CONSIDERACIONES TÉCNICAS IMPORTANTES

1. **Sin backend propio**: Todo en Firebase para evitar costes de servidor.
2. **2 usuarios fijos**: No es una app multiusuario general, solo 2 cuentas. Las cuentas se pueden crear manualmente en Firebase Console o con un registro único.
3. **Reto diario persistente**: El reto del día debe ser el mismo para los dos independientemente de quién abra la app primero. El primer usuario que abra la app ese día "genera" el reto y lo guarda en Firestore; el segundo lo leerá de ahí.
4. **Zona horaria**: Usar la zona horaria local de España (Europe/Madrid) para calcular el "día de hoy". Usar `date-fns-tz` para esto.
5. **Caché offline**: Activar persistencia offline de Firestore para que la app funcione aunque haya mala conexión.
6. **Seguridad Firestore Rules**: Solo los 2 usuarios autenticados pueden leer/escribir. Ejemplo de regla:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid in ['UID_USUARIO_1', 'UID_USUARIO_2'];
    }
  }
}
```

---

## DATOS INICIALES — Lista de retos de ejemplo para poblar la base de datos

Incluir al menos 60 retos de ejemplo en el seed, distribuidos por categorías:

**Fotos (15):** Selfie con mueca rara, foto de lo que estás comiendo ahora mismo, foto del lugar favorito de tu casa, selfie con algo que empiece por la letra R, recrear una foto de vuestra infancia...

**Textos (15):** Cuéntame lo mejor que te ha pasado hoy, escríbeme un haiku sobre mí, lista de 5 cosas que harías conmigo este finde, describe nuestro primer recuerdo juntos en 3 frases...

**Tonterías (15):** Graba un vídeo bailando 10 segundos, mándame un meme que te recuerde a mí, dibuja en papel nuestra próxima cita y foto, canta 10 segundos de nuestra canción...

**Románticos (15):** Escríbeme algo que nunca me hayas dicho, dime cuál es tu momento favorito de este mes, mándame el último screenshot que te hice sonreír, dime cómo te imaginas nuestro finde perfecto...

---

## ENTREGABLES ESPERADOS

1. ✅ Proyecto React completo con todas las pantallas funcionando
2. ✅ Configuración de Firebase (Firestore + Storage + Auth) con instrucciones claras
3. ✅ Script de seed para poblar los retos iniciales
4. ✅ Firestore Security Rules
5. ✅ README con instrucciones de instalación y despliegue en Vercel/Firebase Hosting
6. ✅ App totalmente responsive (mobile-first)
7. ✅ Animaciones y microinteracciones implementadas

---

## RESUMEN EN UNA FRASE

> Una app web privada para dos personas donde cada día sale un reto aleatorio de una lista personalizable, ambos suben su respuesta con fotos/texto, y todo se guarda en un historial visual tipo álbum de recuerdos compartido.
