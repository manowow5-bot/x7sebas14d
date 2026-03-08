// Admin emails
const ADMIN_EMAILS = [
  "admin@x7sebaspanel.com",
  "sebastianarsia@gmail.com",
  "manowow5@gmail.com"
];

// Productos
const PLANS = [
  { id: "1-dia", name: "1 Dia", price: 0.5, duration: "1 Dia" },
  { id: "7-dias", name: "7 Dias", price: 8, duration: "7 Dias" },
  { id: "15-dias", name: "15 Dias", price: 14, duration: "15 Dias" },
  { id: "30-dias", name: "30 Dias", price: 20, duration: "30 Dias", featured: true },
  { id: "permanente", name: "Permanente", price: 35, duration: "Permanente", premium: true }
];

// Variables globales
let currentUser = null;
let isAdmin = false;
let keysCache = {};

// Función para esperar a que Firebase esté listo
async function waitForFirebase(timeout = 3000) {
  if (firebaseReady) return;
  
  const startTime = Date.now();
  while (!firebaseReady) {
    if (Date.now() - startTime > timeout) {
      console.warn("⚠️ Timeout esperando Firebase");
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

// ========== AUTENTICACIÓN ==========

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminBtn = document.getElementById("adminBtn");
const canjesBtn = document.getElementById("canjesBtn");
const canjearBtn = document.getElementById("canjearBtn");
const tutorialBtn = document.getElementById("tutorialBtn");
const keysBtn = document.getElementById("keysBtn");
const userEmail = document.getElementById("userEmail");
const userBalance = document.getElementById("userBalance");
const purchasedKeysList = document.getElementById("purchasedKeysList");

const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const adminModal = document.getElementById("adminModal");
const canjesModal = document.getElementById("canjesModal");
const canjearModal = document.getElementById("canjearModal");
const keysModal = document.getElementById("keysModal");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const adminForm = document.getElementById("adminForm");
const canjesForm = document.getElementById("canjesForm");
const canjearForm = document.getElementById("canjearForm");

// Modal close buttons
document.querySelectorAll(".modal-close").forEach(btn => {
  btn.addEventListener("click", function() {
    this.closest(".modal").classList.add("hidden");
  });
});

// Switch between login and register
document.getElementById("goToRegister").addEventListener("click", (e) => {
  e.preventDefault();
  loginModal.classList.add("hidden");
  registerModal.classList.remove("hidden");
});

document.getElementById("goToLogin").addEventListener("click", (e) => {
  e.preventDefault();
  registerModal.classList.add("hidden");
  loginModal.classList.remove("hidden");
});

// Login button
loginBtn.addEventListener("click", () => {
  loginModal.classList.remove("hidden");
});

// Logout button
logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut();
});

// Admin button
adminBtn.addEventListener("click", () => {
  adminModal.classList.remove("hidden");
});

// Tutoriales button
tutorialBtn.addEventListener("click", () => {
  window.open("https://docs.google.com/document/d/1MOv6i3FMKoZhbHTseCXnpIXOlSwz1-6x-K085ijZQrc/edit?usp=sharing", "_blank", "noopener,noreferrer");
});

// Mis keys button
keysBtn.addEventListener("click", async () => {
  keysModal.classList.remove("hidden");
  await loadPurchasedKeys();
});

// Códigos button
canjesBtn.addEventListener("click", () => {
  canjesModal.classList.remove("hidden");
  loadCanjesCodes();
});

// Canjear button
canjearBtn.addEventListener("click", () => {
  canjearModal.classList.remove("hidden");
  loadUserBalance();
  loadRedeemedCodesHistory();
});

// Login form
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    loginModal.classList.add("hidden");
    loginForm.reset();
    showMessage("loginMessage", "✅ Login exitoso", "success");
  } catch (error) {
    let errorMsg = error.message;
    
    if (error.code === "auth/user-not-found") {
      errorMsg = "❌ Este email no está registrado. ¿Quieres registrarte?";
    } else if (error.code === "auth/wrong-password") {
      errorMsg = "❌ Contraseña incorrecta";
    } else if (error.code === "auth/invalid-email") {
      errorMsg = "❌ Email inválido";
    } else if (error.code === "auth/too-many-requests") {
      errorMsg = "❌ Demasiados intentos. Intenta más tarde";
    } else if (error.code === "auth/unauthorized-domain") {
      errorMsg = "❌ Dominio no autorizado en Firebase. Agrega este dominio en Authentication > Settings > Authorized domains";
    }
    
    showMessage("loginMessage", errorMsg, "error");
  }
});

