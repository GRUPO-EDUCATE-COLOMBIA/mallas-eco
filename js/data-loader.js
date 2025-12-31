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
  const cargadas = [];

  for (let grado = 1; grado <= 11; grado++) {
    // RUTA RELATIVA desde raíz del sitio (sin ../)
    const fileName = `/mallas-saber-lab/data/matematicas/matematicas_${grado}_4_periodos.json`;

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
        cargadas.push(gradoJson);
        
        console.log(`✅ ${areaJson} ${gradoJson}° cargada (${json.numero_periodos} períodos)`);
      })
      .catch(err => {
        console.warn(`❌ ${fileName}:`, err.message);
      });

    promesas.push(p);
  }

  return Promise.all(promesas).then(() => {
    console.log(`✅ Matemáticas: ${cargadas.length}/11 grados cargados:`, cargadas.join(', '));
  });
}

function cargarSocioemocional4Periodos() {
  const areaNombre = "Proyecto Socioemocional";
  const tipo_malla = "4_periodos";
  const promesas = [];
  const grados = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const cargadas = [];

  for (const grado of grados) {
    const gradoStr = grado === -1 ? '-1' : String(grado);
    const fileName = `/mallas-saber-lab/data/Socioemocional/Socioemocional_${gradoStr}_4_Periodos.json`;

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
        cargadas.push(gradoJson);
        
        console.log(`✅ ${areaJson} ${gradoJson}° cargada (${json.numero_periodos || 4} períodos)`);
      })
      .catch(err => {
        console.warn(`❌ ${fileName}:`, err.message);
      });

    promesas.push(p);
  }

  return Promise.all(promesas).then(() => {
    console.log(`✅ Socioemocional: ${cargadas.length}/13 grados cargados:`, cargadas.join(', '));
  });
}

// Carga paralela para mejor rendimiento
Promise.all([
  cargarMatematicas4Periodos(),
  cargarSocioemocional4Periodos()
]).then(() => {
  const areas = Object.keys(window.MallasData);
  const totalGrados = Object.values(window.MallasData).reduce((sum, area) => 
    sum + Object.keys(area || {}).length, 0
  );
  
  console.log(`🎉 CARGA COMPLETA ✅`);
  console.log(`Áreas: ${areas.join(', ')}`);
  console.log(`Total grados: ${totalGrados}`);
  console.log('Prueba en consola: window.MallasData.Matemáticas["5"]["4_periodos"]');
});


