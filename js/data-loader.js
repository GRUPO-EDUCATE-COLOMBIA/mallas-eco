// js/data-loader.js

// Objeto global donde se centralizará toda la información de las mallas
window.MallasData = {};

/**
 * Asegura que la estructura de objetos exista para evitar errores de 'undefined'
 */
function ensureAreaGradeTipo(area, grado, tipo) {
  if (!window.MallasData[area]) window.MallasData[area] = {};
  if (!window.MallasData[area][grado]) window.MallasData[area][grado] = {};
  if (!window.MallasData[area][grado][tipo]) window.MallasData[area][grado][tipo] = null;
}

/**
 * Carga los archivos JSON de Matemáticas
 * CORRECCIÓN: Se ajustó el inicio del ciclo a 0 para incluir Transición.
 */
function cargarMatematicas4Periodos() {
  const areaNombre = "Matemáticas";
  const tipo_malla = "4_periodos";
  const promesas = [];

  // CAMBIO CLAVE: Empezamos en 0 para cargar matematicas_0_4_periodos.json
  for (let grado = 0; grado <= 11; grado++) {
    const gradoStr = String(grado);
    const fileName = `data/matematicas/matematicas_${gradoStr}_4_periodos.json`;

    const p = fetch(fileName)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        // Blindaje: Usamos gradoStr (nombre archivo) para asegurar la posición correcta
        ensureAreaGradeTipo(areaNombre, gradoStr, tipo_malla);
        window.MallasData[areaNombre][gradoStr][tipo_malla] = json;
        console.log(`✅ Matemáticas ${gradoStr}° cargada`);
      })
      .catch(err => {
        // Solo mostramos advertencia si el archivo realmente debería existir
        if (grado >= 0) {
          console.warn(`⚠️ No se halló o hubo error en: ${fileName}`);
        }
      });

    promesas.push(p);
  }
  return Promise.all(promesas);
}

/**
 * Carga los archivos JSON de Proyecto Socioemocional
 */
function cargarSocioemocional4Periodos() {
  const areaNombre = "Proyecto Socioemocional";
  const tipo_malla = "4_periodos";
  const promesas = [];
  const niveles = ["-1", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

  niveles.forEach(gradoStr => {
    const fileName = `data/Socioemocional/Socioemocional_${gradoStr}_4_periodos.json`;

    const p = fetch(fileName)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(json => {
        ensureAreaGradeTipo(areaNombre, gradoStr, tipo_malla);
        window.MallasData[areaNombre][gradoStr][tipo_malla] = json;
        console.log(`✅ Proyecto Socioemocional ${gradoStr}° cargada`);
      })
      .catch(() => console.warn(`⚠️ No se halló Socioemocional: ${fileName}`));
    promesas.push(p);
  });
  return Promise.all(promesas);
}

// Ejecución de carga inicial
Promise.all([
  cargarMatematicas4Periodos(),
  cargarSocioemocional4Periodos()
]).then(() => {
  console.log("🚀 VINCULACIÓN FINALIZADA");
});
