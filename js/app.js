document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.getElementById("mobile-toggle");
  const mainNav = document.getElementById("main-nav");

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      // Activa o desactiva la visibilidad del menú
      mainNav.classList.toggle("active");

      // Transforma el ícono de hamburguesa en una "X"
      mobileToggle.classList.toggle("active");
    });
  }
});
