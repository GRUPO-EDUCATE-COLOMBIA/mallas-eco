// FILE: js/diccionario-controller.js | VERSION: v11.0.0 (Diccionario ECO - Fase Beta)
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const grado = urlParams.get('grado');
  const periodo = parseInt(urlParams.get('periodo')); // Se espera un número
  const areaNombre = urlParams.get('area') || "Proyecto Socioemocional"; // Para encabezado si no se pasa explícitamente

  if (!grado || isNaN(periodo)) {
    alert('Error: Grado o Período no especificado en la URL.');
    window.close(); // Cierra la ventana si falta información esencial
    return;
  }

  // Elementos del DOM
  const headerInfo = document.getElementById('dic-header-info');
  const dicMenu = document.getElementById('dic-menu');
  const dicContentDisplay = document.getElementById('dic-content-display');
  const btnCerrar = document.getElementById('btn-cerrar-dic');
  const btnImprimir = document.getElementById('btn-imprimir-dic');
  const btnTop = document.getElementById('btn-top-dic');

  // Cache interna para los datos cargados
  let diccionarioData = null;
  let talleresData = null;
  let conceptosColores = {}; // Para asignar colores únicos a los conceptos

  // --- CONFIGURACIÓN DE COLORES PARA CONCEPTOS Y TALLERES ---
  // Se usarán los colores secundarios de educate-tokens.json
  const coloresConceptos = [
    'var(--color-secondary-100)', // Naranja
    'var(--color-secondary-200)', // Rojo anaranjado
    'var(--color-primary-300)',   // Verde azulado (usado también en ECO, Primary 300)
    'var(--color-secondary-400)', // Vino
    'var(--color-eco-purple)',    // Púrpura ECO
    'var(--color-secondary-500)', // Verde oliva
    'var(--color-primary-200)',   // Azul intermedio (Primary 200)
  ];
  let colorIndex = 0; // Para rotar los colores

  // --- FUNCIONES DE UTILIDAD ---
  function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();
  }

  function getConceptoColor(concepto) {
    const key = normalizarTexto(concepto);
    if (!conceptosColores[key]) {
      conceptosColores[key] = coloresConceptos[colorIndex % coloresConceptos.length];
      colorIndex++;
    }
    return conceptosColores[key];
  }

  function showLoading(show) {
    const loadingMessage = dicContentDisplay.querySelector('.loading-message');
    if (loadingMessage) {
      loadingMessage.style.display = show ? 'block' : 'none';
    }
    dicContentDisplay.style.minHeight = show ? '200px' : 'auto'; // Mantener altura mínima
  }

  // --- CARGA DE DATOS ---
  async function cargarDatosDiccionario() {
    if (diccionarioData) return diccionarioData; // Retornar caché si ya existe
    try {
      showLoading(true);
      const response = await fetch(`data/diccionario/${grado}_diccionario.json?v=${new Date().getTime()}`);
      if (!response.ok) throw new Error('No se pudo cargar el diccionario.');
      diccionarioData = await response.json();
      showLoading(false);
      return diccionarioData;
    } catch (error) {
      console.error("Error al cargar el diccionario:", error);
      showLoading(false);
      dicContentDisplay.innerHTML = `<p class="error-message">Error al cargar el diccionario para Grado ${grado}.</p>`;
      return null;
    }
  }

  async function cargarDatosTalleres() {
    if (talleresData) return talleresData; // Retornar caché si ya existe
    try {
      showLoading(true);
      const response = await fetch(`data/diccionario/${grado}_talleres.json?v=${new Date().getTime()}`);
      if (!response.ok) throw new Error('No se pudieron cargar los talleres.');
      talleresData = await response.json();
      showLoading(false);
      return talleresData;
    } catch (error) {
      console.error("Error al cargar los talleres:", error);
      showLoading(false);
      // No reemplazar el contenido si hay error en talleres, solo mostrar mensaje
      dicContentDisplay.insertAdjacentHTML('beforeend', `<p class="error-message">Error al cargar los talleres para Grado ${grado}.</p>`);
      return null;
    }
  }

  // --- RENDERIZADO DE CONTENIDO ---
  function renderizarDiccionario() {
    if (!diccionarioData) {
      dicContentDisplay.innerHTML = `<p class="error-message">Diccionario no disponible.</p>`;
      return;
    }

    const periodoKey = `periodo_${periodo}`;
    const conceptosPeriodo = diccionarioData[periodoKey];

    if (!conceptosPeriodo || conceptosPeriodo.length === 0) {
      dicContentDisplay.innerHTML = `<p class="info-message">No hay conceptos de diccionario para el periodo ${periodo} del grado ${grado}.</p>`;
      return;
    }

    let html = `
      <div class="dic-header-section">
        <strong>ESTÁNDAR DEL PERIODO:</strong>
        <p>Identifico emociones básicas en momentos escolares cotidianos.</p>
        <p>EJE | COMPETENCIA: Autonomía emocional</p>
      </div>
    `;

    conceptosPeriodo.forEach(concepto => {
      const conceptoColor = getConceptoColor(concepto.concepto);
      html += `
        <div class="dic-concepto-card" style="--concepto-color: ${conceptoColor};">
          <h3>${concepto.concepto}</h3>
          <div class="dic-field"><strong>Definición Pedagógica:</strong> <p>${concepto.definicion_pedagogica}</p></div>
          <div class="dic-field"><strong>Definición para el Estudiante:</strong> <p>${concepto.definicion_estudiante}</p></div>
          <div class="dic-field"><strong>Habilidad en Malla:</strong> <p>${concepto.habilidad_malla}</p></div>
          <div class="dic-field"><strong>Ejemplo de Aula:</strong> <p>${concepto.ejemplo_aula}</p></div>
          <div class="dic-field"><strong>Evidencia de Logro:</strong> <p>${concepto.evidencia_logro}</p></div>
          <div class="dic-tip">${concepto.tip_psicologico}</div>
        </div>
      `;
    });
    dicContentDisplay.innerHTML = html;
  }

  function renderizarTaller(tallerIndex) {
    if (!talleresData) {
      dicContentDisplay.innerHTML = `<p class="error-message">Talleres no disponibles.</p>`;
      return;
    }

    const periodoTalleres = talleresData.periodos.find(p => p.numero_periodo === periodo);

    if (!periodoTalleres || !periodoTalleres.talleres || periodoTalleres.talleres.length === 0) {
      dicContentDisplay.innerHTML = `<p class="info-message">No hay talleres para el periodo ${periodo} del grado ${grado}.</p>`;
      return;
    }

    const taller = periodoTalleres.talleres[tallerIndex - 1]; // tallerIndex es 1, 2 o 3

    if (!taller) {
      dicContentDisplay.innerHTML = `<p class="info-message">Taller ${tallerIndex} no encontrado para el periodo ${periodo}.</p>`;
      return;
    }

    // Colores para talleres, rotando los mismos o un subconjunto
    const tallerColor = coloresConceptos[(tallerIndex - 1 + 2) % coloresConceptos.length]; // Offset para diferenciarlos

    let html = `
      <div class="taller-card" style="--taller-color: ${tallerColor};">
        <h3>TALLER ${tallerIndex}: ${taller.nombre_taller}</h3>
        <div class="dic-field"><strong>Conceptos Relacionados:</strong> <p>${taller.conceptos_relacionados.join(', ')}</p></div>
        <div class="dic-field"><strong>Propósito de la Experiencia:</strong> <p>${taller.proposito_experiencia}</p></div>
        <div class="dic-field"><strong>Recursos ECO:</strong> <p>${taller.recursos_eco}</p></div>
        <div class="dic-field"><strong>Momento de Inicio / Conexión:</strong> <p>${taller.momento_inicio_conexion}</p></div>
        <div class="dic-field"><strong>Momento de Desarrollo / Vivencia:</strong> <p>${taller.momento_desarrollo_vivencia}</p></div>
        <div class="dic-field"><strong>Momento de Cierre / Integración:</strong> <p>${taller.momento_cierre_integracion}</p></div>
        <div class="dic-field"><strong>Revisión del Propósito:</strong> <p>${taller.revision_proposito}</p></div>
        <div class="dic-field"><strong>Tiempo de Aplicación:</strong> <p>${taller.tiempo_aplicacion}</p></div>
        ${taller.enlace_multimedia ? `<div class="dic-field"><strong>Recurso Multimedia:</strong> <a href="${taller.enlace_multimedia}" target="_blank">Ver Recurso</a></div>` : ''}
      </div>
    `;
    dicContentDisplay.innerHTML = html;
  }

  // --- INICIALIZACIÓN ---
  async function init() {
    // Actualizar encabezado
    if (headerInfo) {
      headerInfo.textContent = `CONSULTANDO CÁTEDRA ECO-PRO | GRADO: ${grado === "-1" ? "JARDÍN (-1)" : (grado === "0" ? "TRANSICIÓN (0)" : `GRADO ${grado}°`)} | PERIODO: ${periodo}°`;
    }

    // Cargar ambos datasets en paralelo para mejor rendimiento
    await Promise.all([cargarDatosDiccionario(), cargarDatosTalleres()]);

    // Renderizar diccionario por defecto
    renderizarDiccionario();

    // --- MANEJADORES DE EVENTOS ---

    // Menú de navegación
    dicMenu.addEventListener('click', (e) => {
      const target = e.target;
      if (target.classList.contains('dic-menu-item')) {
        // Remover 'active' de todos los elementos del menú
        dicMenu.querySelectorAll('.dic-menu-item').forEach(item => item.classList.remove('active'));
        // Añadir 'active' al elemento clickeado
        target.classList.add('active');

        const contentType = target.dataset.content;
        dicContentDisplay.innerHTML = '<p class="loading-message">Cargando contenido...</p>'; // Mostrar mensaje de carga
        showLoading(true);

        setTimeout(() => { // Pequeño delay para UX
          if (contentType === 'diccionario') {
            renderizarDiccionario();
          } else if (contentType.startsWith('taller-')) {
            const tallerIndex = parseInt(contentType.split('-')[1]);
            renderizarTaller(tallerIndex);
          }
          showLoading(false);
        }, 100);
      }
    });

    // Botón cerrar
    if (btnCerrar) {
      btnCerrar.onclick = () => {
        window.close();
      };
    }

    // Botón imprimir
    if (btnImprimir) {
      btnImprimir.addEventListener('click', () => {
        // Población del encabezado oculto para impresión
        const printFechaTxt = document.getElementById('print-fecha-txt-dic');
        const ahora = new Date();
        const fechaFormateada = ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString();
        if (printFechaTxt) {
            printFechaTxt.innerHTML = `<strong>ÁREA:</strong> ${areaNombre} | <strong>GRADO:</strong> ${grado === "-1" ? "JARDÍN (-1)" : (grado === "0" ? "TRANSICIÓN (0)" : `GRADO ${grado}°`)} | <strong>PERIODO:</strong> ${periodo}° <br> <strong>FECHA DE CONSULTA:</strong> ${fechaFormateada}`;
        }
        setTimeout(() => {
            window.print();
        }, 400); // Pequeña espera para asegurar que el DOM esté listo para la impresión
      });
    }

    // Botón "Volver Arriba"
    window.onscroll = () => {
      if (btnTop) btnTop.style.display = (window.scrollY > 400) ? 'block' : 'none';
    };
    if (btnTop) btnTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Iniciar el controlador
  init();

  // SEGURIDAD NACIONAL - Bloqueo de teclado y mouse
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && ['c','u','i','s','p'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      // Opcional: mostrar una notificación de "Acceso Protegido" si se desea
      // console.warn("Acceso Protegido - Contenido no copiable.");
    }
  });

});
