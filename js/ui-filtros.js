// js/ui-filtros.js

/**
 * CONTROLADOR DE INTERFAZ (UI) v4.1
 * Gestiona la visibilidad blindada de resultados, modales y overlays.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Elementos de Entrada
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  
  // Botones
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProgresion = document.getElementById('btn-progresion');
  
  // Capas de UI (IDs sincronizados con index.html v4.0)
  const resPrincipal = document.getElementById('resultados-principal');
  const herramientas = document.getElementById('herramientas-resultados');
  const modalError = document.getElementById('modal-error');
  const btnModalCancelar = document.getElementById('btn-modal-cancelar');

  // INICIALIZACIÓN: Asegurar limpieza absoluta al cargar
  if (modalError) modalError.classList.remove('mostrar-flex');
  if (resPrincipal) {
    resPrincipal.classList.remove('mostrar-block');
    resPrincipal.classList.add('ocultar-inicial');
  }

  // --- EVENTOS DE USUARIO ---

  // 1. Cambio de Área: Población dinámica y limpieza
  areaSel.addEventListener('change', () => {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    
    resetInterfaz();

    if (!config || !window.MallasData[config.nombre]) {
      gradoSel.disabled = true;
      limpiarSelects([gradoSel, periodoSel, compSel]);
      validarBotones();
      return;
    }

    // Poblar Grados según memoria
    const areaData = window.MallasData[config.nombre];
    const gradosDisponibles = Object.keys(areaData);
    
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    gradosDisponibles.sort((a, b) => a - b).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      if (g === "0") opt.textContent = "Transición (0)";
      else if (g === "-1") opt.textContent = "Jardín (-1)";
      else opt.textContent = g + "°";
      gradoSel.appendChild(opt);
    });

    gradoSel.disabled = false;
    limpiarSelects([periodoSel, compSel]);
    validarBotones();
  });

  // 2. Cambio de Grado
  gradoSel.addEventListener('change', () => {
    updatePeriodosUI();
    validarBotones();
  });

  // 3. Cambio de Período
  periodoSel.addEventListener('change', () => {
    updateComponentesUI();
    validarBotones();
  });

  // 4. Cambio de Componente
  compSel.addEventListener('change', validarBotones);

  // 5. Botón Consultar: Acción con Spinner
  btnBuscar.addEventListener('click', () => {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const tipo = obtenerTipoMalla();
    const periodo = periodoSel.value;
    const grado = gradoSel.value;

    const malla = window.MallasData?.[config?.nombre]?.[grado]?.[tipo];

    if (!malla || !periodo) {
      // Activar modal de error con clase blindada
      if (modalError) modalError.classList.add('mostrar-flex');
      return;
    }

    // Activar flujo de carga visual
    window.RenderEngine.setCargando(true);

    setTimeout(() => {
      const todosLosItems = malla.periodos[periodo] || [];
      const itemsFiltrados = compSel.value === "todos" 
        ? todosLosItems 
        : todosLosItems.filter(it => (it.componente === compSel.value || it.competencia === compSel.value));

      // Llamada al motor unificado
      window.RenderEngine.renderizar(itemsFiltrados, areaId, grado, periodo);
      window.RenderEngine.setCargando(false);
      
      // Aplicar color dinámico y mostrar bloque
      resPrincipal.className = `resultados mostrar-block ${config.clase}`;
    }, 400); 
  });

  // 6. Botón Progresión: Alineación Vertical
  if (btnProgresion) {
    btnProgresion.addEventListener('click', () => {
      const config = window.APP_CONFIG.AREAS[areaSel.value];
      window.ProgresionMotor.abrir(config.nombre, gradoSel.value, compSel.value);
    });
  }

  // --- LÓGICA DE ACTUALIZACIÓN ---

  function updatePeriodosUI() {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const tipo = obtenerTipoMalla();
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
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const tipo = obtenerTipoMalla();
    const malla = window.MallasData?.[config.nombre]?.[gradoSel.value]?.[tipo];
    
    const items = malla?.periodos?.[periodoSel.value] || [];
    compSel.innerHTML = '<option value="todos">Todos</option>';
    
    const nombres = [...new Set(items.map(it => it.componente || it.competencia))];
    nombres.sort().forEach(n => {
      const opt = document.createElement('option');
      opt.value = n; opt.textContent = n;
      compSel.appendChild(opt);
    });
    compSel.disabled = false;
  }

  // --- UTILIDADES ---

  function obtenerTipoMalla() {
    const radio = document.querySelector('input[name="periodos"]:checked');
    return radio && radio.value === "3" ? "3_periodos" : "4_periodos";
  }

  function validarBotones() {
    if (btnProgresion) {
      btnProgresion.disabled = !(areaSel.value && gradoSel.value && compSel.value && compSel.value !== 'todos');
    }
  }

  function resetInterfaz() {
    if (resPrincipal) {
      resPrincipal.classList.remove('mostrar-block');
      resPrincipal.classList.add('ocultar-inicial');
    }
    if (herramientas) herramientas.classList.add('ocultar-inicial');
  }

  function limpiarSelects(selects) {
    selects.forEach(s => {
      s.innerHTML = s.id === "componente" ? '<option value="todos">Todos</option>' : '<option value="">Seleccionar</option>';
      s.disabled = true;
    });
  }

  // Cerrar Modal
  if (btnModalCancelar) {
    btnModalCancelar.addEventListener('click', () => {
      modalError.classList.remove('mostrar-flex');
    });
  }
});
