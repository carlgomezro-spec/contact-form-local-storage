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

let editingId = null; // 🧩 Guarda el ID del usuario que se está editando

// ---------------------------
// CREAR USUARIO
// ---------------------------
const createUsuarios = (user) => {
  db.collection("Usuarios")
    .add(user)
    .then((docRef) => {
      console.log("Usuario agregado con ID:", docRef.id);
      readAll();
      resetForm();
    })
    .catch((error) => console.error("Error al agregar documento:", error));
};

// ---------------------------
// LEER TODOS LOS USUARIOS
// ---------------------------
const readAll = () => {
  cleanUsers();
  db.collection("Usuarios")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        printUser(
          doc.data().name,
          doc.data().email,
          doc.data().message,
          doc.data().url,
          doc.id
        );
      });
    })
    .catch(() => console.log('Error leyendo documentos'));
};

// ---------------------------
// LIMPIAR SECCIÓN DE USUARIOS
// ---------------------------
const cleanUsers = () => {
  document.getElementById('users').innerHTML = "";
};

// ---------------------------
// IMPRIMIR USUARIO EN DOM
// ---------------------------
const printUser = (name, email, message, url, docId) => {
  let card = document.createElement('article');
  card.classList.add('card');

  // Imagen
  let imageContainer = document.createElement('div');
  imageContainer.classList.add('card-image');

  let picture = document.createElement('img');
  picture.setAttribute('src', url);
  imageContainer.appendChild(picture);

  // Contenido de texto
  let content = document.createElement('div');
  content.classList.add('card-content');

  let caption = document.createElement('p');
  caption.innerHTML = `<strong>${name}</strong><br>${email}<br>${message}`;

  let id = document.createElement('p');
  id.innerHTML = `ID: ${docId}`;

  content.appendChild(caption);
  content.appendChild(id);

  // Botones
  let editBtn = document.createElement('button');
  editBtn.textContent = "Editar";
  editBtn.addEventListener("click", () => loadUserForEdit(docId, name, email, message, url));

  let deleteBtn = document.createElement('button');
  deleteBtn.textContent = "Borrar";
  deleteBtn.addEventListener("click", () => deleteUser(docId));

  content.appendChild(editBtn);
  content.appendChild(deleteBtn);

  // Armado de la tarjeta
  card.appendChild(imageContainer);
  card.appendChild(content);

  document.getElementById('users').appendChild(card);
};

// ---------------------------
// ELIMINAR USUARIO 
// ---------------------------
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
      // Borrar el usuario de Firestore
      db.collection("Usuarios")
        .doc(id)
        .delete()
        .then(() => {
          console.log("Usuario eliminado:", id);
          readAll(); // Recargar la lista
          Swal.fire({
            title: "¡Eliminado!",
            text: "El usuario ha sido eliminado correctamente.",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        })
        .catch((error) => {
          console.error("Error eliminando documento:", error);
          Swal.fire({
            title: "Error",
            text: "No se pudo eliminar el usuario.",
            icon: "error",
            confirmButtonText: "Aceptar"
          });
        });
    }
  });
};


// ---------------------------
// CARGAR DATOS PARA EDITAR
// ---------------------------
const loadUserForEdit = (id, name, email, message, url) => {
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
  document.getElementById("message").value = message;
  document.getElementById("url").value = url;

  editingId = id;

  const submitBtn = document.getElementById("submit");
  submitBtn.textContent = "Guardar cambios";
};

// ---------------------------
// ACTUALIZAR USUARIO
// ---------------------------
const updateUser = (id, updatedUser) => {
  db.collection("Usuarios")
    .doc(id)
    .update(updatedUser)
    .then(() => {
      console.log("Usuario actualizado:", id);
      Swal.fire({
        title: "¡Usuario actualizado!",
        icon: "success",
        draggable: true
      });
      editingId = null;
      document.getElementById("submit").textContent = "Enviar";
      resetForm();
      readAll();
    })
    .catch((error) => console.error("Error actualizando documento:", error));
};

