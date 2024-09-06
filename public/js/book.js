// logica para desplegar la descripcion
const $showMore = document.getElementById("showMore");
$showMore.addEventListener('click', () => {
    const $description = document.getElementById('t1');
    
    // Obtener el valor actual de max-height usando getComputedStyle
    const currentMaxHeight = window.getComputedStyle($description).getPropertyValue('max-height');
    
    if (currentMaxHeight !== 'none') {
        $description.setAttribute('style', 'max-height: none; -webkit-mask-image: none;');
    } else {
        $description.setAttribute('style', 'max-height: 12em; -webkit-mask-image: linear-gradient(#000 60%, transparent);');
    }
});

// TIMEOUT PARA LIVESEARCH
const debounce = (func, delay) => {
    let timerId;
    return (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => func(...args), delay);
    };
  };
  
  // FUNCION LIVESEARCH
  const handleSearch = () => {
    const $fragment = document.createDocumentFragment();
  
    let term = $inputnav.value.trim();
    while ($suggestion.firstChild) {
      $suggestion.removeChild($suggestion.firstChild);
    }
  
    if (term.length > 0) {
      const query = new URLSearchParams({ term });
  
      fetch(`http://localhost:3000/book/name?${query}`)
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(json => {
          json.forEach(el => {
            const $sugres = document.createElement('div');
            $sugres.textContent = el.title;
            $sugres.id = el.id;
            $sugres.classList.add('sugestitem');
            
            // Establecer el atributo data-id con el ID del libro
            $sugres.setAttribute('data-id', el.id);
  
            // Añadir el evento click para redirigir a la URL
            $sugres.addEventListener('mousedown', () => {
              window.location.href = `./book?id=${el.id}`;
            });
  
            $fragment.appendChild($sugres);
          });
          $suggestion.appendChild($fragment);
        })
        .catch(err => {
          console.error('Error desde fetch:', err);
        });
    } else {
      console.log('');
    }
  };
  
  // Inicialización de la búsqueda
  const $suggestion = document.getElementById('autocomplete-list');
  const $inputnav = document.getElementById('search-input');
  const debouncedSearch = debounce(handleSearch, 120);
  $inputnav.addEventListener('input', debouncedSearch);
  
  $inputnav.addEventListener('focusout', () => {
    while ($suggestion.firstChild) {
      $suggestion.removeChild($suggestion.firstChild);
    }
  });
  
  $inputnav.addEventListener('focus', () => {
    debouncedSearch();
  });
  
// logica para solicitar libro

const $solicitarBtn =  document.getElementById('solicitud-btn');
const $solicitudModal = document.getElementById('requestBookModal');
const $submitCancelBtn = document.getElementById('sub-btn-2');

$submitCancelBtn.addEventListener('click', () => {
  $solicitudModal.style.display = 'none';
});

$solicitarBtn.addEventListener('click', () => {
  $solicitudModal.style.display = 'block';
});