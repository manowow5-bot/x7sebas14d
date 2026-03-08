# 🔧 Debugging: Códigos No Se Canjean

## ⚠️ PASO 1: Verificar Security Rules en Firebase

Este es el 90% de la causa de problemas. Las Security Rules **DEBEN** estar aplicadas correctamente.

### Verificar si están aplicadas:
1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona proyecto **x7sebaspanel**
3. Ve a **Firestore Database**
4. Pestaña **Rules**

Debería ver reglas que incluyan `userWallets` y `redemptionHistory`. Si NO ves eso, no están aplicadas las nuevas reglas.

### Aplicar Rules Correctas:
Copia estas reglas completas:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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
    
    match /productKeys/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isAdmin();
    }
    
    match /purchases/{document=**} {
      allow read: if isAuthenticated() && (resource.data.email == request.auth.email || isAdmin());
      allow create: if isAuthenticated() && request.resource.data.email == request.auth.email;
      allow update: if isAuthenticated() && isAdmin();
    }
    
    match /walletCodes/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isAdmin();
    }
    
    match /userWallets/{userId} {
      allow read: if isAuthenticated() && isOwnDocument(userId);
      allow create: if isAuthenticated() && isOwnDocument(userId);
      allow update: if isAuthenticated() && isOwnDocument(userId);
      allow delete: if isAuthenticated() && isAdmin();
    }
    
    match /redemptionHistory/{document=**} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && isAdmin();
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Luego haz click en **Publish**.

---

## 🔍 PASO 2: Ver Errores en Consola

La consola del navegador ( **F12** ) mostrará exactamente qué está fallando.

### Abrir Consola:
1. Abre el sitio: http://localhost:5500 (o tu URL)
2. Presiona **F12** (o click derecho → Inspeccionar)
3. Anda a la pestaña **Console**

### Prueba de Redención:
1. Login como usuario normal
2. Click "Canjear"
3. Ingresa un código (ej: ABCD1234)
4. Click "Canjear Código"
5. **Mira la consola**

Debería ver líneas como:
```
🔑 Intentando canjear código: ABCD1234
🔍 Buscando código: ABCD1234
❌ Código no encontrado    ← Significa que el código no existe en Firestore
```

---

## 🐛 ERRORES COMUNES Y SOLUCIONES

### Error 1: "❌ Código no encontrado"
**Causa:** El código no existe en la colección `walletCodes`

**Solución:**
1. Asegúrate de que el admin generó primero los códigos
2. Click "Códigos" (admin) → Generar códigos test
3. Los códigos deberían aparecer en la lista
4. Copia exactamente uno de ellos
5. Login como usuario → Click "Canjear" → Pega el código

### Error 2: "permission-denied"
**Causa:** Las Security Rules no están correctas

**Solución:**
1. Abre Firefox DevTools y busca "permission-denied" en Console
2. Esto significa que la regla de Firestore está bloqueando la operación
3. Verifica que aplicaste las reglas nuevas (con `userWallets` y `redemptionHistory`)
4. Reload la página y prueba de nuevo

### Error 3: "❌ Firebase no disponible"
**Causa:** Firebase no se inicializó correctamente

**Solución:**
1. Verifica que en Consola veas: "✅ Firebase completamente listo - EN LÍNEA"
2. Si ves rojo, recarga la página
3. Verifica firebase-config.js esté correcto

### Error 4: "Error: No se encontró tu wallet"
**Causa:** El wallet del usuario no existe (antigua versión del código)

**Solución:**
1. Este error NO debería ocurrir con el código nuevo
2. Recarga la página (Ctrl+F5 para limpiar caché)
3. Vuelve a intentar

---

## 📊 PASO 3: Verificar que los Códigos Existen en Firestore

### Desde Firebase Console:
1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Proyecto **x7sebaspanel** → Firestore Database
3. Colecciones en panel izquierdo

