document.addEventListener('DOMContentLoaded', () => {
    const areaSelect = document.getElementById('area');
    const gradoSelect = document.getElementById('grado');
    const componenteSelect = document.getElementById('componente');
    const competenciaSelect = document.getElementById('competencia');
    const btnConsultar = document.getElementById('consultar');
    const resultadoCuerpo = document.getElementById('resultado-cuerpo');
    const tableContainer = document.querySelector('.table-responsive');

    let datos = [];

    // 1. Cargar el JSON
    fetch('json/mallas.json')
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el JSON");
            return response.json();
        })
        .then(data => {
            datos = data;
            cargarAreas();
        })
        .catch(error => console.error("Error cargando datos:", error));

    // 2. Llenar el select de Áreas
    function cargarAreas() {
        const areas = [...new Set(datos.map(item => item.area))];
        areaSelect.innerHTML = '<option value="" disabled selected>Seleccione un área</option>';
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });
    }

    // 3. Evento: Al cambiar Área -> Llenar Grados
    areaSelect.addEventListener('change', () => {
        const areaSeleccionada = areaSelect.value;
        const grados = [...new Set(datos
            .filter(item => item.area === areaSeleccionada)
            .map(item => item.grado))];

        gradoSelect.innerHTML = '<option value="" disabled selected>Seleccione un grado</option>';
        gradoSelect.disabled = false;
        
        // Ordenar grados numéricamente
        grados.sort((a, b) => a - b);

        grados.forEach(grado => {
            const option = document.createElement('option');
            option.value = grado;
            option.textContent = `Grado ${grado}`;
            gradoSelect.appendChild(option);
        });

        // Resetear selectores hijos
        componenteSelect.innerHTML = '<option value="" disabled selected>Seleccione un componente</option>';
        componenteSelect.disabled = true;
        competenciaSelect.innerHTML = '<option value="" disabled selected>Seleccione una competencia</option>';
        competenciaSelect.disabled = true;
    });

    // 4. Evento: Al cambiar Grado -> Llenar Componentes
    gradoSelect.addEventListener('change', () => {
        const areaSeleccionada = areaSelect.value;
        const gradoSeleccionado = gradoSelect.value;

        const componentes = [...new Set(datos
            .filter(item => item.area === areaSeleccionada && item.grado == gradoSeleccionado)
            .map(item => item.componente))];

        componenteSelect.innerHTML = '<option value="" disabled selected>Seleccione un componente</option>';
        componenteSelect.disabled = false;

        componentes.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp;
            option.textContent = comp;
            componenteSelect.appendChild(option);
        });
    });

    // 5. Evento: Al cambiar Componente -> Llenar Competencias
    componenteSelect.addEventListener('change', () => {
        const areaSeleccionada = areaSelect.value;
        const gradoSeleccionado = gradoSelect.value;
        const compSeleccionado = componenteSelect.value;

        const competencias = [...new Set(datos
            .filter(item => item.area === areaSeleccionada && item.grado == gradoSeleccionado && item.componente === compSeleccionado)
            .map(item => item.competencia))];

        competenciaSelect.innerHTML = '<option value="" disabled selected>Seleccione una competencia</option>';
        competenciaSelect.disabled = false;

        competencias.forEach(compe => {
            const option = document.createElement('option');
            option.value = compe;
            option.textContent = compe;
            competenciaSelect.appendChild(option);
        });
    });

    // 6. BOTÓN CONSULTAR: Mostrar resultados
    btnConsultar.addEventListener('click', () => {
        const area = areaSelect.value;
        const grado = gradoSelect.value;
        const componente = componenteSelect.value;
        const competencia = competenciaSelect.value;

        if (!area || !grado) {
            alert("Por favor seleccione al menos Área y Grado");
            return;
        }

        const resultados = datos.filter(item => 
            item.area === area && 
            item.grado == grado &&
            (!componente || item.componente === componente) &&
            (!competencia || item.competencia === competencia)
        );

        mostrarResultados(resultados);
    });

    function mostrarResultados(lista) {
        resultadoCuerpo.innerHTML = '';
        
        if (lista.length === 0) {
            resultadoCuerpo.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron resultados</td></tr>';
        } else {
            lista.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.aprendizaje || 'N/A'}</td>
                    <td>${item.evidencia || 'N/A'}</td>
                    <td>${item.estandar || 'N/A'}</td>
                    <td>${item.db || 'N/A'}</td>
                `;
                resultadoCuerpo.appendChild(tr);
            });
        }
        // Mostrar la tabla (quitar clase d-none de Bootstrap si existe)
        tableContainer.style.display = 'block';
    }
});
