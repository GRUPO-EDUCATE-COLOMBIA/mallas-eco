// js/ui-filtros.js - FIX TOTAL

document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');

  // 1. Cambio de Área
  areaSel.addEventListener('change', () => {
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    window.APP_CONFIG.GRADOS.forEach(g => {
      const opt = document.createElement('option'); opt.value = g;
      opt.textContent = g === "0" ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
      gradoSel.appendChild(opt);
    });
    gradoSel.disabled = false;
  });

  // 2. Cambio de Grado
  gradoSel.addEventListener('change', () => {
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    for (let i = 1; i <= 4; i++) {
      const opt = document.createElement('option'); opt.value = String(i); opt.textContent = `${i}° período`;
      periodoSel.appendChild(opt);
    }
    periodoSel.disabled = false;
  });

  // 3. Cambio de Período
  periodoSel.addEventListener('change', async () => {
    window.RenderEngine.setCargando(true);
    await asegurarDatosGrado(areaSel.value, gradoSel.value);
    updateComponentesUI();
    window.RenderEngine.setCargando(false);
  });

  // 4. BOTÓN CONSULTAR (CORREGIDO)
  btnBuscar.addEventListener('click', async () => {
    window.RenderEngine.setCargando(true);
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    
    await asegurarDatosGrado(areaId, gradoSel.value);
    
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const malla = window.MallasData[config.nombre][gradoSel.value][tipo];
    const items = malla.periodos[periodoSel.value] || [];
    
    const filtrados = compSel.value === "todos" ? items : items.filter(it => (it.componente || it.competencia) === compSel.value);
    
    // Inyectar Resultados
    window.RenderEngine.renderizar(filtrados, areaId, gradoSel.value, periodoSel.value);
    
    // CORRECCIÓN CRÍTICA: Aplicar clase de color al contenedor
    const resPrincipal = document.getElementById('resultados-principal');
    resPrincipal.className = `resultados mostrar-block ${config.clase}`;
    
    window.RenderEngine.setCargando(false);
  });

  function updateComponentesUI() {
    const config = window.APP_CONFIG.AREAS[areaSel.value];
    const tipo = document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos";
    const malla = window.MallasData[config.nombre][gradoSel.value][tipo];
    const items = malla.periodos[periodoSel.value] || [];
    compSel.innerHTML = '<option value="todos">Todos</option>';
    [...new Set(items.map(it => it.componente || it.competencia))].forEach(n => {
      if(n) { const opt = document.createElement('option'); opt.value = n; opt.textContent = n; compSel.appendChild(opt); }
    });
    compSel.disabled = false;
  }
});