// Register form
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirm = document.getElementById("registerConfirm").value;
  
  if (password !== confirm) {
    showMessage("registerMessage", "❌ Las contraseñas no coinciden", "error");
    return;
  }
  
  if (password.length < 6) {
    showMessage("registerMessage", "❌ La contraseña debe tener al menos 6 caracteres", "error");
    return;
  }
  
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    registerModal.classList.add("hidden");
    registerForm.reset();
    showMessage("registerMessage", "✅ Registro exitoso. ¡Bienvenido!", "success");
    setTimeout(() => {
      loginModal.classList.remove("hidden");
    }, 1500);
  } catch (error) {
    let errorMsg = error.message;
    
    // Mensajes más claros para errores comunes
    if (error.code === "auth/email-already-in-use") {
      errorMsg = "❌ Este email ya está registrado. ¿Quieres iniciar sesión?";
    } else if (error.code === "auth/invalid-email") {
      errorMsg = "❌ Email inválido";
    } else if (error.code === "auth/weak-password") {
      errorMsg = "❌ La contraseña es muy débil";
    } else if (error.code === "auth/operation-not-allowed") {
      errorMsg = "❌ Registro no habilitado en este momento";
    } else if (error.code === "auth/unauthorized-domain") {
      errorMsg = "❌ Dominio no autorizado en Firebase. Agrega este dominio en Authentication > Settings > Authorized domains";
    }
    
    showMessage("registerMessage", errorMsg, "error");
  }
});

// Admin form
adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!isAdmin) {
    showMessage("adminMessage", "❌ No tienes permisos de admin", "error");
    return;
  }
  
  const plan = document.getElementById("adminPlan").value;
  const keysText = document.getElementById("adminKeys").value;
  
  if (!plan) {
    showMessage("adminMessage", "❌ Selecciona un plan", "error");
    return;
  }
  
  if (!keysText.trim()) {
    showMessage("adminMessage", "❌ Agrega al menos una key", "error");
    return;
  }
  
  const newKeys = keysText.split("\n").filter(k => k.trim());
  
  try {
    showMessage("adminMessage", "⏳ Guardando en la nube...", "info");
    
    await waitForFirebase();
    
    if (!db) {
      throw new Error("Firebase no disponible");
    }
    
    // Obtener keys existentes de Firestore
    const docRef = db.collection("productKeys").doc(plan);
    const docSnap = await docRef.get();
    
    const existingKeys = docSnap.exists ? (docSnap.data().keys || []) : [];
    const allKeys = [...existingKeys, ...newKeys];
    
    // Guardar en Firestore (se sincronizará automáticamente a todos)
    await docRef.set({ 
      keys: allKeys, 
      updatedAt: new Date(),
      addedBy: currentUser.email
    });
    
    keysCache[plan] = allKeys.length;
    renderProducts();
    updateStockInfo();
    
    showMessage("adminMessage", `✅ ${newKeys.length} keys agregadas. Total: ${allKeys.length} ✔️ ONLINE`, "success");
    adminForm.reset();
  } catch (error) {
    console.error("Error:", error);
    showMessage("adminMessage", "❌ Error: " + (error.message || "desconocido"), "error");
  }
});

// Monitor auth state
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    isAdmin = ADMIN_EMAILS.includes(user.email);
    
    userEmail.textContent = user.email;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
    adminBtn.style.display = isAdmin ? "block" : "none";
    canjesBtn.style.display = isAdmin ? "block" : "none";
    canjearBtn.style.display = "block";
    keysBtn.style.display = "block";
    userBalance.style.display = "block";
    
    // Cargar saldo inicial
    await loadUserBalance();
    await loadPurchasedKeys();
    
    console.log("✅ Usuario autenticado:", user.email);
  } else {
    currentUser = null;
    isAdmin = false;
    
    userEmail.textContent = "";
    loginBtn.style.display = "block";
    logoutBtn.style.display = "none";
    adminBtn.style.display = "none";
    canjesBtn.style.display = "none";
    canjearBtn.style.display = "none";
    keysBtn.style.display = "none";
    userBalance.style.display = "none";
    keysModal.classList.add("hidden");
    if (purchasedKeysList) {
      purchasedKeysList.innerHTML = "";
    }
    
    console.log("❌ Usuario cerró sesión");
  }
  
  renderProducts();
});

