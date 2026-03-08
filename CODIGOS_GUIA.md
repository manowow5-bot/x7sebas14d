# Guía: Códigos de Canje (Redemption Codes)

## ✅ Funcionalidad Completada

Se ha añadido el sistema completo de canjes de códigos con:
- 🔑 Panel de administración para crear códigos
- 💰 Sistema de saldo disponible para usuarios
- 🎫 Funcionalidad para canjear códigos

### Características:

#### 1. Administradores: Crear Códigos
- Solo 3 correos autorizados pueden crear códigos:
  - admin@x7sebaspanel.com
  - sebastianarsia@gmail.com  
  - manowow5@gmail.com

**Flujo:**
1. Admin entra al sitio y se autentica
2. Hace clic en botón **"Códigos"** (solo visible para admins)
3. Se abre modal de "Crear Códigos de Canje"
4. Ingresa:
   - **Monto por código**: $1 a $10,000 (ej: $50)
   - **Cantidad de códigos**: 1 a 100 (ej: 10)
5. Haz clic en "Generar Códigos"
6. Se generan códigos aleatorios y se guardan en Firestore
7. Los códigos aparecen en la lista para copiar

**Códigos generados:**
- Formato: 8 caracteres aleatorios (A-Z, 0-9)
- Ejemplo: **ABC12XYZ**
- Se guardan en colección Firestore: `walletCodes`
- Cada código tiene: {code, monto, createdBy, createdAt, status}

---

#### 2. Usuarios: Ver Saldo y Canjear Códigos
- ✓ Todos los usuarios autenticados ven su saldo en el header
- ✓ Botón "Canjear" visible para todos los usuarios

**Flujo:**
1. Usuario inicia sesión
2. Ve su saldo en el header: **💰 $0.00**
3. Hace clic en botón **"Canjear"**
4. Se abre modal con:
   - Saldo disponible (grande y visible)
   - Campo para ingresar código
   - Botón "Canjear Código"
   - Historial de últimos canjes
5. Ingresa código de 8 caracteres (ej: ABC12XYZ)
6. Haz clic en "Canjear Código"
7. ✅ Código validado y monto agregado al saldo
8. Saldo se actualiza automáticamente en header
9. Código aparece en historial

---

## 🔧 Antes de Usar

### 1. ⚠️ IMPORTANTE: Actualizar Security Rules de Firestore

Debes actualizar las reglas de Firestore para permitir:
- Admins escribir en `walletCodes`
- Usuarios leer/escribir su propia `userWallets`
- Usuarios escribir en `redemptionHistory`

**Ver archivo**: `FIRESTORE_SECURITY_RULES.md`

Pasos rápidos:
1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona proyecto **x7sebaspanel**
3. Ve a **Firestore Database → Rules**
4. Reemplaza con las reglas del archivo
5. Haz clic en **Publish**

### 2. Verificar Colecciones en Firestore

Después de aplicar las reglas, estas colecciones se crearán automáticamente:
- ✓ `productKeys` (ya existe)
- ✓ `purchases` (ya existe)
- ✓ `walletCodes` (al generar primer código)
- ✓ `userWallets` (al primer canaje)
- ✓ `redemptionHistory` (al primer canje)

---

## 🚀 Prueba Rápida (Paso a Paso)

### Paso 1: Admin genera 3 códigos de $25 cada uno
```
1. Login como admin@x7sebaspanel.com
2. Botón "Códigos" en header
3. Modal se abre:
   - Monto: 25
   - Cantidad: 3
4. Botón "Generar Códigos"
5. Se genera: "✅ 3 códigos generados de $25 cada uno"
6. Codes aparecen: ABC12XYZ, DEF45UVW, GHI78RST
```

