// js/ui-filtros.js

/**
 * CONTROLADOR DE INTERFAZ (UI)
 * Gestiona eventos de usuario y comunica los filtros con los motores de renderizado.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Elementos de entrada
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  
  // Botones
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProgresion = document.getElementById('btn-progresion');
  
  // Capas de visualización
  const resNucleo = document.getElementById('resultados-nucleo');
  const resSocio = document.getElementById('resultados-socio');
  const modalError = document.getElementById('modal-error');

  // Inicialización: Asegurar estado limpio
  if (modalError) modalError.classList.remove('mostrar');
  ocultarResultadosUI();

  // --- ESCUCHADORES DE EVENTOS ---

  // 1. Cambio de Área
  areaSel.addEventListener('change', () => {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    
    ocultarResultadosUI();

    if (!config || !window.MallasData[config.nombre]) {
      gradoSel.disabled = true;
      limpiarSelects([gradoSel, periodoSel, compSel]);
      validarEstadoBotones();
      return;
    }

    // Poblar Grados dinámicamente según lo cargado en memoria
    const gradosCargados = Object.keys(window.MallasData[config.nombre]);
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    
    gradosCargados.sort((a, b) => a - b).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      // Formateo visual del grado
      if (g === "0") opt.textContent = "Transición (0)";
      else if (g === "-1") opt.textContent = "Jardín (-1)";
      else opt.textContent = g + "°";
      gradoSel.appendChild(opt);
    });

    gradoSel.disabled = false;
    limpiarSelects([periodoSel, compSel]);
    validarEstadoBotones();
  });

  // 2. Cambio de Grado
  gradoSel.addEventListener('change', () => {
    updatePeriodosUI();
    validarEstadoBotones();
  });

  // 3. Cambio de Período
  periodoSel.addEventListener('change', () => {
    updateComponentesUI();
    validarEstadoBotones();
  });

  // 4. Cambio de Componente
  compSel.addEventListener('change', validarEstadoBotones);

  // 5. Botón Consultar Malla
  btnBuscar.addEventListener('click', ejecutarConsultaMalla);

  // 6. Botón Progresión (Alineación Vertical)
  if (btnProgresion) {
    btnProgresion.addEventListener('click', () => {
      const config = window.APP_CONFIG.AREAS[areaSel.value];
      window.ProgresionMotor.abrir(config.nombre, gradoSel.value, compSel.value);
    });
  }

  // --- LÓGICA DE ACTUALIZACIÓN DE SELECTORES ---

  function updatePeriodosUI() {
    const config = window.APP_CONFIG.AREAS[areaSel.value];
    const tipo = obtenerTipoMallaSeleccionado();
    const malla = window.MallasData?.[config.nombre]?.[gradoSel.value]?.[tipo];
    
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
    const config = window.APP_CONFIG.AREAS[areaSel.value];
    const tipo = obtenerTipoMallaSeleccionado();
    const periodo = periodoSel.value;
    const malla = window.MallasData?.[config.nombre]?.[gradoSel.value]?.[tipo];
    
    const items = malla?.periodos?.[periodo] || [];
    compSel.innerHTML = '<option value="todos">Todos</option>';
    
    // Extraer componentes únicos (o competencias en caso de Socioemocional)
    const nombres = [...new Set(items.map(it => it.componente || it.competencia))];
    
    nombres.sort().forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n;
      compSel.appendChild(opt);
    });
    compSel.disabled = false;
  }

  // --- FUNCIONES DE ACCIÓN ---

  function ejecutarConsultaMalla() {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const tipo = obtenerTipoMallaSeleccionado();
    const malla = window.MallasData?.[config?.nombre]?.[gradoSel.value]?.[tipo];

    if (!malla || !periodoSel.value) {
      if (modalError) modalError.classList.add('mostrar');
      return;
    }

    // Filtrado de ítems
    const items = compSel.value === "todos" 
      ? malla.periodos[periodoSel.value] 
      : malla.periodos[periodoSel.value].filter(it => 
          (it.componente === compSel.value || it.competencia === compSel.value)
        );

    ocultarResultadosUI();

    // Resetear clases de color y mostrar el contenedor correcto
    resNucleo.className = "resultados ocultar"; 
    resSocio.className = "resultados ocultar";

    if (areaId === "proyecto-socioemocional") {
      resSocio.classList.add('mostrar', config.clase);
      if (window.renderSocioemocional) window.renderSocioemocional(items);
    } else {
      resNucleo.classList.add('mostrar', config.clase);
      if (window.renderTablaMallas) window.renderTablaMallas(items, gradoSel.value, periodoSel.value);
    }
  }

  // --- UTILIDADES ---

  function obtenerTipoMallaSeleccionado() {
    const radio = document.querySelector('input[name="periodos"]:checked');
    return radio && radio.value === "3" ? "3_periodos" : "4_periodos";
  }

  function validarEstadoBotones() {
    if (btnProgresion) {
      // Activo solo si: Área + Grado + Componente específico (no "todos")
      const esValido = areaSel.value && gradoSel.value && compSel.value && compSel.value !== 'todos';
      btnProgresion.disabled = !esValido;
    }
  }

  function ocultarResultadosUI() {
    resNucleo.classList.remove('mostrar');
    resSocio.classList.remove('mostrar');
  }

  function limpiarSelects(selects) {
    selects.forEach(s => {
      s.innerHTML = s.id === "componente" ? '<option value="todos">Todos</option>' : '<option value="">Seleccionar</option>';
      s.disabled = true;
    });
  }

  // Cerrar Modal
  if (document.getElementById('btn-modal-cancelar')) {
    document.getElementById('btn-modal-cancelar').addEventListener('click', () => {
      modalError.classList.remove('mostrar');
    });
  }
});
