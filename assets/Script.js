/* ================================
   TiendaOnline — script.js
   ================================ */

/* --------------------------------------------------
   CARRITO EN localStorage
   Guardamos un array de objetos:
   [{ nombre: "Blusa blanca", precio: 299, cantidad: 1 }, ...]
   Así los datos sobreviven al cambiar de página.
-------------------------------------------------- */

/* Lee el carrito guardado. Si no hay nada, devuelve un array vacío */
function obtenerCarrito() {
  var datos = localStorage.getItem("carrito");
  if (datos) {
    return JSON.parse(datos);
  }
  return [];
}

/* Guarda el carrito en localStorage */
function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

/* Cuenta cuántos artículos hay en total (suma las cantidades) */
function contarArticulos() {
  var carrito = obtenerCarrito();
  var total = 0;
  carrito.forEach(function (item) {
    total += item.cantidad;
  });
  return total;
}

/* Actualiza el número que aparece en el menú "Carrito (X)" */
function actualizarContador() {
  var badge = document.getElementById("cartCount");
  if (badge) {
    badge.textContent = contarArticulos();
  }
}

/* Llamar al cargar cualquier página para mostrar el número correcto */
actualizarContador();


/* --------------------------------------------------
   PÁGINA: INICIO
   Muestra un saludo y la fecha actual
-------------------------------------------------- */
var mensajeDinamico = document.getElementById("mensajeDinamico");

if (mensajeDinamico) {
  var hoy = new Date();
  var opciones = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  var fechaTexto = hoy.toLocaleDateString("es-MX", opciones);
  var hora = hoy.getHours();

  var saludo = "Buenas noches";
  if (hora >= 6 && hora < 12) {
    saludo = "Buenos días";
  } else if (hora >= 12 && hora < 19) {
    saludo = "Buenas tardes";
  }

  mensajeDinamico.textContent = saludo + "! Hoy es " + fechaTexto + ".";
}


/* --------------------------------------------------
   PÁGINA: REGISTRO
   1. Habilitar botón al marcar el checkbox
   2. Validar campos antes de enviar
-------------------------------------------------- */
var checkboxTerminos = document.getElementById("terminos");
var btnEnviar        = document.getElementById("btnEnviar");
var formRegistro     = document.getElementById("formRegistro");
var mensajeError     = document.getElementById("mensajeError");
var mensajeExito     = document.getElementById("mensajeExito");

if (checkboxTerminos && btnEnviar) {
  checkboxTerminos.addEventListener("change", function () {
    btnEnviar.disabled = !checkboxTerminos.checked;
  });
}

if (formRegistro) {
  formRegistro.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var nombre   = document.getElementById("nombre").value.trim();
    var email    = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value.trim();
    var fecha    = document.getElementById("fecha").value;
    var telefono = document.getElementById("telefono").value.trim();

    if (!nombre || !email || !password || !fecha || !telefono) {
      mensajeError.textContent = "Por favor, completa todos los campos.";
      return;
    }

    var regexEmail = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!regexEmail.test(email)) {
      mensajeError.textContent = "El correo electrónico no tiene un formato válido.";
      return;
    }

    mensajeError.textContent = "";
    formRegistro.style.display = "none";
    mensajeExito.style.display = "block";
  });
}


/* --------------------------------------------------
   PÁGINA: QUIÉNES SOMOS
   Botón "Ver más / Ver menos"
-------------------------------------------------- */
var btnVerMas = document.getElementById("btnVerMas");
var infoExtra = document.getElementById("infoExtra");

if (btnVerMas && infoExtra) {
  btnVerMas.addEventListener("click", function () {
    if (infoExtra.style.display === "none") {
      infoExtra.style.display = "block";
      btnVerMas.textContent = "Ver menos";
    } else {
      infoExtra.style.display = "none";
      btnVerMas.textContent = "Ver más información";
    }
  });
}


