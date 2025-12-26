// js/ui-filtros.js

document.addEventListener('DOMContentLoaded', () => {
  const modalError = document.getElementById('modal-error');
const btnModalCancelar = document.getElementById('btn-modal-cancelar');

function mostrarErrorConsulta() {
  if (!modalError) return;
  modalError.classList.add('mostrar');
}

if (btnModalCancelar && modalError) {
  btnModalCancelar.addEventListener('click', () => {
    modalError.classList.remove('mostrar');
  });
}
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const resultados = document.getElementById('resultados');

  if (!areaSel || !gradoSel || !periodoSel || !compSel || !btnBuscar || !resultados) return;

  // Mapeo de value HTML -> nombre de área en los JSON
  const AREA_MAP = {
    "matematicas": "Matemáticas",
    "lenguaje": "Lenguaje",
    "ciencias-sociales": "Ciencias Sociales y Ciudadanas",
    "ciencias-naturales": "Ciencias Naturales y Ambiental",
    "ingles": "Inglés",
    "proyecto-socioemocional": "Proyecto Socioemocional"
  };

  // LISTENERS
  document.querySelectorAll('input[name="periodos"]').forEach(radio => {
    radio.addEventListener('change', updatePeriodosUI);
  });

  areaSel.addEventListener('change', () => {
    limpiarPeriodosYComponentes();
    // Habilitar grados siempre; los datos podrán existir o no
    gradoSel.disabled = false;
  });

  gradoSel.addEventListener('change', () => {
    updatePeriodosUI();
  });

  periodoSel.addEventListener('change', () => {
    updateComponentesUI();
  });

  btnBuscar.addEventListener('click', () => {
    consultarMalla();
  });

  // FUNCIONES

  function getSelectedTipoMalla() {
    const r = document.querySelector('input[name="periodos"]:checked');
    if (!r) return null;
    return r.value === "3" ? "3_periodos" : "4_periodos";
  }

  function getSelectedAreaNombre() {
    const val = areaSel.value;
    return AREA_MAP[val] || null;
  }

  function obtenerMallaSeleccionada() {
    const areaNombre = getSelectedAreaNombre();
    const grado = gradoSel.value;
    const tipo_malla = getSelectedTipoMalla();
    if (!areaNombre || !grado || !tipo_malla) return null;

    const areaData = window.MallasData?.[areaNombre];
    if (!areaData) return null;

    const gradoData = areaData[grado];
    if (!gradoData) return null;

    const malla = gradoData[tipo_malla];
    return malla || null;
  }

  function limpiarPeriodosYComponentes() {
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    periodoSel.disabled = true;

    compSel.innerHTML = '<option value="todos">Todos</option>';
    compSel.disabled = true;
  }

  function updatePeriodosUI() {
    const malla = obtenerMallaSeleccionada();
    if (!malla) {
      limpiarPeriodosYComponentes();
      return;
    }

    const maxPeriodoJSON = malla.numero_periodos || 4;
    const tipo_malla = malla.tipo_malla || getSelectedTipoMalla();
    const maxPeriodoToggle = tipo_malla === "3_periodos" ? 3 : 4;
    const max = Math.min(maxPeriodoJSON, maxPeriodoToggle);

    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    for (let i = 1; i <= max; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `${i}° período`;
      periodoSel.appendChild(opt);
    }

    periodoSel.disabled = false;
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
      const opt = document.createElement('option');
      opt.value = nombre;
      opt.textContent = nombre;
      compSel.appendChild(opt);
    });

    compSel.disabled = false;
  }

  function consultarMalla() {
    const areaNombre = getSelectedAreaNombre();
    const grado = gradoSel.value;
    const periodo = periodoSel.value;
    const componente = compSel.value;

    if (!areaNombre || !grado || !periodo) {
    if (!areaNombre || !grado || !periodo) {
  mostrarErrorConsulta();
  return;
}

const malla = obtenerMallaSeleccionada();
if (!malla) {
  mostrarErrorConsulta();
  limpiarPeriodosYComponentes();
  resultados.classList.remove('mostrar');
  document.getElementById('tabla-body').innerHTML = '';
  return;
}
      return;
    }

    const malla = obtenerMallaSeleccionada();
    if (!malla) {
     if (!areaNombre || !grado || !periodo) {
         mostrarErrorConsulta();
     return;
      }
      const malla = obtenerMallaSeleccionada();
     if (!malla) {
         mostrarErrorConsulta();
         limpiarPeriodosYComponentes();
         resultados.classList.remove('mostrar');
         document.getElementById('tabla-body').innerHTML = '';
      return;
      }
      limpiarPeriodosYComponentes();
      resultados.classList.remove('mostrar');
      document.getElementById('tabla-body').innerHTML = '';
      return;
    }

    const periodoData = malla.periodos?.[periodo] || [];
    const items = componente === 'todos'
      ? periodoData
      : periodoData.filter(it => it.componente === componente);

    renderTablaMallas(items);
    resultados.classList.add('mostrar');
  }

  // Inicial
  limpiarPeriodosYComponentes();
});

