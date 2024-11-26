const local = "http://localhost:3000";
const render = "https://biblioum02.onrender.com";

const baseUrl = local;
// Función para manejar la búsqueda
export const performSearch = async (term) => {
  const response = await fetch(
    `${baseUrl}/book/name?${new URLSearchParams({ term })}`
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

// Función para crear los elementos de sugerencia
export const createSuggestionElement = (el) => {
  const $sugres = document.createElement("div");
  $sugres.textContent = el.title;
  $sugres.id = el.id;
  $sugres.classList.add("sugestitem");
  $sugres.setAttribute("data-id", el.id);

  $sugres.addEventListener("mousedown", () => {
    window.location.href = `./book?id=${el.id}`;
  });

  return $sugres;
};

export const handleSearch = async () => {
  const term = $inputnav.value.trim();
  clearSuggestions();

  if (term.length > 0) {
    try {
      const json = await performSearch(term);
      const $fragment = document.createDocumentFragment();

      json.forEach((el) => {
        $fragment.appendChild(createSuggestionElement(el));
      });

      $suggestion.appendChild($fragment);
    } catch (err) {
      console.error("Error desde fetch:", err);
    }
  }
};

export const clearSuggestions = () => {
  while ($suggestion.firstChild) {
    $suggestion.removeChild($suggestion.firstChild);
  }
};

export const debounce = (func, delay) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => func(...args), delay);
  };
};
