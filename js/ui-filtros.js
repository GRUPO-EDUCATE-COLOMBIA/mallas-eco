// js/ui-filtros.js

document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProgresion = document.getElementById('btn-progresion');
  const resNucleo = document.getElementById('resultados-nucleo');
  const resSocio = document.getElementById('resultados-socio');
  const modalError = document.getElementById('modal-error');

  const AREA_CONFIG = {
    "matematicas": { nombre: "Matemáticas", clase: "area-matematicas" },
    "lenguaje": { nombre: "Lenguaje", clase: "area-lenguaje" },
    "ciencias-sociales": { nombre: "Ciencias Sociales y Ciudadanas", clase: "area-sociales" },
    "ciencias-naturales": { nombre: "Ciencias Naturales y Ambiental", clase: "area-naturales" },
    "ingles": { nombre: "Inglés", clase: "area-ingles" },
    "proyecto-socioemocional": { nombre: "Proyecto Socioemocional", clase: "area-socioemocional" }
  };

  // Asegurar que el modal esté oculto al iniciar
  if (modalError) modalError.classList.remove('mostrar');

  // EVENTOS
  areaSel.addEventListener('change', () => {
    const config = AREA_CONFIG[areaSel.value];
    ocultarResultados();
    if (!config || !window.MallasData[config.nombre]) {
      gradoSel.disabled = true;
      limpiarSelects([gradoSel, periodoSel, compSel]);
      validarEstadoBotones();
      return;
    }
    const grados = Object.keys(window.MallasData[config.nombre]);
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    grados.sort((a,b)=>a-b).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g === "0" ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
      gradoSel.appendChild(opt);
    });
    gradoSel.disabled = false;
    limpiarSelects([periodoSel, compSel]);
    validarEstadoBotones();
  });

  gradoSel.addEventListener('change', () => {
    updatePeriodosUI();
    validarEstadoBotones();
  });

  periodoSel.addEventListener('change', () => {
    updateComponentesUI();
    validarEstadoBotones();
  });

  compSel.addEventListener('change', validarEstadoBotones);

  btnBuscar.addEventListener('click', consultarMalla);

  if (btnProgresion) {
    btnProgresion.addEventListener('click', () => {
      const area = AREA_CONFIG[areaSel.value].nombre;
      window.ProgresionMotor.abrir(area, gradoSel.value, compSel.value);
    });
  }

  // FUNCIONES
  function updatePeriodosUI() {
    const config = AREA_CONFIG[areaSel.value];
    const grado = gradoSel.value;
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const malla = window.MallasData?.[config.nombre]?.[grado]?.[tipo];
    if (!malla) return;

    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    for(let i=1; i<=malla.numero_periodos; i++) {
      const opt = document.createElement('option');
      opt.value = String(i); opt.textContent = `${i}° período`;
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

  function validarEstadoBotones() {
    if (btnProgresion) {
      btnProgresion.disabled = !(areaSel.value && gradoSel.value && compSel.value && compSel.value !== 'todos');
    }
  }

  function consultarMalla() {
    const config = AREA_CONFIG[areaSel.value];
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const malla = window.MallasData?.[config?.nombre]?.[gradoSel.value]?.[tipo];

    if (!malla || !periodoSel.value) {
      modalError.classList.add('mostrar');
      return;
    }

    const items = compSel.value === "todos" 
      ? malla.periodos[periodoSel.value] 
      : malla.periodos[periodoSel.value].filter(it => it.componente === compSel.value || it.competencia === compSel.value);

    resNucleo.className = "resultados ocultar"; 
    resSocio.className = "resultados ocultar";

    if (areaSel.value === "proyecto-socioemocional") {
      resSocio.classList.add('mostrar', config.clase);
      window.renderSocioemocional(items);
    } else {
      resNucleo.classList.add('mostrar', config.clase);
      window.renderTablaMallas(items, gradoSel.value, periodoSel.value);
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
