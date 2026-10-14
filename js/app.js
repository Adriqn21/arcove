/**
 * ARCOVE SAC - JavaScript Interactions & Dynamic Functions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav');
  // Incluye el botón CTA para que también cierre el menú al pulsarlo
  const navLinks = document.querySelectorAll('.nav-list a, .nav-cta');

  const setMenuState = (open) => {
    if (!mobileToggle || !mainNav) return;
    mainNav.classList.toggle('active', open);
    mobileToggle.classList.toggle('active', open);
    mobileToggle.setAttribute('aria-expanded', String(open));
    mobileToggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    document.body.classList.toggle('no-scroll', open);
  };

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      setMenuState(!mainNav.classList.contains('active'));
    });

    // Close menu when clicking on any nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => setMenuState(false));
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !mobileToggle.contains(e.target) && mainNav.classList.contains('active')) {
        setMenuState(false);
      }
    });

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('active')) {
        setMenuState(false);
        mobileToggle.focus();
      }
    });

    // Reset menu state when resizing to desktop (evita scroll bloqueado)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
        setMenuState(false);
      }
    });
  }

  // 2. Sticky Header Elevation on Scroll
  const header = document.querySelector('.site-header');
  const backToTopBtn = document.getElementById('back-to-top');

  const onScroll = () => {
    const scrollPos = window.scrollY;

    if (header) {
      header.classList.toggle('scrolled', scrollPos > 30);
    }

    if (backToTopBtn) {
      backToTopBtn.classList.toggle('visible', scrollPos > 400);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // Aplica el estado correcto si la página se carga ya desplazada (recarga / ancla)
  onScroll();

  // 3. Back to Top Action
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 4. Animated Counters for Stats Section
  const statNumbers = document.querySelectorAll('.stat-number');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formatNumber = (n) => n.toLocaleString('en-US'); // 2800 -> 2,800

  const animateCounters = () => {
    statNumbers.forEach(stat => {
      const target = Number(stat.getAttribute('data-target')) || 0;
      const suffix = stat.getAttribute('data-suffix') || '';
      const duration = 1200; // ms, igual para todos los contadores
      let startTime = null;

      const render = (value) => {
        stat.textContent = formatNumber(value);
        if (suffix) {
          const span = document.createElement('span');
          span.textContent = suffix;
          stat.appendChild(span);
        }
      };

      const updateCount = (timestamp) => {
        if (startTime === null) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        render(Math.round(target * progress));
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  const statsSection = document.querySelector('.stats-section');
  if (statNumbers.length > 0 && statsSection && !prefersReducedMotion && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      if (entries.some(entry => entry.isIntersecting)) {
        animateCounters();
        observer.disconnect();
      }
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
  }

  // 5. FAQ Accordion (clic y teclado)
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  const toggleAccordion = (header) => {
    const item = header.parentElement;
    const isActive = item.classList.contains('active');

    // Close all accordion items
    document.querySelectorAll('.accordion-item').forEach(acc => {
      acc.classList.remove('active');
      const h = acc.querySelector('.accordion-header');
      if (h) h.setAttribute('aria-expanded', 'false');
    });

    // Toggle clicked item
    if (!isActive) {
      item.classList.add('active');
      header.setAttribute('aria-expanded', 'true');
    }
  };

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => toggleAccordion(header));
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAccordion(header);
      }
    });
  });

  // 6. Interactive Contact / Quotation Form Handling
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    const alertBox = document.getElementById('formAlert');

    const showAlert = (type, html) => {
      if (!alertBox) return;
      // Limpia estilos en línea de alertas anteriores para que no pisen la clase .success
      alertBox.removeAttribute('style');
      if (type === 'error') {
        alertBox.className = 'form-alert';
        alertBox.style.backgroundColor = '#fef2f2';
        alertBox.style.color = '#991b1b';
        alertBox.style.border = '1px solid #fecaca';
        alertBox.style.display = 'block';
      } else {
        alertBox.className = 'form-alert success';
      }
      alertBox.setAttribute('role', 'alert');
      alertBox.innerHTML = html;
    };

    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name')?.value.trim();
      const phone = document.getElementById('phone')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const service = document.getElementById('service')?.value;
      const message = document.getElementById('message')?.value.trim();

      if (!name || !phone || !email || !message) {
        showAlert('error', '<i class="fas fa-exclamation-circle"></i> Completa nombre, teléfono, correo y detalle del proyecto.');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAlert('error', '<i class="fas fa-exclamation-circle"></i> El correo electrónico no es válido.');
        return;
      }

      // 1. ENVIAR CORREO (en segundo plano)
      // Reemplaza 'TU_ENDPOINT_AQUI' con el código que te da Formspree (es gratis)
      const formEndpoint = 'https://formspree.io/f/maeqnnjl';

      fetch(formEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Nombre: name,
          Telefono: phone,
          Email: email,
          Servicio: service || 'General',
          Mensaje: message
        })
      }).catch(err => console.error('Error enviando correo:', err));

      // 2. REDIRIGIR A WHATSAPP (Se mantiene tu función original)
      const waNumber = '51987654321'; // Tu número de empresa
      const waText = encodeURIComponent(
        `*Hola Arcove SAC, solicito una cotización:*\n\n` +
        `👤 *Nombre:* ${name}\n` +
        `📱 *Teléfono:* ${phone}\n` +
        `✉️ *Email:* ${email}\n` +
        `🏗️ *Servicio:* ${service || 'General'}\n` +
        `📝 *Detalle del proyecto:* ${message}`
      );

      showAlert('success', '<i class="fas fa-check-circle"></i> Solicitud registrada. Abriendo WhatsApp...');

      // Se abre de inmediato para que el navegador no lo bloquee como pop-up
      const waWindow = window.open(`https://wa.me/${waNumber}?text=${waText}`, '_blank');
      if (waWindow) {
        waWindow.opener = null;
      } else {
        window.location.href = `https://wa.me/${waNumber}?text=${waText}`;
      }
      quoteForm.reset();
    });
  }

  // 7. Año actual en el footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
