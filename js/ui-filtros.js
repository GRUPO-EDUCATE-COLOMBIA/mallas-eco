// js/ui-filtros.js

/**
 * CONTROLADOR DE INTERFAZ (UI) v4.1.1
 * Gestiona la visibilidad de resultados, validación de filtros y 
 * activación del motor de Progresión de Aprendizajes.
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
  
  // Capas de UI
  const resPrincipal = document.getElementById('resultados-principal');
  const herramientas = document.getElementById('herramientas-resultados');
  const modalError = document.getElementById('modal-error');
  const btnModalCancelar = document.getElementById('btn-modal-cancelar');

  // INICIALIZACIÓN: Limpieza absoluta al cargar
  if (modalError) modalError.classList.remove('mostrar-flex');
  if (resPrincipal) {
    resPrincipal.classList.remove('mostrar-block');
    resPrincipal.classList.add('ocultar-inicial');
  }

  // --- EVENTOS DE USUARIO ---

  // 1. Cambio de Área: Población dinámica de grados
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

    // Poblar Grados según los datos reales cargados en memoria
    const areaData = window.MallasData[config.nombre];
    const gradosDisponibles = Object.keys(areaData);
    
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    // Ordenamiento numérico inteligente (maneja -1 y 0)
    gradosDisponibles.sort((a, b) => parseInt(a) - parseInt(b)).forEach(g => {
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

  // 2. Cambio de Grado: Actualiza períodos
  gradoSel.addEventListener('change', () => {
    updatePeriodosUI();
    validarBotones();
  });

  // 3. Cambio de Período: Actualiza componentes/competencias
  periodoSel.addEventListener('change', () => {
    updateComponentesUI();
    validarBotones();
  });

  // 4. Cambio de Componente: Valida si se puede ver progresión
  compSel.addEventListener('change', validarBotones);

  // 5. Botón Consultar: Ejecuta el Render Engine
  btnBuscar.addEventListener('click', () => {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const tipo = obtenerTipoMalla();
    const periodo = periodoSel.value;
    const grado = gradoSel.value;

    const malla = window.MallasData?.[config?.nombre]?.[grado]?.[tipo];

    if (!malla || !periodo) {
      if (modalError) modalError.classList.add('mostrar-flex');
      return;
    }

    // Activar spinner visual
    window.RenderEngine.setCargando(true);

    setTimeout(() => {
      const todosLosItems = malla.periodos[periodo] || [];
      const itemsFiltrados = compSel.value === "todos" 
        ? todosLosItems 
        : todosLosItems.filter(it => (it.componente === compSel.value || it.competencia === compSel.value));

      // Inyectar datos en el motor visual
      window.RenderEngine.renderizar(itemsFiltrados, areaId, grado, periodo);
      window.RenderEngine.setCargando(false);
      
      // Aplicar identidad visual del área
      resPrincipal.className = `resultados mostrar-block ${config.clase}`;
    }, 400); 
  });

  // 6. Botón Progresión Aprendizajes (Alineación Vertical)
  if (btnProgresion) {
    btnProgresion.addEventListener('click', () => {
      const areaId = areaSel.value;
      const config = window.APP_CONFIG.AREAS[areaId];
      
      // Enviamos el nombre formal (ej: "Matemáticas") para el match en memoria
      window.ProgresionMotor.abrir(config.nombre, gradoSel.value, compSel.value);
    });
  }

  // --- FUNCIONES DE SOPORTE ---

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
    
    // Obtener lista única de componentes o competencias
    const nombres = [...new Set(items.map(it => it.componente || it.competencia))];
    nombres.sort().forEach(n => {
      if(n) {
        const opt = document.createElement('option');
        opt.value = n; opt.textContent = n;
        compSel.appendChild(opt);
      }
    });
    compSel.disabled = false;
  }

  function obtenerTipoMalla() {
    const radio = document.querySelector('input[name="periodos"]:checked');
    return radio && radio.value === "3" ? "3_periodos" : "4_periodos";
  }

  function validarBotones() {
    if (btnProgresion) {
      // Regla: Solo habilitar si hay área, grado y un componente específico (no "todos")
      const listo = areaSel.value && gradoSel.value && compSel.value && compSel.value !== 'todos';
      btnProgresion.disabled = !listo;
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

  // Control del Modal de Error
  if (btnModalCancelar) {
    btnModalCancelar.addEventListener('click', () => {
      modalError.classList.remove('mostrar-flex');
    });
  }
});
