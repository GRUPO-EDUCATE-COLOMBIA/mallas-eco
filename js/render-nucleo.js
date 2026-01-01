// js/render-nucleo.js

/**
 * Renderiza la malla de las áreas del Núcleo Común con integración ECO.
 * Ajustado para mostrar habilidades y evidencias en líneas separadas 
 * y habilitar diccionarios para todos los grados.
 */
window.renderTablaMallas = function(items, grado, periodo) {
  const container = document.getElementById('tabla-body');
  if (!container) return;

  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="sin-resultados">No se hallaron registros para los criterios seleccionados.</p>';
    return;
  }

  // --- LÓGICA DE INTEGRACIÓN SOCIOEMOCIONAL ECO ---
  const areaSocioNombre = "Proyecto Socioemocional";
  const tipoMalla = "4_periodos"; 
  const socioDataRaw = window.MallasData?.[areaSocioNombre]?.[grado]?.[tipoMalla]?.periodos?.[periodo];
  const infoSocio = socioDataRaw && socioDataRaw.length > 0 ? socioDataRaw[0] : null;

  // --- LÓGICA DE ENLACE AL DICCIONARIO ECO (Universal: -1 a 11) ---
  // Construcción dinámica de la ruta: eco/diccionario/eco_dic_[grado].html
  const urlDiccionario = `eco/diccionario/eco_dic_${grado}.html`;
  
  // Formateo del nombre del grado para el botón
  let nombreGradoBoton = grado + "°";
  if (grado === "0") nombreGradoBoton = "Transición";
  if (grado === "-1") nombreGradoBoton = "Jardín";

  container.innerHTML = items.map(item => {
    
    // Preparación del bloque Socioemocional ECO
    let contenidoSocioHTML = '';
    if (infoSocio) {
      // Formateamos Habilidades y Evidencias para que salgan en líneas separadas
      const habilidadesHTML = infoSocio.Habilidades 
        ? infoSocio.Habilidades.map(h => `<div style="margin-bottom: 5px;">${h}</div>`).join('') 
        : 'No definidas';
        
      const evidenciasSocioHTML = infoSocio.evidencias_de_desempeno 
        ? infoSocio.evidencias_de_desempeno.map(ev => `<div style="margin-bottom: 5px;">${ev}</div>`).join('') 
        : 'No definidas';

      contenidoSocioHTML = `
        <div class="fila-separador-eco">Responsabilidad Socioemocional Proyecto ECO</div>
        
        <div class="seccion-eco-integrada">
          <div class="eco-badge">Cátedra ECO</div>
          <div class="eco-campo-dato"><strong>Eje Central:</strong> ${infoSocio.eje_central || ''}</div>
          <div class="eco-campo-dato"><strong>Habilidades:</strong> <div style="margin-top:5px;">${habilidadesHTML}</div></div>
          <div class="eco-campo-dato"><strong>Evidencias de Desempeño:</strong> <div style="margin-top:5px;">${evidenciasSocioHTML}</div></div>
        </div>
      `;
    }

    return `
      <div class="item-malla">
        <h3>${item.componente || 'General'}</h3>
        
        <div class="item-malla-contenido">
          
          <!-- Bloques Académicos -->
          <div class="campo">
            <strong>Estándar Curricular:</strong>
            <div>${item.estandar || ''}</div>
          </div>
          
          <div class="campo">
            <strong>DBA:</strong>
            <div>${Array.isArray(item.dba) ? item.dba.join('<br><br>') : (item.dba || '')}</div>
          </div>
          
          <div class="campo">
            <strong>Evidencias de Aprendizaje:</strong>
            <div>${Array.isArray(item.evidencias) ? item.evidencias.join('<br><br>') : (item.evidencias || '')}</div>
          </div>
          
          <div class="campo">
            <strong>Saberes:</strong>
            <div>${Array.isArray(item.saberes) ? item.saberes.join(' • ') : (item.saberes || '')}</div>
          </div>

          <!-- INTEGRACIÓN CÁTEDRA SOCIOEMOCIONAL ECO -->
          <div class="campo">
            ${contenidoSocioHTML}
          </div>

          <!-- ENLACE AL DICCIONARIO ECO (Universal) -->
          <div class="campo">
            <strong class="label-eco">Recursos Pedagógicos:</strong>
            <div class="dic-link-container">
               <a href="${urlDiccionario}" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO - ${nombreGradoBoton}</a>
            </div>
          </div>

        </div>
      </div>
    `;
  }).join('');
};