// ========== PRODUCTOS Y KEYS ==========

// Escuchar cambios en tiempo real desde Firestore
setTimeout(() => {
  if (!db) {
    console.error("❌ Firestore no disponible");
    renderProducts();
    updateStockInfo();
    return;
  }
  
  // Listener en tiempo real - TODOS los usuarios ven cambios automáticamente
  db.collection("productKeys").onSnapshot(
    (snapshot) => {
      keysCache = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        keysCache[doc.id] = (data.keys || []).length;
        console.log(`📦 ${doc.id}: ${keysCache[doc.id]} keys disponibles`);
      });
      
      console.log("🔄 ✅ SINCRONIZADO - Status: ONLINE");
      renderProducts();
      updateStockInfo();
    },
    (error) => {
      console.error("❌ Error sincronizando:", error.code, error.message);
      renderProducts();
      updateStockInfo();
    }
  );
}, 500);

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  
  grid.innerHTML = PLANS.map(plan => {
    const stock = keysCache[plan.id] || 0;
    let badgeHtml = "";
    
    if (plan.featured) badgeHtml = '<div class="badge">Más Popular</div>';
    if (plan.premium) badgeHtml = '<div class="badge premium-badge">Premium</div>';
    
    let cardClass = "product-card";
    if (plan.featured) cardClass += " featured";
    if (plan.premium) cardClass += " premium";
    
    const buyBtnDisabled = stock === 0 || !currentUser;
    
    return `
      <div class="${cardClass}">
        ${badgeHtml}
        <div class="card-header">
          <h2>x7 Sebas Panel</h2>
          <span class="duration">${plan.duration}</span>
        </div>
        <div class="card-body">
          <div class="price">$${plan.price} USD</div>
          <div class="stock-badge" style="color: ${stock > 0 ? '#10b981' : '#ef4444'}">
            ${stock > 0 ? `✓ ${stock} disponibles` : '✗ Sin stock'}
          </div>
          <ul class="features">
            <li>✓ Acceso completo</li>
            <li>✓ Soporte 24/7</li>
            <li>✓ Actualizaciones incluidas</li>
            <li>✓ Múltiples dispositivos</li>
          </ul>
        </div>
        <div class="card-footer">
          <button class="btn-buy" data-plan="${plan.id}" ${buyBtnDisabled ? 'disabled' : ''}>
            ${!currentUser ? 'Inicia sesión' : stock === 0 ? 'Sin stock' : 'Comprar Ahora'}
          </button>
        </div>
      </div>
    `;
  }).join("");
  
  // Agregar listeners a botones de compra
  document.querySelectorAll(".btn-buy").forEach(btn => {
    btn.addEventListener("click", async () => {
      const plan = btn.dataset.plan;
      await buyProduct(plan);
    });
  });
}

function updateStockInfo() {
  const stockInfo = document.getElementById("stockInfo");
  let totalStock = 0;
  
  for (const plan in keysCache) {
    totalStock += keysCache[plan];
  }
  
  if (totalStock === 0) {
    stockInfo.innerHTML = '<p class="warning">⚠️ Sin stock disponible en este momento</p>';
  } else {
    stockInfo.innerHTML = `<p class="info">✅ ${totalStock} keys disponibles en total</p>`;
  }
}

