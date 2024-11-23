// Función para manejar la búsqueda
export const performSearch = async (term) => {
    const response = await fetch(`https://biblioum02.onrender.com/book/name?${new URLSearchParams({ term })}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  };
  
  // Función para crear los elementos de sugerencia
  export const createSuggestionElement = (el) => {
    const $sugres = document.createElement('div');
    $sugres.textContent = el.title;
    $sugres.id = el.id;
    $sugres.classList.add('sugestitem');
    
    // Establecer el atributo data-id con el ID del libro
    $sugres.setAttribute('data-id', el.id);
  
    // Añadir el evento mousedown para redirigir a la URL
    $sugres.addEventListener('mousedown', () => {
      window.location.href = `./book?id=${el.id}`;
    });
  
    return $sugres;
  };
  
  // Función para manejar la búsqueda en vivo
  export const handleSearch = async () => {
    const term = $inputnav.value.trim();
    clearSuggestions();
  
    if (term.length > 0) {
      try {
        const json = await performSearch(term);
        const $fragment = document.createDocumentFragment();
  
        json.forEach(el => {
          $fragment.appendChild(createSuggestionElement(el));
        });
  
        $suggestion.appendChild($fragment);
      } catch (err) {
        console.error('Error desde fetch:', err);
      }
    }
  };
  
  // Función para limpiar las sugerencias
  export const clearSuggestions = () => {
    while ($suggestion.firstChild) {
      $suggestion.removeChild($suggestion.firstChild);
    }
  };
  
  // Función de debounce
  export const debounce = (func, delay) => {
    let timerId;
    return (...args) => {
      clearTimeout(timerId);
      timerId = setTimeout(() => func(...args), delay);
    };
  };
  
  // Inicialización de la búsqueda
  