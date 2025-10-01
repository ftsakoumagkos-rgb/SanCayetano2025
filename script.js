// Datos de usuarios válidos
const usuarios = [
    { usuario: "admin", clave: "1234" },
    { usuario: "paciente", clave: "5678" }
];

// Función para cargar turnos desde localStorage
function cargarTurnos() {
    const turnos = JSON.parse(localStorage.getItem('turnos')) || [];
    return turnos;
}

// Función para guardar turno en localStorage
function guardarTurno(turno) {
    let turnos = cargarTurnos();
    turnos.push(turno);
    localStorage.setItem('turnos', JSON.stringify(turnos));
}

// Función para eliminar turno de localStorage
function eliminarTurno(index) {
    let turnos = cargarTurnos();
    turnos.splice(index, 1);
    localStorage.setItem('turnos', JSON.stringify(turnos));
}

// Función para verificar si el usuario es admin
function esAdmin() {
    const usuarioLogueado = sessionStorage.getItem("logueado");
    return usuarioLogueado === "admin";
}

// Función para mostrar turnos en "Mis Turnos"
function mostrarTurnos() {
    const lista = document.getElementById("turnos-lista");
    if (!lista) return;
    
    const turnos = cargarTurnos();
    if (turnos.length === 0) {
        lista.innerHTML = `<p class="text-muted">No tienes turnos agendados.</p>`;
        return;
    }
    
    let html = '<ul class="list-group">';
    turnos.forEach((t, index) => {
        html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                    ${t.nombre} - ${t.medico} - ${t.fecha}`;
        
        // Mostrar botón de eliminar solo si es admin
        if (esAdmin()) {
            html += `<button class="btn btn-danger btn-sm" onclick="eliminarTurnoClick(${index})">
                        <i class="fas fa-trash"></i> Eliminar
                     </button>`;
        }
        
        html += `</li>`;
    });
    html += '</ul>';
    lista.innerHTML = html;
}

// Función para eliminar turno (llamada desde el botón)
function eliminarTurnoClick(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este turno?")) {
        eliminarTurno(index);
        mostrarTurnos(); // Actualizar la lista
    }
}

// Función para verificar si el usuario está logueado
function estaLogueado() {
    return sessionStorage.getItem("logueado") !== null;
}

// Función para actualizar el navbar según el estado de login
function actualizarNavbar() {
    const loginLink = document.querySelector('a[href="login.html"]');
    const logoutLink = document.querySelector('#logout-link');
    
    if (!loginLink || !logoutLink) return;
    
    if (estaLogueado()) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
    } else {
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
    }
}

// Función para proteger páginas que requieren login
function protegerPagina() {
    const paginasRequierenLogin = ["turnos.html", "mis-turnos.html"];
    const paginaActual = window.location.pathname.split('/').pop();
    
    if (paginasRequierenLogin.includes(paginaActual) && !estaLogueado()) {
        alert("Debe iniciar sesión para acceder a esta página.");
        window.location.href = "login.html";
    }
}

// Función para inicializar el calendario
function inicializarCalendario() {
    const fechaInput = document.getElementById("fecha");
    if (fechaInput) {
        flatpickr(fechaInput, {
            locale: "es",
            minDate: "today",
            dateFormat: "Y-m-d",
        });
    }
}

// Función para manejar el formulario de login
function inicializarLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;
    
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const usuario = document.getElementById("usuario").value.trim();
        const clave = document.getElementById("clave").value.trim();
        const mensaje = document.getElementById("mensaje-login");

        if (!usuario || !clave) {
            mensaje.innerHTML = `<div class="alert alert-warning">Por favor, complete todos los campos.</div>`;
            return;
        }

        const user = usuarios.find(u => u.usuario === usuario && u.clave === clave);
        if (user) {
            sessionStorage.setItem("logueado", user.usuario);
            mensaje.innerHTML = `<div class="alert alert-success">¡Bienvenido, ${user.usuario}!</div>`;
            setTimeout(() => {
                actualizarNavbar();
                window.location.href = "turnos.html";
            }, 1500);
        } else {
            mensaje.innerHTML = `<div class="alert alert-danger">Usuario o contraseña incorrectos.</div>`;
        }
    });
}

// Función para manejar el formulario de turnos
function inicializarTurnos() {
    const turnoForm = document.getElementById("turnoForm");
    if (!turnoForm) return;
    
    turnoForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const nombre = document.getElementById("nombre").value.trim();
        const medico = document.getElementById("medico").value;
        const fecha = document.getElementById("fecha").value;

        if (!nombre || !medico || !fecha) {
            document.getElementById("mensaje-turno").innerHTML = 
                `<div class="alert alert-warning">Por favor, complete todos los campos.</div>`;
            return;
        }

        const mensaje = document.getElementById("mensaje-turno");
        const turnos = cargarTurnos();
        const turnoExistente = turnos.some(t => 
            t.nombre === nombre && t.fecha === fecha && t.medico === medico
        );
        
        if (turnoExistente) {
            mensaje.innerHTML = `<div class="alert alert-warning">Ya tienes un turno con este médico en esta fecha.</div>`;
            return;
        }

        const turno = { nombre, medico, fecha };
        guardarTurno(turno);
        mensaje.innerHTML = `<div class="alert alert-success">Turno solicitado: ${nombre}, con ${medico} el día ${fecha}.</div>`;
        
        // Limpiar el formulario
        turnoForm.reset();
        
        // Actualizar la lista de turnos si estamos en mis-turnos
        if (window.location.pathname.includes('mis-turnos.html')) {
            mostrarTurnos();
        }
    });
}

// Función para cerrar sesión con limpieza completa
function cerrarSesion() {
    // Limpiar todos los datos de sesión
    sessionStorage.clear();
    
    // Actualizar navbar
    actualizarNavbar();
    
    // Redirigir a la página principal
    window.location.href = "index.html";
}

// Función principal que se ejecuta al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    // Inicializar funcionalidades según la página
    protegerPagina();
    actualizarNavbar();
    inicializarCalendario();
    inicializarLogin();
    inicializarTurnos();
    
    // Mostrar turnos si estamos en la página de mis-turnos
    if (document.getElementById("turnos-lista")) {
        mostrarTurnos();
    }
});

// Exponer funciones globales para que puedan ser llamadas desde HTML
window.cerrarSesion = cerrarSesion;
window.eliminarTurnoClick = eliminarTurnoClick;