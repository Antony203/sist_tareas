// Prototipo visual. Todos los datos son ejemplos y permanecen solo en el navegador.
// En las siguientes etapas se conectarán estos formularios con PHP y MariaDB.

// Datos de ejemplo para probar las pantallas.
var tareas = [
  { id: 1, titulo: "Preparar informe del área", descripcion: "Organizar los resultados del mes.", prioridad: "Alta", plazo: "2026-11-20", situacion: "Distribuida" },
  { id: 2, titulo: "Revisar solicitudes recibidas", descripcion: "Revisar las solicitudes pendientes.", prioridad: "Media", plazo: "", situacion: "Distribuida" },
  { id: 3, titulo: "Actualizar inventario de tareas", descripcion: "Actualizar la relación de actividades.", prioridad: "Alta", plazo: "2026-11-08", situacion: "Distribuida" },
  { id: 4, titulo: "Coordinar reunión del equipo", descripcion: "Preparar una reunión de coordinación.", prioridad: "Baja", plazo: "2026-11-18", situacion: "Distribuida" },
  { id: 5, titulo: "Verificar materiales del área", descripcion: "Comprobar los materiales disponibles.", prioridad: "Media", plazo: "2026-11-17", situacion: "Distribuida" },
  { id: 6, titulo: "Organizar actividades de la semana", descripcion: "Preparar el listado de tareas.", prioridad: "Media", plazo: "2026-11-25", situacion: "Registrada" },
  { id: 7, titulo: "Elaborar reporte de avances", descripcion: "Resumir los avances registrados.", prioridad: "Baja", plazo: "", situacion: "Registrada" }
];

var empleados = [
  { id: 1, nombre: "Ana Torres" },
  { id: 2, nombre: "Luis Quispe" },
  { id: 3, nombre: "Carla Flores" }
];

// Cada asignación pertenece a una persona y tiene su propio estado y plazo.
var asignaciones = [
  { id: 1, tareaId: 1, empleadoId: 1, estado: "Pendiente", plazo: "2026-11-20", incidencia: "" },
  { id: 2, tareaId: 2, empleadoId: 1, estado: "En proceso", plazo: "", incidencia: "" },
  { id: 3, tareaId: 3, empleadoId: 1, estado: "En proceso", plazo: "2026-11-08", incidencia: "" },
  { id: 4, tareaId: 4, empleadoId: 2, estado: "Completada", plazo: "2026-11-18", incidencia: "" },
  { id: 5, tareaId: 5, empleadoId: 3, estado: "Con incidencia", plazo: "2026-11-17", incidencia: "Falta confirmar los materiales." }
];

var rolActual = "gerente";
var temporizadorMensaje;

function elemento(id) {
  return document.getElementById(id);
}

// Evita que el texto ingresado se interprete como código HTML.
function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, function (caracter) {
    var valores = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return valores[caracter];
  });
}

function encontrarTarea(id) {
  return tareas.find(function (tarea) { return tarea.id === Number(id); });
}

function encontrarEmpleado(id) {
  return empleados.find(function (empleado) { return empleado.id === Number(id); });
}