Debería haber:
- ✓ `walletCodes`: Muestra los códigos generados (ej: ABC12XYZ, DEF45UVW)
- ✓ `userWallets`: Se crea cuando usuario canjea primer código
- ✓ `redemptionHistory`: Registra cada canje

### Para Verificar Códigos:
1. Click en colección `walletCodes`
2. Deberías ver documentos como:
   - ID: `ABC12XYZ` 
   - Campos: `monto`, `createdAt`, `createdBy`, `status: "active"`

Si NO ves documentos aquí, el admin no generó códigos.

---

## 🔄 PASO 4: Flujo Completo de DEBUG

### Admin: Genera Códigos
```
1. Login como admin@x7sebaspanel.com
2. Click "Códigos"
3. Ingresa:
   - Monto: 10
   - Cantidad: 2
4. Click "Generar Códigos"
5. Consola debería mostrar:
   🔑 Generados 2 códigos de $10
   ✅ 2 códigos guardados en Firestore
```

### Usuario: Canjea Código
```
1. Login como usuario diferente (ej: user@gmail.com)
2. Ves "💰 $0.00" en header
3. Consola debería mostrar:
   ✅ Wallet cargado. Balance: $0.00
4. Click "Canjear"
5. Modal se abre con "Saldo Disponible: $0.00"
6. Ingresa el código del admin (ej: ABCD1234)
7. Click "Canjear Código"
8. Consola debería mostrar:
   🔑 Intentando canjear código: ABCD1234
   🔍 Buscando código: ABCD1234
   ✅ Código encontrado. Status: active
   💰 Actualizando balance: $0 + $10 = $10
   ✅ Balance actualizado
   📋 Marcando código como redeemed...
   ✅ Código marcado como redeemed
   📋 Guardando en historial...
   ✅ Historial guardado
9. Deberías ver: "✅ ¡Código canjeado! +$10.00 agregado. Nuevo saldo: $10.00"
10. Header ahora muestra: "💰 $10.00"
```

---

## 💾 Datos Esperados en Firestore

### Colección: walletCodes
```json
{
  "ABCD1234": {
    "status": "active",
    "monto": 10,
    "createdAt": "2026-03-06T...",
    "createdBy": "admin@x7sebaspanel.com"
  },
  "EFGH5678": {
    "status": "redeemed",
    "monto": 10,
    "createdAt": "2026-03-06T...",
    "createdBy": "admin@x7sebaspanel.com",
    "redeemedBy": "user@gmail.com",
    "redeemedAt": "2026-03-06T..."
  }
}
```

### Colección: userWallets
```json
{
  "uid_del_usuario": {
    "email": "user@gmail.com",
    "balance": 10,
    "createdAt": "2026-03-06T...",
    "redeems": 1,
    "lastRedeemedAt": "2026-03-06T..."
  }
}
```

### Colección: redemptionHistory
```json
{
  "doc_auto_1": {
    "userEmail": "user@gmail.com",
    "userId": "uid_del_usuario",
    "code": "ABCD1234",
    "monto": 10,
    "redeemedAt": "2026-03-06T...",
    "newBalance": 10
  }
}
```

---

## 🎯 Checklist Final

- [ ] Security Rules actualizada (con userWallets y redemptionHistory)
- [ ] Rules publicada en Firebase
- [ ] Console abierta (F12) mostrando logs
- [ ] Admin generó códigos (aparecen en walletCodes)
- [ ] Usuario canjea y consola muestra todos los logs ✅
- [ ] Balance se actualiza en header
- [ ] Código aparece en historial

---

## 📞 Si Aún No Funciona

Comparte los logs de la consola (F12 → Console).  Específicamente:
1. ¿Qué error exacto ves en consola?
2. ¿Las reglas de Firebase incluyen `userWallets`?
3. ¿El admin vio "✅ códigos guardados en Firestore"?
4. ¿Aparecen documentos en colección `walletCodes`?
