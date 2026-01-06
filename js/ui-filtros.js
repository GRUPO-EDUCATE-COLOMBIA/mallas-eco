// js/ui-filtros.js - v5.7 (Controlador con Carga de Tríada)

document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const btnProg = document.getElementById('btn-progresion');

  // 1. Cambio de Área: Población de grados
  areaSel.addEventListener('change', () => {
    gradoSel.innerHTML = '<option value="">Seleccionar</option>';
    window.APP_CONFIG.GRADOS.forEach(g => {
      const opt = document.createElement('option'); opt.value = g;
      opt.textContent = g === "0" ? "Transición (0)" : (g === "-1" ? "Jardín (-1)" : g + "°");
      gradoSel.appendChild(opt);
    });
    gradoSel.disabled = false;
  });

  // 2. Cambio de Grado: Población de periodos
  gradoSel.addEventListener('change', () => {
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    for (let i = 1; i <= 4; i++) {
      const opt = document.createElement('option'); opt.value = String(i); opt.textContent = `${i}° período`;
      periodoSel.appendChild(opt);
    }
    periodoSel.disabled = false;
  });

  // 3. Cambio de Período: Dispara carga del grado actual
  periodoSel.addEventListener('change', async () => {
    if (!periodoSel.value) return;
    
    window.RenderEngine.setCargando(true);
    await asegurarDatosGrado(areaSel.value, gradoSel.value);
    
    // Actualizar componentes
    const config = window.APP_CONFIG.AREAS[areaSel.value];
    const tipo = window.APP_CONFIG.TIPO_MALLA;
    const malla = window.MallasData[config.nombre][gradoSel.value][tipo];
    const items = malla.periodos[periodoSel.value] || [];
    
    compSel.innerHTML = '<option value="todos">Todos</option>';
    [...new Set(items.map(it => it.componente || it.competencia))].forEach(n => {
      if(n) { const opt = document.createElement('option'); opt.value = n; opt.textContent = n; compSel.appendChild(opt); }
    });
    
    compSel.disabled = false;
    btnProg.disabled = false; 
    window.RenderEngine.setCargando(false);
  });

  // 4. Botón Consultar: Renderizado de Malla Académica
  btnBuscar.addEventListener('click', () => {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const grado = gradoSel.value;
    const periodo = periodoSel.value;
    const tipo = window.APP_CONFIG.TIPO_MALLA;

    const malla = window.MallasData[config.nombre][grado][tipo];
    const items = malla.periodos[periodo] || [];
    const filtrados = compSel.value === "todos" ? items : items.filter(it => (it.componente || it.competencia) === compSel.value);

    window.RenderEngine.renderizar(filtrados, areaId, grado, periodo);
    
    const resPrincipal = document.getElementById('resultados-principal');
    resPrincipal.className = `resultados mostrar-block ${config.clase}`;
  });

  // 5. BOTÓN PROGRESIÓN (CORREGIDO: CARGA VECINOS)
  btnProg.addEventListener('click', async () => {
    const areaId = areaSel.value;
    const config = window.APP_CONFIG.AREAS[areaId];
    const gCentral = parseInt(gradoSel.value);
    
    window.RenderEngine.setCargando(true);

    // Definir qué grados necesitamos para la secuencia de 3
    let gradosNecesarios = [String(gCentral)];
    
    if (gCentral <= 0) {
        // Lógica de Preescolar/Puente
        gradosNecesarios.push("-1", "0", "1");
    } else {
        // Lógica Primaria/Bachillerato
        if (gCentral > 1) gradosNecesarios.push(String(gCentral - 1));
        if (gCentral < 11) gradosNecesarios.push(String(gCentral + 1));
    }

    // CARGA MASIVA EN PARALELO de los grados vecinos
    await Promise.all(gradosNecesarios.map(g => asegurarDatosGrado(areaId, g)));

    // Abrir motor de progresión
    window.ProgresionMotor.abrir(config.nombre, gradoSel.value, compSel.value);
    window.RenderEngine.setCargando(false);
  });
});