/* --------------------------------------------------
   PÁGINA: CATÁLOGO
   Al hacer clic en "Agregar al carrito":
   - Si el producto ya existe en el carrito, suma 1 a su cantidad
   - Si es nuevo, lo agrega como nueva entrada
   - Actualiza el contador del menú
   - Muestra un mensaje de confirmación
-------------------------------------------------- */
var botonesAgregar  = document.querySelectorAll(".btn-agregar");
var mensajeCarrito  = document.getElementById("mensajeCarrito");

botonesAgregar.forEach(function (boton) {
  boton.addEventListener("click", function () {
    var nombre = boton.getAttribute("data-nombre");
    var precio = parseFloat(boton.getAttribute("data-precio"));

    var carrito = obtenerCarrito();

    /* Buscar si el producto ya está en el carrito */
    var encontrado = false;
    carrito.forEach(function (item) {
      if (item.nombre === nombre) {
        item.cantidad += 1;  /* Si ya existe, sumar 1 */
        encontrado = true;
      }
    });

    /* Si no existe, agregarlo como nuevo */
    if (!encontrado) {
      carrito.push({ nombre: nombre, precio: precio, cantidad: 1 });
    }

    guardarCarrito(carrito);
    actualizarContador();

    /* Mostrar mensaje debajo del título */
    if (mensajeCarrito) {
      mensajeCarrito.textContent = "✅ \"" + nombre + "\" agregado al carrito. Total de artículos: " + contarArticulos();
    }
  });
});


/* --------------------------------------------------
   PÁGINA: CARRITO
   - Lee los productos de localStorage y dibuja las filas
   - Recalcula subtotales al cambiar cantidad
   - Elimina productos al hacer clic en "Eliminar"
   - Actualiza el total general en tiempo real
-------------------------------------------------- */
var carritoBody   = document.getElementById("carritoBody");
var carritoTable  = document.getElementById("carritoTable");
var carritoVacio  = document.getElementById("carritoVacio");
var totalValEl    = document.getElementById("totalVal");
var subtotalValEl = document.getElementById("subtotalVal");
var btnPago       = document.getElementById("btnPago");

/* Dibuja todas las filas a partir del array del carrito */
function renderizarCarrito() {
  if (!carritoBody) return;

  var carrito = obtenerCarrito();

  /* Limpiar las filas actuales */
  carritoBody.innerHTML = "";

  if (carrito.length === 0) {
    /* Carrito vacío: ocultar tabla y mostrar mensaje */
    if (carritoTable) carritoTable.style.display = "none";
    if (carritoVacio) carritoVacio.style.display = "block";
    if (btnPago)      btnPago.disabled = true;
    if (totalValEl)    totalValEl.textContent    = "$0";
    if (subtotalValEl) subtotalValEl.textContent = "$0";
    return;
  }

  /* Hay productos: mostrar tabla y ocultar mensaje */
  if (carritoTable) carritoTable.style.display = "table";
  if (carritoVacio) carritoVacio.style.display = "none";
  if (btnPago)      btnPago.disabled = false;

  /* Crear una fila por cada producto */
  carrito.forEach(function (item, indice) {
    var subtotal = item.precio * item.cantidad;

    var fila = document.createElement("tr");
    fila.setAttribute("data-indice", indice);

    fila.innerHTML =
      "<td>" + item.nombre + "</td>" +
      "<td>$" + item.precio.toLocaleString("es-MX") + "</td>" +
      "<td><input type='number' class='cantidad' value='" + item.cantidad + "' min='1' max='99' /></td>" +
      "<td class='subtotal'>$" + subtotal.toLocaleString("es-MX") + "</td>" +
      "<td><button class='btn-eliminar'>Eliminar</button></td>";

    carritoBody.appendChild(fila);
  });

  actualizarTotal();
}