async function buyProduct(planId) {
  if (!currentUser) {
    alert("Debes iniciar sesión para comprar");
    return;
  }
  
  const plan = PLANS.find(p => p.id === planId);
  if (!plan) return;
  
  try {
    await waitForFirebase();
    
    if (!db) {
      throw new Error("Firebase no disponible");
    }

    const productRef = db.collection("productKeys").doc(planId);
    const walletRef = db.collection("userWallets").doc(currentUser.uid);
    const purchaseRef = db.collection("purchases").doc();

    // Descontar saldo, retirar key y registrar compra en una sola transacción.
    const result = await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists) {
        throw new Error("❌ Sin stock disponible");
      }

      const productData = productDoc.data() || {};
      const keys = Array.isArray(productData.keys) ? productData.keys : [];

      if (keys.length === 0) {
        throw new Error("❌ Sin stock disponible");
      }

      const walletDoc = await transaction.get(walletRef);

      let currentBalance = 0;
      let createdAt = new Date();

      if (walletDoc.exists) {
        currentBalance = walletDoc.data().balance || 0;
        createdAt = walletDoc.data().createdAt || new Date();
      }

      if (currentBalance < plan.price) {
        throw new Error("❌ Saldo insuficiente");
      }

      const purchasedKey = keys[0];
      const remainingKeys = keys.slice(1);
      const newBalance = currentBalance - plan.price;
      const purchaseDate = new Date();

      transaction.update(productRef, {
        keys: remainingKeys,
        updatedAt: purchaseDate
      });

      transaction.set(walletRef, {
        email: currentUser.email,
        balance: newBalance,
        createdAt: createdAt,
        lastPurchaseAt: purchaseDate
      }, { merge: true });

      transaction.set(purchaseRef, {
        email: currentUser.email,
        userId: currentUser.uid,
        planId: plan.id,
        plan: plan.name,
        price: plan.price,
        key: purchasedKey,
        purchasedAt: purchaseDate,
        status: "completed",
        balanceBefore: currentBalance,
        balanceAfter: newBalance
      });

      return {
        purchasedKey,
        remainingStock: remainingKeys.length,
        newBalance
      };
    });

    let copiedToClipboard = true;
    try {
      await navigator.clipboard.writeText(result.purchasedKey);
    } catch (clipboardError) {
      copiedToClipboard = false;
      console.warn("No se pudo copiar la key al portapapeles:", clipboardError);
    }

    if (copiedToClipboard) {
      alert(`✅ ¡Compra exitosa!\n\nKey: ${result.purchasedKey}\n(Copiada al portapapeles)`);
    } else {
      alert(`✅ ¡Compra exitosa!\n\nKey: ${result.purchasedKey}\n(Copia esta key manualmente)`);
    }

    // Actualizar UI
    keysCache[planId] = result.remainingStock;
    updateBalanceDisplay(result.newBalance);
    await loadPurchasedKeys();
    renderProducts();
    updateStockInfo();
    
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error: " + (error.message || "desconocido"));
  }
}

async function loadPurchasedKeys() {
  if (!purchasedKeysList) return;

  if (!currentUser) {
    purchasedKeysList.innerHTML = "";
    return;
  }

  try {
    await waitForFirebase();

    if (!db) {
      purchasedKeysList.innerHTML = '<p class="info">No se pudo cargar tus keys</p>';
      return;
    }

    const snapshot = await db.collection("purchases")
      .where("email", "==", currentUser.email)
      .limit(50)
      .get();

    if (snapshot.empty) {
      purchasedKeysList.innerHTML = '<p class="info">No tienes compras todavía</p>';
      return;
    }

    const items = snapshot.docs
      .map(doc => doc.data())
      .filter(item => item.key)
      .sort((a, b) => {
        const timeA = a.purchasedAt && a.purchasedAt.toDate ? a.purchasedAt.toDate() : new Date(0);
        const timeB = b.purchasedAt && b.purchasedAt.toDate ? b.purchasedAt.toDate() : new Date(0);
        return timeB - timeA;
      })
      .slice(0, 10);

    if (items.length === 0) {
      purchasedKeysList.innerHTML = '<p class="info">No tienes compras todavía</p>';
      return;
    }

    purchasedKeysList.innerHTML = items.map((item) => {
      const dateValue = item.purchasedAt && item.purchasedAt.toDate ? item.purchasedAt.toDate() : new Date();
      const dateText = dateValue.toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });

      return `
        <div class="purchase-key-item">
          <span class="purchase-key-code">${item.key}</span>
          <span class="purchase-key-plan">${item.plan || "Plan"}</span>
          <span class="purchase-key-date">${dateText}</span>
          <button class="purchase-key-copy" data-key="${item.key}">Copiar</button>
        </div>
      `;
    }).join("");

    document.querySelectorAll(".purchase-key-copy").forEach(btn => {
      btn.addEventListener("click", async () => {
        const key = btn.dataset.key;
        if (!key) return;

        try {
          await navigator.clipboard.writeText(key);
          btn.textContent = "✓ Copiado";
          setTimeout(() => {
            btn.textContent = "Copiar";
          }, 2000);
        } catch (error) {
          console.error("No se pudo copiar la key:", error);
          alert("❌ No se pudo copiar la key");
        }
      });
    });
  } catch (error) {
    console.error("Error cargando keys compradas:", error);
    purchasedKeysList.innerHTML = '<p class="error">Error cargando tus keys</p>';
  }
}

