// js/ui-filtros.js

/**
 * CONTROLADOR DE INTERFAZ (UI) - Versión Sincronizada
 * Conecta los filtros con el motor de renderizado unificado y gestiona el UX.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Selectores
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  
  // Botones
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProgresion = document.getElementById('btn-progresion');
  const modalError = document.getElementById('modal-error');

  // Inicialización de estado
  if (modalError) modalError.classList.remove('mostrar');

  // --- EVENTOS DE USUARIO ---

  // 1. Cambio de Área: Población de grados y reset de filtros hijos
  areaSel.addEventListener('change', () => {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    
    resetResultadosUI();

    if (!config || !window.MallasData[config.nombre]) {
      gradoSel.disabled = true;
      limpiarSelects([gradoSel, periodoSel, compSel]);
      validarBotones();
      return;
    }

    // Cargar solo los grados que realmente existen en el JSON cargado
    const gradosCargados = Object.keys(window.MallasData[config.nombre]);
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    
    gradosCargados.sort((a, b) => a - b).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = (g === "0") ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
      gradoSel.appendChild(opt);
    });

    gradoSel.disabled = false;
    limpiarSelects([periodoSel, compSel]);
    validarBotones();
  });

  // 2. Cambio de Grado: Actualiza los períodos disponibles
  gradoSel.addEventListener('change', () => {
    updatePeriodosUI();
    validarBotones();
  });

  // 3. Cambio de Período: Actualiza los componentes temáticos
  periodoSel.addEventListener('change', () => {
    updateComponentesUI();
    validarBotones();
  });

  // 4. Cambio de Componente: Validación final de botones
  compSel.addEventListener('change', validarBotones);

  // 5. Botón Consultar: Dispara el renderizado con spinner
  btnBuscar.addEventListener('click', () => {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const periodo = periodoSel.value;
    const grado = gradoSel.value;

    const malla = window.MallasData?.[config?.nombre]?.[grado]?.[tipo];

    if (!malla || !periodo) {
      modalError.classList.add('mostrar');
      return;
    }

    // --- MEJORA: FLUJO DE CARGA (SPINNER) ---
    window.RenderEngine.setCargando(true);

    // Simulamos un breve tiempo de procesamiento para suavizar la UX
    setTimeout(() => {
      const todosLosItems = malla.periodos[periodo] || [];
      const itemsFiltrados = compSel.value === "todos" 
        ? todosLosItems 
        : todosLosItems.filter(it => (it.componente === compSel.value || it.competencia === compSel.value));

      // Llamada al motor unificado
      window.RenderEngine.renderizar(itemsFiltrados, areaId, grado, periodo);
      window.RenderEngine.setCargando(false);
      
      // Aplicamos la clase de color al contenedor de resultados
      document.getElementById('resultados-principal').className = `resultados mostrar ${config.clase}`;
    }, 400); 
  });

  // 6. Botón Progresión (Alineación Vertical)
  if (btnProgresion) {
    btnProgresion.addEventListener('click', () => {
      const config = window.APP_CONFIG.AREAS[areaSel.value];
      window.ProgresionMotor.abrir(config.nombre, gradoSel.value, compSel.value);
    });
  }

  // --- LÓGICA DE APOYO ---

  function updatePeriodosUI() {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
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
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const periodo = periodoSel.value;
    const malla = window.MallasData?.[config.nombre]?.[gradoSel.value]?.[tipo];
    
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

  function validarBotones() {
    if (btnProgresion) {
      // Activo solo si: Área + Grado + Componente específico (no "todos")
      btnProgresion.disabled = !(areaSel.value && gradoSel.value && compSel.value && compSel.value !== 'todos');
    }
  }

  function resetResultadosUI() {
    document.getElementById('resultados-principal').classList.add('ocultar');
    document.getElementById('herramientas-resultados').classList.add('herramientas-ocultas');
    document.getElementById('input-busqueda').value = '';
  }

  function limpiarSelects(selects) {
    selects.forEach(s => {
      s.innerHTML = s.id === "componente" ? '<option value="todos">Todos</option>' : '<option value="">Seleccionar</option>';
      s.disabled = true;
    });
  }

  // Cerrar Modal
  const btnCerrarModal = document.getElementById('btn-modal-cancelar');
  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', () => modalError.classList.remove('mostrar'));
  }
});
