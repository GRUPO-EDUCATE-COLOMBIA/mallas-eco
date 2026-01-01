// js/render-nucleo.js

window.renderTablaMallas = function(items, grado, periodo) {
  const container = document.getElementById('tabla-body');
  if (!container) return;

  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="sin-resultados">No se hallaron registros.</p>';
    return;
  }

  const areaSocioNombre = "Proyecto Socioemocional";
  const tipoMalla = "4_periodos"; 
  const socioDataRaw = window.MallasData?.[areaSocioNombre]?.[grado]?.[tipoMalla]?.periodos?.[periodo];
  const infoSocio = socioDataRaw && socioDataRaw.length > 0 ? socioDataRaw[0] : null;

  let urlDiccionario = null;
  const gradoNum = parseInt(grado);
  if (gradoNum >= 1 && gradoNum <= 5) {
    urlDiccionario = `eco/diccionario/eco_dic_${gradoNum}.html`;
  }

  container.innerHTML = items.map(item => {
    
    // Preparación del bloque Socioemocional ECO
    let contenidoSocioHTML = '';
    if (infoSocio) {
      contenidoSocioHTML = `
        <!-- Nueva Fila Separadora Pedida -->
        <div class="fila-separador-eco">Responsabilidad Socioemocional Proyecto ECO</div>
        
        <div class="seccion-eco-integrada">
          <div class="eco-badge">Cátedra ECO</div>
          <div class="eco-campo-dato"><strong>Eje Central:</strong> ${infoSocio.eje_central || ''}</div>
          <div class="eco-campo-dato"><strong>Habilidades:</strong> ${infoSocio.Habilidades ? infoSocio.Habilidades.join(' • ') : ''}</div>
          <div class="eco-campo-dato"><strong>Evidencias de Desempeño:</strong> ${infoSocio.evidencias_de_desempeno ? infoSocio.evidencias_de_desempeno.join(' • ') : ''}</div>
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

          <!-- ENLACE AL DICCIONARIO ECO -->
          <div class="campo">
            <strong class="label-eco">Recursos Pedagógicos:</strong>
            <div class="dic-link-container">
              ${urlDiccionario ? 
                `<a href="${urlDiccionario}" target="_blank" class="btn-eco-dic">Consultar Diccionario ECO - Grado ${gradoNum}°</a>` : 
                '<p class="texto-vacio">Recurso no disponible para este grado.</p>'}
            </div>
          </div>

        </div>
      </div>
    `;
  }).join('');
};
