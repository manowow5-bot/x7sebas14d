# Migracion a Cloudflare Pages (manteniendo Firebase)

Este proyecto se puede alojar en Cloudflare Pages sin cambiar la logica de `Firebase Auth` y `Firestore`.

## 1. Subir el proyecto a GitHub

1. Crea un repositorio nuevo o usa el actual.
2. Sube estos archivos del sitio:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `firebase-config.js`
   - `_headers`

## 2. Crear proyecto en Cloudflare Pages

1. Entra a Cloudflare Dashboard.
2. Ve a `Workers & Pages` -> `Create` -> `Pages`.
3. Conecta tu repositorio de GitHub.
4. Configura:
   - Framework preset: `None`
   - Build command: (vacio)
   - Build output directory: `/`
5. Deploy.

## 3. Autorizar tu dominio de Cloudflare en Firebase Auth (importante)

Si no haces esto, el login/registro fallara con `auth/unauthorized-domain`.

1. Entra a Firebase Console -> Authentication -> Settings -> Authorized domains.
2. Agrega:
   - `TU-PROYECTO.pages.dev`
   - Tu dominio custom (si usas uno), por ejemplo `tienda.tudominio.com`

## 4. Firestore y reglas

- Tu app seguira usando Firestore en tiempo real desde Cloudflare.
- Revisa que las reglas de Firestore permitan solo accesos correctos para usuarios autenticados/admin.

## 5. Verificacion rapida

1. Abre el sitio en `https://TU-PROYECTO.pages.dev`.
2. Prueba registro/login.
3. Prueba lectura/escritura en productos/codigos.
4. Confirma que no salga `auth/unauthorized-domain` en consola.

## Siguiente fase (opcional)

Si quieres eliminar Firebase por completo:
- Auth: Clerk/Auth0/Supabase Auth/JWT propio.
- Firestore: D1 (SQL) o KV.
- Functions: Cloudflare Workers.
- Storage: Cloudflare R2.

Esa fase si requiere refactor de `app.js` y backend.
