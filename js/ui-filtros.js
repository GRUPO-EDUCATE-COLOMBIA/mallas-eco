// js/ui-filtros.js

document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const resultados = document.getElementById('resultados');

  if (!areaSel || !gradoSel || !periodoSel || !compSel || !btnBuscar || !resultados) return;

  // LISTENERS

  // Radio "Mallas a: 3 / 4 períodos"
  document.querySelectorAll('input[name="periodos"]').forEach(radio => {
    radio.addEventListener('change', updatePeriodosUI);
  });

  // Cambio de área
  areaSel.addEventListener('change', () => {
    // Por ahora solo Matemáticas; si no es Matemáticas, deshabilitar
    const isMatematicas = areaSel.value === 'matematicas';
    gradoSel.disabled = !isMatematicas;
    if (!isMatematicas) {
      gradoSel.value = '';
      periodoSel.innerHTML = '<option value="">Seleccionar</option>';
      periodoSel.disabled = true;
      compSel.innerHTML = '<option value="todos">Todos</option>';
      compSel.disabled = true;
    }
  });

  // Cambio de grado
  gradoSel.addEventListener('change', () => {
    updatePeriodosUI();
  });

  // Cambio de período
  periodoSel.addEventListener('change', () => {
    updateComponentesUI();
  });

  // Botón Consultar
  btnBuscar.addEventListener('click', () => {
    consultarMalla();
  });

  // FUNCIONES

  function obtenerMallaSeleccionada() {
    const area = areaSel.value;
    const grado = gradoSel.value;

    if (area !== 'matematicas' || !grado) return null;

    const data = window.MallasData?.matematicas?.[grado];
    return data || null;
  }

  function updatePeriodosUI() {
    const malla = obtenerMallaSeleccionada();
    const maxPeriodoJSON = malla?.numero_periodos || 4; // 3 o 4 según JSON

    const valorToggle = document.querySelector('input[name="periodos"]:checked')?.value;
    const maxPeriodoToggle = valorToggle ? Number(valorToggle) : maxPeriodoJSON;

    const max = Math.min(maxPeriodoJSON, maxPeriodoToggle);

    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    for (let i = 1; i <= max; i++) {
      periodoSel.innerHTML += `<option value="${i}">${i}</option>`;
    }

    periodoSel.disabled = !malla;
    updateComponentesUI();
  }

  function updateComponentesUI() {
    const periodo = periodoSel.value;
    compSel.innerHTML = '<option value="todos">Todos</option>';

    const malla = obtenerMallaSeleccionada();
    if (!malla || !periodo) {
      compSel.disabled = true;
      return;
    }

    const periodoData = malla.periodos?.[periodo] || [];
    const nombres = [...new Set(periodoData.map(it => it.componente))];

    nombres.forEach(nombre => {
      compSel.innerHTML += `<option value="${nombre}">${nombre}</option>`;
    });

    compSel.disabled = false;
  }

  function consultarMalla() {
    const area = areaSel.value;
    const grado = gradoSel.value;
    const periodo = periodoSel.value;
    const componente = compSel.value;

    if (!area || !grado || !periodo) {
      alert('Selecciona área, grado y período');
      return;
    }

    const malla = obtenerMallaSeleccionada();
    if (!malla) {
      alert('La malla seleccionada aún no se ha cargado.');
      return;
    }

    const periodoData = malla.periodos?.[periodo] || [];
    const items = componente === 'todos'
      ? periodoData
      : periodoData.filter(it => it.componente === componente);

    renderTablaMallas(items);
    resultados.classList.add('mostrar');
  }

  // Inicializar con estado actual (por si ya hay algo seleccionado)
  updatePeriodosUI();
});
