// js/data-loader.js

window.MallasData = {};

function ensureAreaGradeTipo(area, grado, tipo) {
  if (!window.MallasData[area]) window.MallasData[area] = {};
  if (!window.MallasData[area][grado]) window.MallasData[area][grado] = {};
  if (!window.MallasData[area][grado][tipo]) window.MallasData[area][grado][tipo] = null;
}

function cargarMatematicas4Periodos() {
  const areaNombre = "Matemáticas";
  const tipo_malla = "4_periodos";
  const promesas = [];

  for (let grado = 1; grado <= 11; grado++) {
    // NOMBRES EXACTOS de tu captura [image:115]
    const fileName = `data/matematicas/matematicas_${grado}_4_periodos.json`;

    const p = fetch(fileName)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        const gradoJson = json.grado || String(grado);
        const tipoJson = json.tipo_malla || tipo_malla;
        const areaJson = json.area || areaNombre;

        ensureAreaGradeTipo(areaJson, gradoJson, tipoJson);
        window.MallasData[areaJson][gradoJson][tipoJson] = json;

        console.log(
          `✅ ${areaJson} ${gradoJson}° cargada (períodos: ${json.numero_periodos})`
        );
      })
      .catch(err => {
        console.warn(`❌ No se encontró ${fileName}:`, err.message);
      });

    promesas.push(p);
  }

  return Promise.all(promesas);
}

function cargarSocioemocional4Periodos() {
  const areaNombre = "Proyecto Socioemocional";
  const tipo_malla = "4_periodos";
  const promesas = [];
  const grados = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  for (const grado of grados) {
    const gradoStr = grado === -1 ? '-1' : String(grado);
    // Asumiendo mismo patrón que Matemáticas
    const fileName = `data/Socioemocional/Socioemocional_${gradoStr}_4_Periodos.json`;

    const p = fetch(fileName)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        const gradoJson = json.grado || gradoStr;
        const tipoJson = json.tipo_malla || tipo_malla;
        const areaJson = json.area || areaNombre;

        ensureAreaGradeTipo(areaJson, gradoJson, tipoJson);
        window.MallasData[areaJson][gradoJson][tipoJson] = json;

        console.log(
          `✅ ${areaJson} ${gradoJson}° cargada (períodos: ${json.numero_periodos || 4})`
        );
      })
      .catch(err => {
        console.warn(`❌ No se encontró ${fileName}:`, err.message);
      });

    promesas.push(p);
  }

  return Promise.all(promesas);
}

// Carga secuencial
cargarMatematicas4Periodos()
  .then(() => console.log("✅ Matemáticas completas"))
  .then(() => cargarSocioemocional4Periodos())
  .then(() => {
    console.log("🎉 TODO CARGADO. Áreas:", Object.keys(window.MallasData).length);
    console.log("Matemáticas disponibles:", Object.keys(window.MallasData.Matemáticas || {}));
  });
