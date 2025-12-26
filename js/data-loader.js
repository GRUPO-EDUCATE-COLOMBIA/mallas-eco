// js/data-loader.js

// Estructura global de datos
window.MallasData = {
  matematicas: {}
};

// Carga una malla de Matemáticas por grado (1 a 5, por ahora)
function cargarMallaMatematicas(grado) {
  return fetch(`data/matematicas_${grado}.json`)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(json => {
      window.MallasData.matematicas[grado] = json;
      console.log(`Malla Matemáticas ${grado}° cargada (tipo: ${json.tipo_malla}, períodos: ${json.numero_periodos})`);
    })
    .catch(err => {
      console.error(`Error cargando matematicas_${grado}.json`, err);
    });
}

// Cargar grados 1° a 5°
Promise.all([1, 2, 3, 4, 5].map(g => cargarMallaMatematicas(g)))
  .then(() => {
    console.log('Mallas de Matemáticas 1°–5° cargadas');
  });