// ========== CÓDIGOS DE CANJE ==========

function generateCanje(monto, cantidad) {
  const codes = [];
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
  for (let i = 0; i < cantidad; i++) {
    let code = "";
    for (let j = 0; j < 8; j++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    codes.push({
      code: code.toUpperCase(),
      monto: monto,
      createdAt: new Date(),
      createdBy: currentUser.email,
      status: "active"
    });
  }
  
  return codes;
}

async function saveCanjesToFirestore(codes) {
  try {
    await waitForFirebase();
    
    if (!db) {
      throw new Error("Firebase no disponible");
    }
    
    const batch = db.batch();
    
    for (const codeObj of codes) {
      const docRef = db.collection("walletCodes").doc(codeObj.code);
      batch.set(docRef, {
        monto: codeObj.monto,
        createdAt: codeObj.createdAt,
        createdBy: codeObj.createdBy,
        status: codeObj.status
      });
    }
    
    await batch.commit();
    console.log(`✅ ${codes.length} códigos guardados en Firestore`);
    return true;
  } catch (error) {
    console.error("Error guardando códigos:", error);
    throw error;
  }
}

async function loadCanjesCodes() {
  try {
    await waitForFirebase();
    
    if (!db || !currentUser) {
      document.getElementById("canjesList").innerHTML = "";
      return;
    }
    
    // Cargar códigos creados por el admin actual (sin orderBy para mayor velocidad)
    const snapshot = await db.collection("walletCodes")
      .where("createdBy", "==", currentUser.email)
      .where("status", "==", "active")
      .limit(100)
      .get();
    
    const canjesList = document.getElementById("canjesList");
    
    if (snapshot.empty) {
      canjesList.innerHTML = '<p class="info">No hay códigos activos</p>';
      return;
    }
    
    // Ordenar localmente en JavaScript (mucho más rápido que orderBy)
    const codes = snapshot.docs
      .map(doc => ({ id: doc.id, data: doc.data() }))
      .sort((a, b) => {
        const timeA = a.data.createdAt ? a.data.createdAt.toDate() : 0;
        const timeB = b.data.createdAt ? b.data.createdAt.toDate() : 0;
        return timeB - timeA;
      })
      .slice(0, 50); // Mostrar solo últimos 50
    
    canjesList.innerHTML = codes.map(({ id, data }) => `
      <div class="canje-item">
        <span class="canje-code">${id}</span>
        <span class="canje-monto">$${data.monto}</span>
        <button class="canje-copy" data-code="${id}">Copiar</button>
      </div>
    `).join("");
    
    // Agregar listeners a botones de copiar
    document.querySelectorAll(".canje-copy").forEach(btn => {
      btn.addEventListener("click", async () => {
        const code = btn.dataset.code;
        await navigator.clipboard.writeText(code);
        btn.textContent = "✓ Copiado";
        setTimeout(() => {
          btn.textContent = "Copiar";
        }, 2000);
      });
    });
    
  } catch (error) {
    console.error("Error cargando códigos:", error);
    document.getElementById("canjesList").innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}

// Canjes form - Generar nuevos códigos
canjesForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!currentUser || !isAdmin) {
    showMessage("canjesMessage", "❌ Solo administradores pueden generar códigos", "error");
    return;
  }
  
  try {
    const monto = parseInt(document.getElementById("canjesMonto").value);
    const cantidad = parseInt(document.getElementById("canjesCantidad").value);
    
    if (monto <= 0 || monto > 10000) {
      throw new Error("Monto debe estar entre $1 y $10,000");
    }
    
    if (cantidad <= 0 || cantidad > 100) {
      throw new Error("Cantidad debe estar entre 1 y 100");
    }
    
    showMessage("canjesMessage", "⏳ Generando códigos...", "info");
    
    // Generar códigos
    const codes = generateCanje(monto, cantidad);
    console.log(`🔑 Generados ${codes.length} códigos de $${monto}`);
    
    // Guardar en Firestore
    await saveCanjesToFirestore(codes);
    
    showMessage("canjesMessage", `✅ ${cantidad} códigos generados de $${monto} cada uno ✔️ ONLINE`, "success");
    canjesForm.reset();
    
    // Recargar lista
    await loadCanjesCodes();
    
  } catch (error) {
    console.error("Error:", error);
    showMessage("canjesMessage", "❌ Error: " + (error.message || "desconocido"), "error");
  }
});

