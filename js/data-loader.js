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
 * Carga los archivos JSON de Matemáticas (Grados 1 a 11)
 * Utiliza rutas relativas para mayor portabilidad.
 */
function cargarMatematicas4Periodos() {
  const areaNombre = "Matemáticas";
  const tipo_malla = "4_periodos";
  const promesas = [];
  const cargadas = [];

  for (let grado = 1; grado <= 11; grado++) {
    // RUTA RELATIVA: Se elimina el prefijo fijo para que funcione en cualquier entorno
    const fileName = `data/matematicas/matematicas_${grado}_4_periodos.json`;

    const p = fetch(fileName)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} - No encontrado`);
        return r.json();
      })
      .then(json => {
        const gradoJson = String(json.grado || grado);
        const tipoJson = json.tipo_malla || tipo_malla;
        const areaJson = json.area || areaNombre;

        ensureAreaGradeTipo(areaJson, gradoJson, tipoJson);
        window.MallasData[areaJson][gradoJson][tipoJson] = json;
        cargadas.push(gradoJson);
        
        console.log(`✅ ${areaJson} ${gradoJson}° cargada`);
      })
      .catch(err => {
        console.warn(`⚠️ Error cargando ${fileName}:`, err.message);
      });

    promesas.push(p);
  }

  return Promise.all(promesas).then(() => {
    console.log(`📊 Matemáticas: ${cargadas.length}/11 grados disponibles.`);
  });
}

/**
 * Carga los archivos JSON de Proyecto Socioemocional
 * Incluye grados especiales como Jardín (-1) y Transición (0)
 */
function cargarSocioemocional4Periodos() {
  const areaNombre = "Proyecto Socioemocional";
  const tipo_malla = "4_periodos";
  const promesas = [];
  const grados = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const cargadas = [];

  for (const grado of grados) {
    const gradoStr = String(grado);
    // RUTA RELATIVA: Se respeta la subcarpeta 'Socioemocional' detectada en el análisis
    const fileName = `data/Socioemocional/Socioemocional_${gradoStr}_4_periodos.json`;

    const p = fetch(fileName)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} - No encontrado`);
        return r.json();
      })
      .then(json => {
        const gradoJson = String(json.grado || gradoStr);
        const tipoJson = json.tipo_malla || tipo_malla;
        const areaJson = json.area || areaNombre;

        ensureAreaGradeTipo(areaJson, gradoJson, tipoJson);
        window.MallasData[areaJson][gradoJson][tipoJson] = json;
        cargadas.push(gradoJson);
        
        console.log(`✅ ${areaJson} ${gradoJson}° cargada`);
      })
      .catch(err => {
        console.warn(`⚠️ Error cargando ${fileName}:`, err.message);
      });

    promesas.push(p);
  }

  return Promise.all(promesas).then(() => {
    console.log(`📊 Socioemocional: ${cargadas.length}/13 niveles disponibles.`);
  });
}

/**
 * Ejecución de carga en paralelo al iniciar la aplicación
 */
Promise.all([
  cargarMatematicas4Periodos(),
  cargarSocioemocional4Periodos()
]).then(() => {
  console.log('🚀 PROCESO DE CARGA DE DATOS FINALIZADO');
});