// ---------------------------
// RESET FORMULARIO
// ---------------------------
const resetForm = () => {
  document.getElementById("film-form").reset();
};

// ---------------------------
// EVENTO PRINCIPAL DEL BOTÓN
// ---------------------------
document.getElementById("submit").addEventListener("click", (e) => {
  e.preventDefault(); //Evitar el comportamiento por defecto del formulario

  const name = document.getElementById("name").value;
  const url = document.getElementById("url").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

// ---------------------------
// VALIDACIONES REGEX
// ---------------------------
const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,40}$/;
//Solo permite letras (mayúsculas/minúsculas), espacios y tildes. Mínimo 3 caracteres, máximo 40. No acepta números ni símbolos.
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
//Formato clásico usuario@dominio.extensión. Permite letras, números y ciertos símbolos válidos. Evita correos con formato incorrecto (como usuario@ o @gmail).

  if (!nameRegex.test(name)) {
   Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "El nombre solo puede contener letras y espacios (3-40 caracteres).",   
    });
    return;
  }

   if (!emailRegex.test(email)) {
    Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Introduce un email válido (ejemplo: usuario@dominio.com).",   
    });
    return;
  }

  const user = { name, url, email, message };

  if (editingId) {
    // Si estamos editando, actualizar
    updateUser(editingId, user);
  } else {
    // Si no, crear nuevo
    createUsuarios(user);
  }
});

// ---------------------------
// MOSTRAR USUARIOS AL CARGAR
// ---------------------------
readAll();

// ---------------------------
// GUARDAR DATOS PARCIALES EN LOCAL STORAGE
// ---------------------------

const form = document.getElementById("film-form");

// 🔸 Clave de almacenamiento (puedes cambiarla si tienes varios formularios)
const FORM_KEY = "contactFormData";

// Cargar datos guardados (si existen)
window.addEventListener("DOMContentLoaded", () => {
  const savedData = JSON.parse(localStorage.getItem(FORM_KEY));
  if (savedData) {
    document.getElementById("name").value = savedData.name || "";
    document.getElementById("email").value = savedData.email || "";
    document.getElementById("message").value = savedData.message || "";
    document.getElementById("url").value = savedData.url || "";
  }
});

// Escuchar cambios en los inputs y guardar en localStorage
form.addEventListener("input", () => {
  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value,
    url: document.getElementById("url").value,
  };
  localStorage.setItem(FORM_KEY, JSON.stringify(data));
});

// Limpiar localStorage al enviar correctamente
document.getElementById("submit").addEventListener("click", (e) => {
  e.preventDefault();

  // Valida y guarda (tu código de validación iría aquí)
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const url = document.getElementById("url").value.trim();

  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,40}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!nameRegex.test(name)) {
   Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "El nombre solo puede contener letras y espacios (3-40 caracteres).",   
    });
    return;
  }

   if (!emailRegex.test(email)) {
    Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Introduce un email válido (ejemplo: usuario@dominio.com).",   
    });
    return;
  }

  const user = { name, url, email, message };

  if (editingId) {
    updateUser(editingId, user);
  } else {
    createUsuarios(user);
  }

  // 🧹 Limpiar localStorage y formulario tras enviar correctamente
  localStorage.removeItem(FORM_KEY);
  form.reset();
});

// ---------------------------
// BOTÓN PARA LIMPIAR FORMULARIO Y CACHE 
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
  }).then((result) => {
    if (result.isConfirmed) {
      // Limpiar campos del formulario
      document.getElementById("film-form").reset();

      // Eliminar datos guardados en localStorage
      localStorage.removeItem("contactFormData");

      Swal.fire({
        title: "¡Listo!",
        text: "Formulario y datos locales limpiados correctamente.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Aceptar",
        timer: 2000,
        timerProgressBar: true,
      });
    }
  });
});