// ========== REDENCIÓN DE CÓDIGOS ==========

async function loadUserBalance() {
  try {
    if (!currentUser) return;
    
    await waitForFirebase();
    
    if (!db) {
      console.error("❌ Firestore no disponible");
      return;
    }
    
    // Obtener o crear documento de wallet del usuario
    const walletRef = db.collection("userWallets").doc(currentUser.uid);
    const walletDoc = await walletRef.get();
    
    if (walletDoc.exists) {
      const balance = walletDoc.data().balance || 0;
      console.log(`✅ Wallet cargado. Balance: $${balance.toFixed(2)}`);
      updateBalanceDisplay(balance);
    } else {
      // Crear wallet inicial si no existe
      console.log("📝 Creando wallet inicial para:", currentUser.email);
      await walletRef.set({
        email: currentUser.email,
        balance: 0,
        createdAt: new Date(),
        redeems: 0
      }, { merge: true });
      console.log("✅ Wallet creado exitosamente");
      updateBalanceDisplay(0);
    }
  } catch (error) {
    console.error("❌ Error cargando balance:", error.code, error.message);
    // Si falla, intentar crear wallet de nuevo
    try {
      const walletRef = db.collection("userWallets").doc(currentUser.uid);
      await walletRef.set({
        email: currentUser.email,
        balance: 0,
        createdAt: new Date(),
        redeems: 0
      }, { merge: true });
      console.log("✅ Wallet creado en segundo intento");
      updateBalanceDisplay(0);
    } catch (err) {
      console.error("❌ Error creando wallet:", err.code, err.message);
      updateBalanceDisplay(0);
    }
  }
}

function updateBalanceDisplay(balance) {
  const balanceDisplay = document.getElementById("balanceDisplay");
  const userBalanceBtn = document.getElementById("userBalance");
  
  if (balanceDisplay) {
    balanceDisplay.textContent = `$${balance.toFixed(2)}`;
  }
  
  if (userBalanceBtn) {
    userBalanceBtn.textContent = `💰 $${balance.toFixed(2)}`;
  }
  
  console.log(`💵 Saldo actualizado: $${balance.toFixed(2)}`);
}

async function redeemCode(code) {
  try {
    if (!currentUser) {
      throw new Error("Debes estar autenticado");
    }
    
    await waitForFirebase();
    
    if (!db) {
      throw new Error("Firebase no disponible");
    }
    
    console.log("🔍 Validando código:", code);
    const codeRef = db.collection("walletCodes").doc(code.toUpperCase());
    const walletRef = db.collection("userWallets").doc(currentUser.uid);
    
    // USAR TRANSACCIÓN para garantizar un solo uso
    console.log("🔒 Usando transacción para garantizar un solo uso...");
    
    const result = await db.runTransaction(async (transaction) => {
      // 1. Leer código dentro de la transacción
      const codeDoc = await transaction.get(codeRef);
      
      if (!codeDoc.exists) {
        throw new Error("Código no encontrado");
      }
      
      const codeData = codeDoc.data();
      console.log("✅ Código encontrado. Status:", codeData.status);
      
      // 2. Validar que el código está activo (UN SOLO USO)
      if (codeData.status === "redeemed") {
        throw new Error("❌ Este código ya fue canjeado por " + (codeData.redeemedBy || "otro usuario"));
      }
      
      if (codeData.status !== "active") {
        throw new Error("Código inválido o desactivado");
      }
      
      const monto = codeData.monto;
      
      // 3. Leer wallet dentro de la transacción
      const walletDoc = await transaction.get(walletRef);
      
      let currentBalance = 0;
      let redeemCount = 0;
      let createdAt = new Date();
      
      if (walletDoc.exists) {
        currentBalance = walletDoc.data().balance || 0;
        redeemCount = walletDoc.data().redeems || 0;
        createdAt = walletDoc.data().createdAt || new Date();
      }
      
      const newBalance = currentBalance + monto;
      console.log(`💰 $${currentBalance} + $${monto} = $${newBalance}`);
      
      // 4. MARCAR CÓDIGO COMO USADO (CRÍTICO - evita doble uso)
      transaction.update(codeRef, {
        status: "redeemed",
        redeemedBy: currentUser.email,
        redeemedAt: new Date()
      });
      
      // 5. Actualizar wallet del usuario
      transaction.set(walletRef, {
        email: currentUser.email,
        balance: newBalance,
        redeems: redeemCount + 1,
        lastRedeemedAt: new Date(),
        createdAt: createdAt
      }, { merge: true });
      
      // 6. Registrar en historial
      const historyRef = db.collection("redemptionHistory").doc();
      transaction.set(historyRef, {
        userEmail: currentUser.email,
        userId: currentUser.uid,
        code: code.toUpperCase(),
        monto: monto,
        redeemedAt: new Date(),
        newBalance: newBalance
      });
      
      return { monto, newBalance };
    });
    
    console.log("✅ Código canjeado correctamente (un solo uso garantizado)");
    return { success: true, ...result };
    
  } catch (error) {
    console.error("❌ Error canjeando código:", error.message);
    throw error;
  }
}