/* Suma todos los subtotales y actualiza el resumen */
function actualizarTotal() {
  var carrito = obtenerCarrito();
  var total = 0;
  carrito.forEach(function (item) {
    total += item.precio * item.cantidad;
  });
  var totalFormateado = "$" + total.toLocaleString("es-MX");
  if (totalValEl)    totalValEl.textContent    = totalFormateado;
  if (subtotalValEl) subtotalValEl.textContent = totalFormateado;
}

/* Escuchar cambios de cantidad en la tabla */
if (carritoBody) {
  carritoBody.addEventListener("input", function (evento) {
    if (evento.target.classList.contains("cantidad")) {
      var fila    = evento.target.closest("tr");
      var indice  = parseInt(fila.getAttribute("data-indice"));
      var nuevaCantidad = parseInt(evento.target.value);

      if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
        nuevaCantidad = 1;
        evento.target.value = 1;
      }

      /* Actualizar en el array y guardar */
      var carrito = obtenerCarrito();
      carrito[indice].cantidad = nuevaCantidad;
      guardarCarrito(carrito);

      /* Actualizar la celda de subtotal de esa fila */
      var subtotal = carrito[indice].precio * nuevaCantidad;
      fila.querySelector(".subtotal").textContent = "$" + subtotal.toLocaleString("es-MX");

      /* Actualizar el total general */
      actualizarTotal();
      actualizarContador();
    }
  });

  /* Escuchar clics en los botones de eliminar */
  carritoBody.addEventListener("click", function (evento) {
    if (evento.target.classList.contains("btn-eliminar")) {
      var fila   = evento.target.closest("tr");
      var indice = parseInt(fila.getAttribute("data-indice"));

      var carrito = obtenerCarrito();
      var nombreEliminado = carrito[indice].nombre;

      /* Quitar el producto del array */
      carrito.splice(indice, 1);
      guardarCarrito(carrito);

      /* Volver a dibujar toda la tabla para que los índices queden correctos */
      renderizarCarrito();
      actualizarContador();

      alert("\"" + nombreEliminado + "\" fue eliminado del carrito.");
    }
  });
}

/* Botón de pago */
if (btnPago) {
  btnPago.addEventListener("click", function () {
    var carrito = obtenerCarrito();
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    alert("✅ ¡Pedido realizado con éxito!\nRecibirás un correo de confirmación.");

    /* Vaciar el carrito después del pago */
    guardarCarrito([]);
    actualizarContador();
    renderizarCarrito();
  });
}

/* Dibujar el carrito al cargar la página */
renderizarCarrito();


/* --------------------------------------------------
   PÁGINA: BÚSQUEDA
   Lista completa de productos del catálogo.
   Al buscar, filtra por nombre y muestra solo
   los que coincidan con lo que escribió el usuario.
-------------------------------------------------- */

