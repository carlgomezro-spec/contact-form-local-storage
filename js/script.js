// ---------------------------
// CONFIGURACIÓN FIREBASE
// ---------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDW0vYUIv7IdJ0_pycuAB76UJLYVRfKLQY",
  authDomain: "fir-web-3d27a.firebaseapp.com",
  projectId: "fir-web-3d27a",
  storageBucket: "fir-web-3d27a.firebasestorage.app",
  messagingSenderId: "577325180059",
  appId: "1:577325180059:web:f1b49a25e0c802394d523e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let editingId = null; // guarda el ID del usuario que se está editando
const FORM_KEY = "contactFormData"; // clave localStorage
const form = document.getElementById("form");
const submitBtn = document.getElementById("submit");

// ---------------------------
// CARGAR DATOS PARCIALES DEL FORMULARIO
// ---------------------------
window.addEventListener("DOMContentLoaded", () => {
  const savedData = JSON.parse(localStorage.getItem(FORM_KEY));
  if (savedData) {
    document.getElementById("name").value = savedData.name || "";
    document.getElementById("email").value = savedData.email || "";
    document.getElementById("message").value = savedData.message || "";
    document.getElementById("url").value = savedData.url || "";
  }
  readAll(); // mostrar usuarios al cargar
});

// Guardar en localStorage mientras escribe
form.addEventListener("input", () => {
  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value,
    url: document.getElementById("url").value,
  };
  localStorage.setItem(FORM_KEY, JSON.stringify(data));
});

// ---------------------------
// CREAR O ACTUALIZAR USUARIO
// ---------------------------
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const url = document.getElementById("url").value.trim();

  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,40}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!nameRegex.test(name)) {
    Swal.fire({ icon: "error", title: "Oops...", text: "El nombre solo puede contener letras y espacios (3-40 caracteres)." });
    return;
  }
  if (!emailRegex.test(email)) {
    Swal.fire({ icon: "error", title: "Oops...", text: "Introduce un email válido (ejemplo: usuario@dominio.com)." });
    return;
  }

  const user = { name, email, message, url };

  if (editingId) {
    updateUser(editingId, user);
  } else {
    createUser(user);
  }

  localStorage.removeItem(FORM_KEY);
  resetForm();
});

// ---------------------------
// FUNCIONES FIREBASE
// ---------------------------
const createUser = (user) => {
  db.collection("Usuarios").add(user)
    .then((docRef) => {
      Swal.fire({ icon: "success", title: "Usuario agregado!", timer: 1500, showConfirmButton: false });
      readAll();
    })
    .catch((err) => console.error("Error creando usuario:", err));
};

const updateUser = (id, user) => {
  db.collection("Usuarios").doc(id).update(user)
    .then(() => {
      Swal.fire({ icon: "success", title: "Usuario actualizado!", timer: 1500, showConfirmButton: false });
      editingId = null;
      submitBtn.textContent = "Enviar";
      readAll();
    })
    .catch((err) => console.error("Error actualizando usuario:", err));
};

const deleteUser = (id) => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Se eliminará este usuario de la base de datos.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      db.collection("Usuarios").doc(id).delete()
        .then(() => {
          Swal.fire({ icon: "success", title: "Usuario eliminado!", timer: 1500, showConfirmButton: false });
          readAll();
        })
        .catch(err => console.error("Error eliminando usuario:", err));
    }
  });
};

const readAll = () => {
  const usersContainer = document.getElementById("users");
  usersContainer.innerHTML = ""; // limpiar antes de imprimir

  db.collection("Usuarios").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        printUser(doc.data(), doc.id);
      });
    })
    .catch(err => console.error("Error leyendo usuarios:", err));
};

// ---------------------------
// IMPRIMIR USUARIOS EN DOM
// ---------------------------
const printUser = (data, id) => {
  const usersContainer = document.getElementById("users");

  const card = document.createElement("article");
  card.classList.add("card");

  // Imagen
  const imgDiv = document.createElement("div");
  imgDiv.classList.add("card-image");
  const img = document.createElement("img");
  img.src = data.url;
  imgDiv.appendChild(img);

  // Contenido
  const content = document.createElement("div");
  content.classList.add("card-content");
  content.innerHTML = `<p><strong>${data.name}</strong><br>${data.email}<br>${data.message}</p>`;

  // Botones
  const editBtn = document.createElement("button");
  editBtn.textContent = "Editar";
  editBtn.addEventListener("click", () => loadUserForEdit(id, data));

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Borrar";
  deleteBtn.addEventListener("click", () => deleteUser(id));

  content.appendChild(editBtn);
  content.appendChild(deleteBtn);

  card.appendChild(imgDiv);
  card.appendChild(content);
  usersContainer.appendChild(card);
};

// ---------------------------
// CARGAR DATOS PARA EDITAR
// ---------------------------
const loadUserForEdit = (id, data) => {
  document.getElementById("name").value = data.name;
  document.getElementById("email").value = data.email;
  document.getElementById("message").value = data.message;
  document.getElementById("url").value = data.url;

  editingId = id;
  submitBtn.textContent = "Guardar cambios";
};

// ---------------------------
// RESET FORMULARIO
// ---------------------------
const resetForm = () => form.reset();

// ---------------------------
// BOTÓN LIMPIAR CACHE
// ---------------------------
const clearBtn = document.getElementById("clear-cache");

clearBtn.addEventListener("click", () => {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Se borrarán todos los datos del formulario y del almacenamiento local.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, borrar todo",
    cancelButtonText: "Cancelar",
  }).then(result => {
    if (result.isConfirmed) {
      resetForm();
      localStorage.removeItem(FORM_KEY);
      Swal.fire({ icon: "success", title: "Formulario limpiado", timer: 1500, showConfirmButton: false });
    }
  });
});