function mostrarFecha(fecha) {
  if (!fecha) return "Sin plazo";
  var partes = fecha.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function estaAtrasada(asignacion) {
  if (!asignacion.plazo || asignacion.estado === "Completada" || asignacion.estado === "Cancelada") return false;
  var hoy = new Date();
  var fechaActual = hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0") + "-" + String(hoy.getDate()).padStart(2, "0");
  return asignacion.plazo < fechaActual;
}

function etiquetaEstado(estado) {
  var estilo = "estado-pendiente";
  if (estado === "En proceso") estilo = "estado-proceso";
  if (estado === "Completada") estilo = "estado-completada";
  if (estado === "Con incidencia") estilo = "estado-incidencia";
  return '<span class="estado ' + estilo + '">' + escapar(estado) + "</span>";
}

function etiquetaPrioridad(prioridad) {
  return '<span class="prioridad prioridad-' + prioridad.toLowerCase() + '">' + escapar(prioridad) + "</span>";
}

function mostrarMensaje(texto) {
  var caja = elemento("mensaje");
  caja.textContent = texto;
  caja.classList.remove("oculto");
  clearTimeout(temporizadorMensaje);
  temporizadorMensaje = setTimeout(function () { caja.classList.add("oculto"); }, 4700);
}

function iniciarSesionDemo(rol) {
  rolActual = rol;
  var personas = {
    gerente: { nombre: "María Castro", rol: "Gerente de área", iniciales: "MC", inicio: "panel" },
    empleado: { nombre: "Ana Torres", rol: "Empleado", iniciales: "AT", inicio: "mis-tareas" },
    administrador: { nombre: "Lucía Ramos", rol: "Administrador", iniciales: "LR", inicio: "configuracion" }
  };
  var persona = personas[rol];

  elemento("pantalla-ingreso").classList.add("oculto");
  elemento("aplicacion").classList.remove("oculto");
  elemento("nombre-usuario").textContent = persona.nombre;
  elemento("rol-usuario").textContent = persona.rol;
  elemento("avatar-usuario").textContent = persona.iniciales;

  document.querySelectorAll(".enlace-menu").forEach(function (boton) {
    boton.classList.toggle("oculto", boton.dataset.roles !== rol);
  });
  mostrarVista(persona.inicio);
}

function mostrarVista(nombre) {
  document.querySelectorAll(".vista").forEach(function (vista) {
    vista.classList.add("oculto");
  });
  elemento("vista-" + nombre).classList.remove("oculto");

  document.querySelectorAll(".enlace-menu").forEach(function (boton) {
    boton.classList.toggle("activo", boton.dataset.vista === nombre);
  });

  var nombres = {
    panel: "Panel general", tareas: "Tareas", distribucion: "Distribuir tareas",
    seguimiento: "Seguimiento", "mis-tareas": "Mis tareas",
    configuracion: "Institución", usuarios: "Áreas y usuarios"
  };
  elemento("ruta-actual").textContent = "Inicio / " + nombres[nombre];
  document.querySelector(".barra-lateral").classList.remove("abierta");

  if (nombre === "panel") actualizarPanel();
  if (nombre === "tareas") mostrarTareas();
  if (nombre === "distribucion") prepararDistribucion();
  if (nombre === "seguimiento") mostrarSeguimiento();
  if (nombre === "mis-tareas") mostrarMisTareas();
}

function actualizarPanel() {
  elemento("cantidad-tareas").textContent = tareas.length;
  elemento("cantidad-pendientes").textContent = asignaciones.filter(function (a) { return a.estado === "Pendiente"; }).length;
  elemento("cantidad-proceso").textContent = asignaciones.filter(function (a) { return a.estado === "En proceso"; }).length;
  elemento("cantidad-completadas").textContent = asignaciones.filter(function (a) { return a.estado === "Completada"; }).length;

  var contenido = "";
  tareas.slice(0, 5).forEach(function (tarea) {
    contenido += "<tr><td><strong>" + escapar(tarea.titulo) + "</strong></td><td>" + etiquetaPrioridad(tarea.prioridad) + "</td><td>" + escapar(tarea.situacion) + "</td></tr>";
  });
  elemento("tabla-resumen").innerHTML = contenido;
}

function mostrarTareas() {
  var busqueda = elemento("buscar-tarea").value.toLowerCase();
  var contenido = "";
  tareas.forEach(function (tarea) {
    if (!tarea.titulo.toLowerCase().includes(busqueda)) return;
    contenido += "<tr><td>#" + tarea.id + '</td><td class="titulo-celda"><strong>' + escapar(tarea.titulo) + "</strong><small>Área Administración</small></td><td>" + etiquetaPrioridad(tarea.prioridad) + "</td><td>" + mostrarFecha(tarea.plazo) + "</td><td>" + escapar(tarea.situacion) + "</td></tr>";
  });
  elemento("tabla-tareas").innerHTML = contenido || '<tr><td colspan="5">No se encontraron tareas.</td></tr>';
}

function cambiarFormularioTarea(mostrar) {
  elemento("caja-nueva-tarea").classList.toggle("oculto", !mostrar);
  if (mostrar) elemento("titulo-tarea").focus();
}

function guardarTarea(evento) {
  evento.preventDefault();
  var titulo = elemento("titulo-tarea").value.trim();
  if (!titulo) {
    mostrarMensaje("Escribe un título para la tarea.");
    return;
  }
  tareas.push({
    id: tareas.length ? tareas[tareas.length - 1].id + 1 : 1,
    titulo: titulo,
    descripcion: elemento("descripcion-tarea").value.trim(),
    prioridad: elemento("prioridad-tarea").value,
    plazo: elemento("plazo-tarea").value,
    situacion: "Registrada"
  });
  elemento("formulario-tarea").reset();
  cambiarFormularioTarea(false);
  mostrarTareas();
  mostrarMensaje("Tarea agregada a los datos de ejemplo. Se perderá al recargar la página.");
}

function prepararDistribucion() {
  var selectorTarea = elemento("tarea-distribucion");
  var seleccionado = selectorTarea.value;
  selectorTarea.innerHTML = tareas.map(function (tarea) {
    return '<option value="' + tarea.id + '">' + escapar(tarea.titulo) + "</option>";
  }).join("");
  if (seleccionado) selectorTarea.value = seleccionado;

  elemento("empleado-distribucion").innerHTML = empleados.map(function (empleado) {
    return '<option value="' + empleado.id + '">' + escapar(empleado.nombre) + "</option>";
  }).join("");

  elemento("lista-empleados").innerHTML = empleados.map(function (empleado, posicion) {
    return '<label class="opcion-checkbox"><input type="checkbox" value="' + empleado.id + '" ' + (posicion < 2 ? "checked" : "") + "> " + escapar(empleado.nombre) + "</label>";
  }).join("");

  elemento("lista-tareas-lote").innerHTML = tareas.map(function (tarea, posicion) {
    return '<label class="opcion-checkbox"><input type="checkbox" value="' + tarea.id + '" ' + (posicion < 3 ? "checked" : "") + "> " + escapar(tarea.titulo) + "</label>";
  }).join("");

  cambiarModalidad();
}

function cambiarModalidad() {
  var modo = elemento("modo-distribucion").value;
  elemento("campo-tarea-unica").classList.toggle("oculto", modo === "roundrobin");
  elemento("campo-tareas-lote").classList.toggle("oculto", modo !== "roundrobin");
  elemento("campo-empleado-unico").classList.toggle("oculto", modo !== "individual");
  elemento("campo-empleados-varios").classList.toggle("oculto", modo !== "seleccionados");
  elemento("campo-empleados-area").classList.toggle("oculto", modo !== "area");
  previsualizarReparto();
}

function valoresMarcados(contenedorId) {
  return Array.from(elemento(contenedorId).querySelectorAll('input[type="checkbox"]:checked')).map(function (casilla) {
    return Number(casilla.value);
  });
}

function previsualizarReparto() {
  var modo = elemento("modo-distribucion").value;
  var fechaElegida = elemento("fecha-distribucion").value;
  var propuesta = [];
  var tarea = encontrarTarea(elemento("tarea-distribucion").value);
  var idsEmpleados = [];

  if (modo === "individual") {
    idsEmpleados = [Number(elemento("empleado-distribucion").value)];
  } else if (modo === "seleccionados") {
    idsEmpleados = valoresMarcados("lista-empleados");
  } else if (modo === "area" || modo === "roundrobin") {
    idsEmpleados = empleados.map(function (empleado) { return empleado.id; });
  }

  if (modo === "roundrobin") {
    // Varias tareas diferentes, una para cada empleado en orden circular.
    var idsTareas = valoresMarcados("lista-tareas-lote");
    idsTareas.forEach(function (idTarea, posicion) {
      var tareaLote = encontrarTarea(idTarea);
      var empleadoLote = encontrarEmpleado(idsEmpleados[posicion % idsEmpleados.length]);
      if (tareaLote && empleadoLote) propuesta.push({ tarea: tareaLote, empleado: empleadoLote });
    });
  } else if (tarea) {
    // Individual, seleccionados y área completa: una tarea, uno o varios empleados.
    idsEmpleados.forEach(function (idEmpleado) {
      var empleado = encontrarEmpleado(idEmpleado);
      if (empleado) propuesta.push({ tarea: tarea, empleado: empleado });
    });
  }

  var contenido = "";
  propuesta.forEach(function (item) {
    contenido += "<tr><td><strong>" + escapar(item.tarea.titulo) + "</strong></td><td>" + escapar(item.empleado.nombre) + "</td><td>" + mostrarFecha(fechaElegida || item.tarea.plazo) + "</td></tr>";
  });
  elemento("tabla-previsualizacion").innerHTML = contenido || '<tr><td colspan="3">Selecciona una tarea y al menos un empleado para ver el reparto.</td></tr>';
  elemento("contador-reparto").textContent = propuesta.length + (propuesta.length === 1 ? " asignación" : " asignaciones");
  return propuesta.length;
}

function mostrarSeguimiento() {
  var contenido = "";
  asignaciones.forEach(function (asignacion) {
    var tarea = encontrarTarea(asignacion.tareaId);
    var empleado = encontrarEmpleado(asignacion.empleadoId);
    contenido += "<tr><td><strong>" + escapar(tarea.titulo) + "</strong></td><td>" + escapar(empleado.nombre) + "</td><td>" + etiquetaEstado(asignacion.estado) + "</td><td>" + mostrarFecha(asignacion.plazo) + "</td><td>" + (estaAtrasada(asignacion) ? '<span class="aviso-atrasada">Atrasada</span>' : '<span class="aviso-al-dia">Sin atraso</span>') + "</td></tr>";
  });
  elemento("tabla-seguimiento").innerHTML = contenido;
}

function mostrarMisTareas() {
  var contenido = "";
  asignaciones.forEach(function (asignacion) {
    if (asignacion.empleadoId !== 1) return; // En esta demo el empleado es Ana Torres.
    var tarea = encontrarTarea(asignacion.tareaId);
    contenido += '<div class="tarjeta tarea-empleado"><div class="tarea-empleado-top">' + etiquetaPrioridad(tarea.prioridad) + etiquetaEstado(asignacion.estado) + '</div><h2>' + escapar(tarea.titulo) + '</h2><p>' + escapar(tarea.descripcion) + '</p><div class="detalles-tarea"><span>◷ Fecha límite: <strong>' + mostrarFecha(asignacion.plazo) + '</strong></span>' + (estaAtrasada(asignacion) ? '<span class="aviso-atrasada">⚠ Atrasada</span>' : "") + '</div><div class="acciones-tarea">';
    if (asignacion.estado === "Pendiente") contenido += '<button class="boton-mini" data-accion="iniciar" data-id="' + asignacion.id + '">Iniciar tarea</button>';
    if (asignacion.estado === "En proceso") contenido += '<button class="boton-mini" data-accion="finalizar" data-id="' + asignacion.id + '">Marcar completada</button>';
    if (asignacion.estado === "Pendiente" || asignacion.estado === "En proceso") contenido += '<button class="boton-mini boton-mini-secundario" data-accion="incidencia" data-id="' + asignacion.id + '">Reportar incidencia</button>';
    if (asignacion.estado === "Completada") contenido += '<span class="texto-neutro">No hay más acciones disponibles.</span>';
    if (asignacion.estado === "Con incidencia") contenido += '<span class="texto-neutro">La incidencia debe ser revisada por el gerente.</span>';
    contenido += "</div></div>";
  });
  elemento("lista-mis-tareas").innerHTML = contenido || '<p>No tienes tareas asignadas.</p>';
}

function actuarSobreTarea(evento) {
  var boton = evento.target.closest("[data-accion]");
  if (!boton) return;
  var asignacion = asignaciones.find(function (item) { return item.id === Number(boton.dataset.id); });
  if (!asignacion || asignacion.empleadoId !== 1) return;

  if (boton.dataset.accion === "iniciar" && asignacion.estado === "Pendiente") {
    asignacion.estado = "En proceso";
    mostrarMensaje("Estado cambiado a En proceso (solo en esta demostración).");
  } else if (boton.dataset.accion === "finalizar" && asignacion.estado === "En proceso") {
    asignacion.estado = "Completada";
    mostrarMensaje("Tarea marcada como completada (solo en esta demostración).");
  } else if (boton.dataset.accion === "incidencia" && (asignacion.estado === "Pendiente" || asignacion.estado === "En proceso")) {
    var motivo = window.prompt("Explica brevemente la incidencia:");
    if (!motivo || !motivo.trim()) return;
    asignacion.incidencia = motivo.trim();
    asignacion.estado = "Con incidencia";
    mostrarMensaje("Incidencia registrada únicamente en esta demostración.");
  }
  mostrarMisTareas();
}

// Eventos de los botones y formularios.
elemento("formulario-ingreso").addEventListener("submit", function (evento) {
  evento.preventDefault();
  iniciarSesionDemo(elemento("rol-ingreso").value);
});

elemento("boton-salir").addEventListener("click", function () {
  elemento("aplicacion").classList.add("oculto");
  elemento("pantalla-ingreso").classList.remove("oculto");
});

document.querySelectorAll(".enlace-menu").forEach(function (boton) {
  boton.addEventListener("click", function () { mostrarVista(boton.dataset.vista); });
});

document.querySelectorAll("[data-ir]").forEach(function (boton) {
  boton.addEventListener("click", function () {
    mostrarVista(boton.dataset.ir);
    if (boton.textContent.indexOf("Nueva tarea") !== -1 || boton.textContent.indexOf("Registrar tarea") !== -1) cambiarFormularioTarea(true);
  });
});

elemento("boton-nueva-tarea").addEventListener("click", function () { cambiarFormularioTarea(true); });
elemento("cerrar-formulario").addEventListener("click", function () { cambiarFormularioTarea(false); });
elemento("cancelar-tarea").addEventListener("click", function () { cambiarFormularioTarea(false); });
elemento("formulario-tarea").addEventListener("submit", guardarTarea);
elemento("buscar-tarea").addEventListener("input", mostrarTareas);
elemento("modo-distribucion").addEventListener("change", cambiarModalidad);

["tarea-distribucion", "empleado-distribucion", "fecha-distribucion", "lista-empleados", "lista-tareas-lote"].forEach(function (id) {
  elemento(id).addEventListener("change", previsualizarReparto);
});

elemento("boton-confirmar").addEventListener("click", function () {
  if (!previsualizarReparto()) {
    mostrarMensaje("Selecciona tareas y empleados para continuar.");
  } else {
    mostrarMensaje("Esta es solo una vista previa. La confirmación real se implementará con PHP y MariaDB.");
  }
});

elemento("lista-mis-tareas").addEventListener("click", actuarSobreTarea);

elemento("formulario-institucion").addEventListener("submit", function (evento) {
  evento.preventDefault();
  var nombre = elemento("nombre-institucion").value.trim();
  if (!nombre) { mostrarMensaje("Ingresa el nombre de la institución."); return; }
  elemento("nombre-institucion-lateral").textContent = nombre;
  mostrarMensaje("Nombre actualizado en pantalla. No se guardó en una base de datos.");
});

elemento("boton-menu").addEventListener("click", function () {
  document.querySelector(".barra-lateral").classList.toggle("abierta");
});