/* Todos los productos del catálogo con su nombre y precio */
var todoLosProductos = [
  /* --- Mujer: Blusas y camisas --- */
  { nombre: "Blusa blanca",           precio: 299  },
  { nombre: "Blusa estampada",        precio: 349  },
  { nombre: "Camisa de lino",         precio: 399  },
  /* --- Mujer: Vestidos --- */
  { nombre: "Vestido floral",         precio: 549  },
  { nombre: "Vestido negro",          precio: 699  },
  { nombre: "Vestido casual",         precio: 479  },
  /* --- Mujer: Pantalones y faldas --- */
  { nombre: "Pantalón negro mujer",   precio: 459  },
  { nombre: "Falda de jean",          precio: 389  },
  { nombre: "Falda larga",            precio: 429  },
  /* --- Mujer: Chamarras y abrigos --- */
  { nombre: "Chamarra rosa",          precio: 849  },
  { nombre: "Abrigo beige",           precio: 1199 },
  { nombre: "Chamarra de cuero mujer",precio: 1399 },
  /* --- Hombre: Camisetas y polos --- */
  { nombre: "Camiseta básica",        precio: 199  },
  { nombre: "Polo azul",              precio: 349  },
  { nombre: "Camiseta gráfica",       precio: 249  },
  /* --- Hombre: Camisas --- */
  { nombre: "Camisa formal",          precio: 499  },
  { nombre: "Camisa de cuadros",      precio: 429  },
  { nombre: "Camisa de lino hombre",  precio: 379  },
  /* --- Hombre: Pantalones --- */
  { nombre: "Pantalón mezclilla",     precio: 599  },
  { nombre: "Pantalón cargo",         precio: 499  },
  { nombre: "Pantalón formal",        precio: 649  },
  /* --- Hombre: Chamarras y sudaderas --- */
  { nombre: "Chamarra mezclilla",     precio: 799  },
  { nombre: "Sudadera gris",          precio: 449  },
  { nombre: "Chamarra bomber",        precio: 999  },
  /* --- Accesorios --- */
  { nombre: "Bolso de cuero",         precio: 1199 },
  { nombre: "Reloj clásico",          precio: 1499 },
  { nombre: "Cinturón negro",         precio: 249  },
  { nombre: "Gorra negra",            precio: 199  }
];

var formBusqueda    = document.getElementById("formBusqueda");
var campoBusqueda   = document.getElementById("campoBusqueda");
var divResultados   = document.getElementById("resultados");
var textoBusqueda   = document.getElementById("textoBusqueda");
var listaResultados = document.getElementById("listaResultados");

if (formBusqueda) {
  formBusqueda.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var termino = campoBusqueda.value.trim().toLowerCase();

    if (termino === "") return;

    /* Filtrar: quedarse solo con productos cuyo nombre
       contenga el término buscado (sin importar mayúsculas) */
    var encontrados = todoLosProductos.filter(function (producto) {
      return producto.nombre.toLowerCase().indexOf(termino) !== -1;
    });

    /* Mostrar el mensaje de resultados */
    divResultados.style.display = "block";

    if (encontrados.length === 0) {
      /* Ningún producto coincide */
      textoBusqueda.textContent = "No se encontraron productos para: \"" + campoBusqueda.value.trim() + "\"";
      listaResultados.innerHTML = "<p>Intenta con otro término, por ejemplo: blusa, vestido, pantalón...</p>";
      return;
    }

    textoBusqueda.textContent = "Resultados para \"" + campoBusqueda.value.trim() + "\": " + encontrados.length + " producto(s) encontrado(s)";

    /* Limpiar resultados anteriores */
    listaResultados.innerHTML = "";

    /* Crear una tarjeta por cada producto encontrado */
    encontrados.forEach(function (producto) {
      var tarjeta = document.createElement("div");
      tarjeta.className = "producto";

      tarjeta.innerHTML =
        "<h3>" + producto.nombre + "</h3>" +
        "<p>$" + producto.precio.toLocaleString("es-MX") + "</p>" +
        "<button class='btn-agregar-busqueda' " +
          "data-nombre='" + producto.nombre + "' " +
          "data-precio='" + producto.precio + "'>Agregar al carrito</button>";

      listaResultados.appendChild(tarjeta);
    });

    /* Activar los botones "Agregar al carrito" de los resultados */
    listaResultados.querySelectorAll(".btn-agregar-busqueda").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var nombre = boton.getAttribute("data-nombre");
        var precio = parseFloat(boton.getAttribute("data-precio"));

        var carrito = obtenerCarrito();
        var encontrado = false;

        carrito.forEach(function (item) {
          if (item.nombre === nombre) {
            item.cantidad += 1;
            encontrado = true;
          }
        });

        if (!encontrado) {
          carrito.push({ nombre: nombre, precio: precio, cantidad: 1 });
        }

        guardarCarrito(carrito);
        actualizarContador();
        alert("✅ \"" + nombre + "\" agregado al carrito.");
      });
    });

  });
}