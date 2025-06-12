const config = {
    apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8000'
        : 'https://clickerempire.onrender.com'
};

// Función para normalizar rutas
function normalizePath(path) {
    // Eliminar trailing slash y asegurar que empiece con /
    return '/' + path.replace(/^\/|\/$/g, '');
}

// Función para actualizar el enlace activo
function updateActiveLink() {
    const currentPath = normalizePath(window.location.pathname);
    const navLinks = document.querySelectorAll('.navbar__link');

    navLinks.forEach(link => {
        const href = normalizePath(link.getAttribute('href'));
        if (currentPath === href) {
            link.classList.add('navbar__link--active');
        } else {
            link.classList.remove('navbar__link--active');
        }
    });
}

// Actualizar el enlace activo cuando se carga la página
document.addEventListener('DOMContentLoaded', updateActiveLink);

// Actualizar el enlace activo cuando cambia la URL
window.addEventListener('popstate', updateActiveLink);

// Actualizar el enlace activo cuando se hace clic en un enlace
document.addEventListener('click', (e) => {
    const link = e.target.closest('.navbar__link');
    if (link) {
        setTimeout(updateActiveLink, 100); // Pequeño delay para asegurar que la URL se ha actualizado
    }
});