### Paso 2: Usuario canjea código
```
1. Login como usuario@email.com
2. Ves: "💰 $0.00" en header
3. Botón "Canjear" en header
4. Modal se abre:
   - Saldo: $0.00
   - Ingresa: ABC12XYZ
5. Botón "Canjear Código"
6. ✅ "¡Código canjeado! +$25.00 agregado. Nuevo saldo: $25.00"
7. Saldo se actualiza: "💰 $25.00" en header
8. En historial aparece: "ABC12XYZ +$25.00"
```

### Paso 3: Usuario intenta canjear mismo código otra vez
```
1. Botón "Canjear"
2. Ingresa: ABC12XYZ (nuevo)
3. ❌ "Este código ya fue canjeado"
```

---

## 📊 Estructura en Firestore

### Colección: `userWallets`
```
{
  "uid_del_usuario": {           // ID = UID del usuario
    "email": "user@email.com",
    "balance": 25.00,             // Saldo actual
    "redeems": 1,                 // Cantidad de canjes
    "createdAt": Timestamp,
    "lastRedeemedAt": Timestamp
  }
}
```

### Colección: `walletCodes`
```
{
  "ABC12XYZ": {                   // ID = código
    "monto": 25,
    "createdAt": Timestamp,
    "createdBy": "admin@...",
    "status": "active",           // o "redeemed"
    "redeemedBy": "user@...",    // Si fue canjeado
    "redeemedAt": Timestamp       // Si fue canjeado
  }
}
```

### Colección: `redemptionHistory`
```
{
  "doc_random": {
    "userEmail": "user@email.com",
    "userId": "uid_usuario",
    "code": "ABC12XYZ",
    "monto": 25,
    "redeemedAt": Timestamp,
    "newBalance": 25.00
  }
}
```

---

## 🔐 Seguridad

- ✓ Solo admins pueden crear códigos
- ✓ Solo admins pueden escribir en `walletCodes`
- ✓ Cada usuario solo ve su saldo
- ✓ Cada usuario solo ve su historial
- ✓ Validaciones en cliente: código 8 caracteres
- ✓ Códigos no pueden canjearse dos veces
- ✓ Monto se suma al saldo automáticamente

---

## 📝 Notas

- Los códigos se generan con 8 caracteres aleatorios
- Se guardan en tiempo real en Firestore
- El saldo se sincroniza automáticamente entre dispositivos (con offlineSync)
- El historial muestra los últimos 10 canjes
- Los códigos son únicos a nivel de documento en Firestore
- Validación de código: must be exactly 8 characters

---

## 🐛 Troubleshooting

### No aparece botón "Canjear"
- ✓ Verifica estar logueado (debe estar autenticado)
- ✓ Si eres admin, el botón aparece igual

### No aparece botón "Códigos" (Admin)
- ✓ Verifica estar logueado
- ✓ Tu correo debe estar en la lista de admins (3 correos específicos)
- ✓ Revisa la consola del navegador (F12) para errores

### Error al canjear código
- ✓ Verifica que el código tenga exactamente 8 caracteres
- ✓ Verifica Firebase esté en línea (consola: "EN LÍNEA")
- ✓ EL código no ha sido canjeado antes
- ✓ Revisa las Security Rules estén correctas

### El saldo no se actualiza
- ✓ Recarga la página
- ✓ Verifica que canjeaste correctamente
- ✓ Revisa en Firebase Console > Firestore la colección `userWallets`

### El código no aparece en historial
- ✓ Espera 2-3 segundos para que sincronice
- ✓ Abre nuevamente la modal de "Canjear"
- ✓ Revisa en Firebase Console > Firestore la colección `redemptionHistory`

---

## 🎯 Próximos Pasos (Opcional)

Se puede agregar después:
- [ ] Función de "Usar saldo" para comprar directamente con balance
- [ ] Exportar historial de códigos canjeados
- [ ] Anular/revocar códigos generados
- [ ] Ver lista de códigos sin canjear (para admin)
- [ ] Webhook o notificaciones cuando se canjea un código
- [ ] Limitar cantidad de canjes por usuario
- [ ] Códigos con fecha de expiración
- [ ] Transferencia de saldo entre usuarios
