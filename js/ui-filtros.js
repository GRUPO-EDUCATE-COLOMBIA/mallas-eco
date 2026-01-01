// js/ui-filtros.js - VERSIÓN FINAL

document.addEventListener('DOMContentLoaded', () => {
  const areaSel = document.getElementById('area');
  const gradoSel = document.getElementById('grado');
  const periodoSel = document.getElementById('periodo');
  const compSel = document.getElementById('componente');
  const btnBuscar = document.querySelector('.btn-buscar');
  const resultadosNucleo = document.getElementById('resultados-nucleo');
  const resultadosSocio = document.getElementById('resultados-socio');
  const modalError = document.getElementById('modal-error');
  const btnModalCancelar = document.getElementById('btn-modal-cancelar');

  if (!areaSel || !gradoSel || !periodoSel || !compSel || !btnBuscar) return;

  const AREA_MAP = {
    "matematicas": "Matemáticas",
    "proyecto-socioemocional": "Proyecto Socioemocional"
  };

  // Modal
  function mostrarErrorConsulta() {
    if (modalError) modalError.classList.add('mostrar');
  }
  if (btnModalCancelar) {
    btnModalCancelar.addEventListener('click', () => {
      modalError.classList.remove('mostrar');
    });
  }

  // Event listeners
  document.querySelectorAll('input[name="periodos"]').forEach(radio => {
    radio.addEventListener('change', updatePeriodosUI);
  });
  areaSel.addEventListener('change', () => {
    limpiarFiltros();
    gradoSel.disabled = false;
  });
  gradoSel.addEventListener('change', updatePeriodosUI);
  periodoSel.addEventListener('change', updateComponentesUI);
  btnBuscar.addEventListener('click', consultarMalla);

  function getSelectedTipoMalla() {
    const r = document.querySelector('input[name="periodos"]:checked');
    return r?.value === "3" ? "3_periodos" : "4_periodos";
  }

  function getSelectedAreaNombre() {
    return AREA_MAP[areaSel.value] || null;
  }

  function obtenerMallaSeleccionada() {
    const areaNombre = getSelectedAreaNombre();
    const grado = gradoSel.value;
    const tipo_malla = getSelectedTipoMalla();
    if (!areaNombre || !grado || !tipo_malla) return null;

    return window.MallasData?.[areaNombre]?.[grado]?.[tipo_malla] || null;
  }

  function limpiarFiltros() {
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    periodoSel.disabled = true;
    compSel.innerHTML = '<option value="todos">Todos</option>';
    compSel.disabled = true;
  }

  function updatePeriodosUI() {
    const malla = obtenerMallaSeleccionada();
    if (!malla) {
      limpiarFiltros();
      return;
    }

    const max = Math.min(malla.numero_periodos || 4, 4);
    periodoSel.innerHTML = '<option value="">Seleccionar</option>';
    for (let i = 1; i <= max; i++) {
      const opt = document.createElement('option');
      opt.value = i;
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

  function ocultarResultados() {
    if (resultadosNucleo) resultadosNucleo.classList.remove('mostrar');
    if (resultadosSocio) resultadosSocio.classList.remove('mostrar');
  }

  function consultarMalla() {
    const areaNombre = getSelectedAreaNombre();
    const grado = gradoSel.value;
    const periodo = periodoSel.value;

    if (!areaNombre || !grado || !periodo) {
      mostrarErrorConsulta();
      return;
    }

    const malla = obtenerMallaSeleccionada();
    if (!malla) {
      mostrarErrorConsulta();
      ocultarResultados();
      return;
    }

    const periodoData = malla.periodos?.[periodo] || [];
    const componente = compSel.value;
    const items = componente === 'todos' 
      ? periodoData 
      : periodoData.filter(it => it.componente === componente);

    if (items.length === 0) {
      mostrarErrorConsulta();
      return;
    }

    // Renderizar según área
    if (areaNombre === "Proyecto Socioemocional" && window.renderSocioemocional) {
      window.renderSocioemocional(items);
      if (resultadosSocio) resultadosSocio.classList.add('mostrar');
      if (resultadosNucleo) resultadosNucleo.classList.remove('mostrar');
    } else if (window.renderTablaMallas) {
      window.renderTablaMallas(items);
      if (resultadosNucleo) resultadosNucleo.classList.add('mostrar');
      if (resultadosSocio) resultadosSocio.classList.remove('mostrar');
    }
  }

  limpiarFiltros();
});
