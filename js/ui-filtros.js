// js/ui-filtros.js - v5.2 (Restaurada)

document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProgresion = document.getElementById('btn-progresion');

  areaSel.addEventListener('change', () => {
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    window.APP_CONFIG.GRADOS.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g === "0" ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
      gradoSel.appendChild(opt);
    });
    gradoSel.disabled = false;
  });

  gradoSel.addEventListener('change', () => {
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    const num = obtenerTipoMalla() === "3_periodos" ? 3 : 4;
    for (let i = 1; i <= num; i++) {
      const opt = document.createElement('option');
      opt.value = String(i); opt.textContent = `${i}° período`;
      periodoSel.appendChild(opt);
    }
    periodoSel.disabled = false;
  });

  periodoSel.addEventListener('change', async () => {
    window.RenderEngine.setCargando(true);
    await asegurarDatosGrado(areaSel.value, gradoSel.value);
    updateComponentesUI();
    window.RenderEngine.setCargando(false);
  });

  btnBuscar.addEventListener('click', async () => {
    window.RenderEngine.setCargando(true);
    await asegurarDatosGrado(areaSel.value, gradoSel.value);
    const config = window.APP_CONFIG.AREAS[areaSel.value];
    const malla = window.MallasData[config.nombre][gradoSel.value][obtenerTipoMalla()];
    const items = malla.periodos[periodoSel.value] || [];
    const filtrados = compSel.value === "todos" ? items : items.filter(it => it.componente === compSel.value);
    
    window.RenderEngine.renderizar(filtrados, areaSel.value, gradoSel.value, periodoSel.value);
    document.getElementById('resultados-principal').className = `resultados mostrar-block ${config.clase}`;
    window.RenderEngine.setCargando(false);
  });

  if (btnProgresion) {
    btnProgresion.onclick = async () => {
      window.RenderEngine.setCargando(true);
      const config = window.APP_CONFIG.AREAS[areaSel.value];
      const g = parseInt(gradoSel.value);
      await Promise.all([String(g-1), String(g), String(g+1)].map(gr => asegurarDatosGrado(areaSel.value, gr)));
      window.ProgresionMotor.abrir(config.nombre, gradoSel.value, compSel.value);
      window.RenderEngine.setCargando(false);
    };
  }

  function updateComponentesUI() {
    const config = window.APP_CONFIG.AREAS[areaSel.value];
    const malla = window.MallasData[config.nombre][gradoSel.value][obtenerTipoMalla()];
    const items = malla.periodos[periodoSel.value] || [];
    compSel.innerHTML = '<option value="todos">Todos</option>';
    [...new Set(items.map(it => it.componente))].forEach(n => {
      if(n) { const opt = document.createElement('option'); opt.value = n; opt.textContent = n; compSel.appendChild(opt); }
    });
    compSel.disabled = false;
  }

  function obtenerTipoMalla() { return document.querySelector('input[name="periodos"]:checked').value === "3" ? "3_periodos" : "4_periodos"; }
});
