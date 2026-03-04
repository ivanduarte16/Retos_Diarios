# 🎯 Retos Diarios

> Una app web privada para dos personas donde cada día sale un reto aleatorio de una lista personalizable, ambos suben su respuesta con fotos/texto, y todo se guarda en un historial visual tipo álbum de recuerdos compartido.

## ✨ Características

- 🎰 **Bola de bingo animada** — cada día sale un reto diferente con animación
- 📸 **Subir fotos y texto** — responde al reto con fotos y comentarios
- 📚 **Álbum de recuerdos** — historial visual con filtros por categoría
- 🔥 **Racha de días** — seguimiento de días consecutivos completando retos
- ➕ **Añadir retos** — personaliza tu lista de retos
- 👤 **Perfiles personalizables** — emoji y color propios para cada uno
- 🌐 **Modo demo** — funciona sin Firebase para probar la app

## 🚀 Instalación

```bash
git clone <repo>
cd retos-diarios
npm install
```

### Configurar Firebase (opcional para producción)

1. Ve a [Firebase Console](https://console.firebase.google.com/) y crea un proyecto
2. Activa **Authentication** → Email/Password
3. Activa **Firestore Database** y **Storage**
4. Crea 2 usuarios en Authentication (él y ella)
5. Copia las credenciales a `.env.local`:

```bash
cp .env.example .env.local
# edita .env.local con tus valores de Firebase
```

6. Actualiza `firestore.rules` con los UIDs reales de los 2 usuarios

### Sin Firebase (modo demo)

La app funciona sin configuración gracias al **modo demo** con 60 retos precargados:

- Email: `el@demo.com` / contraseña: `demo123`
- Email: `ella@demo.com` / contraseña: `demo123`

## 💻 Desarrollo local

```bash
npm run dev
# → http://localhost:5173
```

## 🏗️ Build para producción

```bash
npm run build
```

## 🚢 Despliegue en Vercel

1. Sube el código a GitHub
2. Importa el repositorio en [vercel.com](https://vercel.com)
3. En Vercel → Settings → Environment Variables, añade las variables `VITE_FIREBASE_*`
4. Deploy automático en cada push

## 🚢 Despliegue en Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # public dir: dist
npm run build
firebase deploy
```

## 🔐 Seguridad Firestore

Edita `firestore.rules` sustituyendo `UID_USUARIO_1` y `UID_USUARIO_2` con los UIDs reales:

```bash
firebase deploy --only firestore:rules
```

## 📁 Estructura del proyecto

```
src/
├── contexts/
│   └── AuthContext.jsx     # Auth con Firebase + modo demo
├── pages/
│   ├── LoginPage.jsx       # Pantalla de login
│   ├── HomePage.jsx        # Reto del día + bola de bingo
│   ├── HistorialPage.jsx   # Álbum de retos
│   ├── AnadirRetoPage.jsx  # Añadir nuevos retos
│   └── PerfilPage.jsx      # Perfil y configuración
├── components/
│   ├── BottomNav.jsx       # Navegación inferior
│   ├── ModalRespuesta.jsx  # Subir respuesta al reto
│   └── ModalVerRespuestas.jsx
├── services/
│   ├── firebaseService.js  # Todos los servicios Firebase
│   └── demoData.js         # Store local para modo demo
└── firebase.js             # Inicialización Firebase
```

## 🎨 Stack técnico

| Tecnología      | Uso                         |
| --------------- | --------------------------- |
| React 18 + Vite | Frontend SPA                |
| Tailwind CSS 3  | Estilos                     |
| Framer Motion   | Animaciones                 |
| Firebase 10     | Auth, Firestore, Storage    |
| React Router 6  | Navegación                  |
| canvas-confetti | Confetti al completar retos |
| Lucide React    | Iconos                      |
| date-fns-tz     | Zona horaria Europe/Madrid  |