async function loadRedeemedCodesHistory() {
  try {
    if (!currentUser) {
      document.getElementById("historialCanje").innerHTML = "";
      return;
    }
    
    await waitForFirebase();
    
    if (!db) return;
    
    // Query optimizado: solo WHERE sin ORDER BY para velocidad máxima
    const snapshot = await db.collection("redemptionHistory")
      .where("userId", "==", currentUser.uid)
      .limit(50)
      .get();
    
    if (snapshot.empty) {
      document.getElementById("historialCanje").innerHTML = "";
      return;
    }
    
    // Ordenar localmente (mucho más rápido que orderBy en Firestore)
    const items = snapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => {
        const timeA = a.redeemedAt ? a.redeemedAt.toDate() : new Date(0);
        const timeB = b.redeemedAt ? b.redeemedAt.toDate() : new Date(0);
        return timeB - timeA;
      })
      .slice(0, 10); // Mostrar solo últimos 10
    
    let historialHtml = `<div class="historial-title">📋 Últimos canjes:</div>`;
    
    items.forEach(data => {
      const fecha = data.redeemedAt.toDate();
      const fechaFormato = fecha.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      historialHtml += `
        <div class="historial-item">
          <span class="historial-code">${data.code}</span>
          <span class="historial-monto">+$${data.monto.toFixed(2)}</span>
          <span class="historial-fecha">${fechaFormato}</span>
        </div>
      `;
    });
    
    document.getElementById("historialCanje").innerHTML = historialHtml;
    
  } catch (error) {
    console.error("Error cargando historial:", error);
  }
}

// Canjear form - Redención de códigos
canjearForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!currentUser) {
    showMessage("canjearMessage", "❌ Debes iniciar sesión", "error");
    return;
  }
  
  try {
    const code = document.getElementById("codigoInput").value.trim().toUpperCase();
    
    if (!code) {
      throw new Error("Ingresa un código");
    }
    
    if (code.length !== 8) {
      throw new Error("El código debe tener 8 caracteres");
    }
    
    showMessage("canjearMessage", "⏳ Validando código...", "info");
    
    const result = await redeemCode(code);
    
    showMessage("canjearMessage", `✅ ¡Código canjeado! +$${result.monto.toFixed(2)} agregado. Nuevo saldo: $${result.newBalance.toFixed(2)}`, "success");
    
    canjearForm.reset();
    
    // Actualizar balance display
    updateBalanceDisplay(result.newBalance);
    
    // Recargar historial
    await loadRedeemedCodesHistory();
    
  } catch (error) {
    console.error("Error:", error);
    showMessage("canjearMessage", "❌ " + (error.message || "Error desconocido"), "error");
  }
});

// ========== UTILIDADES ===========

function showMessage(elementId, message, type) {
  const messageEl = document.getElementById(elementId);
  if (!messageEl) return;
  
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
}

// Inicializar
console.log("✅ Aplicación lista");
