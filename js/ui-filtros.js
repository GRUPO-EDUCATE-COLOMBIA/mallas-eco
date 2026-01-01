// js/ui-filtros.js

document.addEventListener('DOMContentLoaded', () => {
  // Captura de elementos del DOM
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProgresion = document.getElementById('btn-progresion'); // Nuevo botón del reto
  
  const resNucleo = document.getElementById('resultados-nucleo');
  const resSocio = document.getElementById('resultados-socio');
  const modalError = document.getElementById('modal-error');

  // Mapeo detallado para vincular HTML -> JSON -> CSS
  const AREA_CONFIG = {
    "matematicas": { nombre: "Matemáticas", clase: "area-matematicas" },
    "lenguaje": { nombre: "Lenguaje", clase: "area-lenguaje" },
    "ciencias-sociales": { nombre: "Ciencias Sociales y Ciudadanas", clase: "area-sociales" },
    "ciencias-naturales": { nombre: "Ciencias Naturales y Ambiental", clase: "area-naturales" },
    "ingles": { nombre: "Inglés", clase: "area-ingles" },
    "proyecto-socioemocional": { nombre: "Proyecto Socioemocional", clase: "area-socioemocional" }
  };

  // Bloqueo de menú contextual en resultados
  [resNucleo, resSocio].forEach(contenedor => {
    contenedor.addEventListener('contextmenu', e => e.preventDefault());
  });

  // --- ESCUCHADORES DE EVENTOS ---

  // Cambio de Área
  areaSel.addEventListener('change', () => {
    const config = AREA_CONFIG[areaSel.value];
    ocultarResultados();
    
    if (!config || !window.MallasData[config.nombre]) {
      gradoSel.disabled = true;
      limpiarSelects([gradoSel, periodoSel, compSel]);
      validarEstadoBotones();
      return;
    }

    const gradosDisponibles = Object.keys(window.MallasData[config.nombre]);
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    gradosDisponibles.sort((a, b) => a - b).forEach(grado => {
      const opt = document.createElement('option');
      opt.value = grado;
      if (grado === "0") opt.textContent = "Transición (0)";
      else if (grado === "-1") opt.textContent = "Jardín (-1)";
      else opt.textContent = grado + "°";
      gradoSel.appendChild(opt);
    });

    gradoSel.disabled = false;
    periodoSel.disabled = true;
    compSel.disabled = true;
    validarEstadoBotones();
  });

  // Cambio de Grado
  gradoSel.addEventListener('change', () => {
    updatePeriodosUI();
    validarEstadoBotones();
  });

  // Cambio de Período
  periodoSel.addEventListener('change', () => {
    updateComponentesUI();
    validarEstadoBotones();
  });

  // Cambio de Componente
  compSel.addEventListener('change', () => {
    validarEstadoBotones();
  });

  // Botón Consultar Malla (Vertical)
  btnBuscar.addEventListener('click', () => {
    consultarMalla();
  });

  // Botón Progresión (Reto Alineación Vertical)
  if (btnProgresion) {
    btnProgresion.addEventListener('click', () => {
      const areaNombre = AREA_CONFIG[areaSel.value].nombre;
      const grado = gradoSel.value;
      const componente = compSel.value;
      // Llamamos al motor de progresión
      window.ProgresionMotor.abrir(areaNombre, grado, componente);
    });
  }

  // --- LÓGICA DE INTERFAZ ---

  function updatePeriodosUI() {
    const config = AREA_CONFIG[areaSel.value];
    const grado = gradoSel.value;
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const malla = window.MallasData?.[config.nombre]?.[grado]?.[tipo];
    
    if (!malla) {
      limpiarSelects([periodoSel, compSel]);
      return;
    }

    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    for (let i = 1; i <= malla.numero_periodos; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `${i}° período`;
      periodoSel.appendChild(opt);
    }
    periodoSel.disabled = false;
    compSel.disabled = true;
  }

  function updateComponentesUI() {
    const config = AREA_CONFIG[areaSel.value];
    const grado = gradoSel.value;
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const periodo = periodoSel.value;
    const malla = window.MallasData?.[config.nombre]?.[grado]?.[tipo];
    const items = malla?.periodos?.[periodo] || [];

    compSel.innerHTML = '<option value="todos">Todos</option>';
    const nombres = [...new Set(items.map(it => it.componente || it.competencia))];
    
    nombres.sort().forEach(n => {
      const opt = document.createElement('option');
      opt.value = n; opt.textContent = n;
      compSel.appendChild(opt);
    });
    compSel.disabled = false;
  }

  /**
   * Determina si el botón de progresión debe estar activo.
   * Se activa solo si hay Área, Grado y un Componente específico (no "todos").
   */
  function validarEstadoBotones() {
    const area = areaSel.value;
    const grado = gradoSel.value;
    const componente = compSel.value;

    if (btnProgresion) {
      // El reto exige restringirlo a un componente a la vez para facilitar la lectura
      const esValido = area && grado && componente && componente !== 'todos';
      btnProgresion.disabled = !esValido;
    }
  }

  function consultarMalla() {
    const areaVal = areaSel.value;
    const config = AREA_CONFIG[areaVal];
    const grado = gradoSel.value;
    const periodo = periodoSel.value;
    const componente = compSel.value;
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";

    const malla = window.MallasData?.[config?.nombre]?.[grado]?.[tipo];
    if (!malla || !periodo) {
      if (modalError) modalError.classList.add('mostrar');
      return;
    }

    const items = componente === "todos" 
      ? malla.periodos[periodo] 
      : malla.periodos[periodo].filter(it => (it.componente === componente || it.competencia === componente));

    ocultarResultados();
    resNucleo.className = "resultados ocultar"; 
    resSocio.className = "resultados ocultar";

    if (areaVal === "proyecto-socioemocional") {
      resSocio.classList.add('mostrar', config.clase);
      window.renderSocioemocional(items);
    } else {
      resNucleo.classList.add('mostrar', config.clase);
      window.renderTablaMallas(items, grado, periodo);
    }
  }

  function ocultarResultados() {
    resNucleo.classList.remove('mostrar');
    resSocio.classList.remove('mostrar');
  }

  function limpiarSelects(selects) {
    selects.forEach(s => {
      s.innerHTML = s.id === "componente" ? '<option value="todos">Todos</option>' : '<option value="">Seleccionar</option>';
      s.disabled = true;
    });
  }

  document.getElementById('btn-modal-cancelar').addEventListener('click', () => {
    modalError.classList.remove('mostrar');
  });
});
