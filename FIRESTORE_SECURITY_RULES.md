# Firestore Security Rules

## Current Rules for x7sebaspanel

Go to **Firebase Console → Firestore Database → Rules** and replace everything with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Define admin emails
    function isAdmin() {
      return request.auth.email in [
        'admin@x7sebaspanel.com',
        'sebastianarsia@gmail.com',
        'manowow5@gmail.com'
      ];
    }
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwnDocument(userId) {
      return request.auth.uid == userId;
    }
    
    // Reglas para productKeys
    match /productKeys/{document=**} {
      // Todos los usuarios autenticados pueden leer
      allow read: if isAuthenticated();
      
      // Solo admins pueden escribir/crear
      allow write: if isAuthenticated() && isAdmin();
    }
    
    // Reglas para purchases (historial de compras)
    match /purchases/{document=**} {
      // Cada usuario puede leer sus propias compras
      allow read: if isAuthenticated() && (resource.data.email == request.auth.email || isAdmin());
      
      // Usuarios autenticados pueden crear nuevas compras
      allow create: if isAuthenticated() && request.resource.data.email == request.auth.email;
      
      // Solo admins pueden editar
      allow update: if isAuthenticated() && isAdmin();
    }
    
    // Reglas para walletCodes (códigos de canje)
    match /walletCodes/{document=**} {
      // Todos los usuarios autenticados pueden leer
      allow read: if isAuthenticated();
      
      // Solo admins pueden crear/escribir nuevos códigos
      allow write: if isAuthenticated() && isAdmin();
    }
    
    // Reglas para userWallets (saldo de usuarios)
    match /userWallets/{userId} {
      // Cada usuario puede leer su propia wallet
      allow read: if isAuthenticated() && isOwnDocument(userId);
      
      // Cada usuario puede crear su wallet
      allow create: if isAuthenticated() && isOwnDocument(userId);
      
      // Cada usuario puede actualizar su wallet (para redeems)
      allow update: if isAuthenticated() && isOwnDocument(userId);
      
      // Solo admins pueden eliminar
      allow delete: if isAuthenticated() && isAdmin();
    }
    
    // Reglas para redemptionHistory (historial de canjes)
    match /redemptionHistory/{document=**} {
      // Cada usuario puede leer solo su historial
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      
      // El sistema (usuario) puede crear entradas en su historial
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      
      // Solo admins pueden actualizar/eliminar
      allow update, delete: if isAuthenticated() && isAdmin();
    }
    
    // Regla por defecto: denegar todo
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Pasos para aplicar las reglas:

1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto **x7sebaspanel**
3. Ve a **Firestore Database**
4. Haz clic en la pestaña **Rules**
5. Reemplaza el contenido actual con las reglas de arriba ⬆️
6. Haz clic en **Publish**

✅ Las reglas permitirán:
- ✓ Todos los usuarios autenticados leer productKeys y walletCodes
- ✓ Solo admins crear/modificar productKeys y walletCodes
- ✓ Cada usuario leer/actualizar su propia wallet
- ✓ Cada usuario ver su propio historial de canjes
- ✓ Sistema crear nuevas entradas de canjes
- ✓ Admins ver todo en la plataforma

## Colecciones Necesarias:

Las siguientes colecciones se crearán automáticamente:
- ✓ `productKeys` (ya existe)
- ✓ `purchases` (ya existe)
- ✓ `walletCodes` (se crea al generar primer código)
- ✓ `userWallets` (se crea al primer redeem de usuario)
- ✓ `redemptionHistory` (se crea al primer redeem)

## Validación:

Después de aplicar las reglas, prueba:
1. **Admin genera códigos** ✓ Debería funcionar
2. **Usuario canjea código** ✓ Debería funcionar
3. **Usuario ve su saldo** ✓ Debería funcionar
4. **Usuario ve su historial** ✓ Debería funcionar
5. **Usuario intenta ver wallet de otro** ✗ Debería fallar
6. **Usuario compra producto** ✓ Debería funcionar
