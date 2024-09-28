const $books = document.getElementById("books");
const $fragment = document.createDocumentFragment();
// document.querySelector("select").addEventListener('change', () => {
//   const selectedOption = event.target.options[event.target.selectedIndex];
//   const selectedText = selectedOption.text;
//   console.log('select funcionando', selectedOption.value, selectedText);

//   fetch(`http://localhost:3000/books/category`)
//   .then().then().catch();
// });

//CONTROLAR EL CAMBIO DE IMAGEN EN EL SLIDER

const slides = document.querySelectorAll(".slide");
let currentIndex = 0;
const slideInterval = 4400; // Cambiar cada 3 segundos

function showSlide(index) {
  const slidesContainer = document.querySelector(".slides");
  const slideWidth = slides[0].clientWidth;
  slidesContainer.style.transform = `translateX(-${index * slideWidth}px)`;
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
}

setInterval(nextSlide, slideInterval);

// CONTROL DE LOS BOTONES DE SCROLL EN LIBROS

const $carousel = document.getElementById("bookss");
const $btnL = document.getElementById("buttonL");
const $btnR = document.getElementById("buttonR");

$btnR.addEventListener("click", () => {
  $carousel.scrollLeft += 250;
});

$btnL.addEventListener("click", () => {
  $carousel.scrollLeft -= 250;
});

// CAMBIAR LIBROS DEL CARUSEL POR CATEGORIA

document.addEventListener("DOMContentLoaded", () => {
  const $category = document.getElementById("selectCat");
  const $contentBooks = document.getElementById("caruselContainer");
  const $booksFragmentOriginal = document.createDocumentFragment();
  const $booksFragment = document.createDocumentFragment();

  // Verificar si el elemento selectCat está presente
  if (!$category) {
    console.error('Elemento con id "selectCat" no encontrado');
    return;
  }

  $category.addEventListener("change", async () => {
    console.log("Se ejecuta el evento select");

    // Mover los elementos actuales a $booksFragmentOriginal
    while ($contentBooks.firstChild) {
      $booksFragmentOriginal.appendChild($contentBooks.firstChild);
    }

    let term = $category.value;
    console.log(`ejecutando category ${term}`);

    try {
      const response = await fetch(`https://biblioum02.onrender.com/category/${term}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      console.log(`contenido en respuesta`, JSON.stringify(json));
      console.log(`contenido en respuesta`, JSON.stringify(json.books));

      // Limpiar el contenido actual de $contentBooks
      $contentBooks.innerHTML = "";

      // Añadir los nuevos elementos al DocumentFragment
      json.books.forEach((book) => {
        console.log(`esto es lo que hay en book`, book);

        // Crear el elemento div
        const carruselCelDiv = document.createElement("div");
        carruselCelDiv.className = "carrusel-cel";
        carruselCelDiv.style.maxWidth = "258px";
        carruselCelDiv.style.position = "inline-block";
        carruselCelDiv.style.left = "auto";
        carruselCelDiv.setAttribute("aria-hidden", "true");

        // Crear el enlace que contiene la imagen
        const bookLink = document.createElement("a");
        bookLink.href = `./book?id=${book.id}`;
        bookLink.className = "img-related";
        bookLink.title = ""; // Puedes ajustar el título si es necesario

        // Crear la imagen y añadirla al enlace
        const bookImage = document.createElement("img");
        bookImage.src = book.cover;
        bookImage.width = 260;
        bookImage.height = 340;
        bookLink.appendChild(bookImage);

        // Añadir el enlace con la imagen al div principal
        carruselCelDiv.appendChild(bookLink);

        // Crear el h3 que contiene el título
        const bookTitleH3 = document.createElement("h3");

        // Crear el enlace dentro del h3
        const titleLink = document.createElement("a");
        titleLink.className = "img-related";
        titleLink.title = book.title; // El título del libro
        titleLink.style.color = "black";
        titleLink.style.fontSize = "17px";
        titleLink.style.fontFamily = "monospace";
        titleLink.textContent = book.title; // El texto del enlace será el título del libro

        // Añadir el enlace al h3
        bookTitleH3.appendChild(titleLink);

        // Añadir el h3 al div principal
        carruselCelDiv.appendChild(bookTitleH3);

        // Añadir el div completo al fragmento
        $contentBooks.appendChild(carruselCelDiv);
        // $booksFragment.appendChild(carruselCelDiv);
      });
      // Finalmente, añadir el fragmento al DOM
    } catch (err) {
      console.error("Error al cambiar contenido de libros por categoría", err);

      // Revertir los cambios en caso de error
      while ($booksFragmentOriginal.firstChild) {
        $contentBooks.appendChild($booksFragmentOriginal.firstChild);
      }
    }
  });
});

/////////////////////////////////////////////////////////////////////////////////

// TIMEOUT PARA LIVESEARCH
const debounce = (func, delay) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => func(...args), delay);
  };
};

// FUNCION PARA INICIALIZAR LA BÚSQUEDA
const initializeLiveSearch = ({
  inputSelector,
  suggestionSelector,
  fetchUrl,
  onItemSelect,
}) => {
  console.log("funcon live search ejecutandose");

  const $suggestion = document.querySelector(suggestionSelector);
  const $inputnav = document.querySelector(inputSelector);

  // SE CREA LA FUNCION DE BUSQUEDA
  const handleSearch = async () => {
    console.log("busqueda funcionando");

    const $fragment = document.createDocumentFragment();
    let term = $inputnav.value.trim();

    while ($suggestion.firstChild) {
      $suggestion.removeChild($suggestion.firstChild);
    }

    if (term.length > 0) {
      const query = new URLSearchParams({ term });
      console.log("esto es la query", term);

      try {
        const res = await fetch(`${fetchUrl}?${query}`);
        if (!res.ok) throw new Error("Error en la respuesta de la petición");

        const json = await res.json();
        json.forEach((el) => {
          const $sugres = document.createElement("div");
          $sugres.textContent = el.title;
          $sugres.id = el.id;
          $sugres.classList.add("sugestitem");
          $sugres.setAttribute("data-id", el.id);
          $sugres.addEventListener("mousedown", () => onItemSelect(el));

          $fragment.appendChild($sugres);
        });
        $suggestion.appendChild($fragment);
      } catch (err) {
        console.error("Error desde fetch:", err);
      }
    }
  };

  const debouncedSearch = debounce(handleSearch, 220);

  $inputnav.addEventListener("input", debouncedSearch);
  $inputnav.addEventListener("focusout", () => {
    while ($suggestion.firstChild) {
      $suggestion.removeChild($suggestion.firstChild);
    }
  });

  $inputnav.addEventListener("focus", () => {
    debouncedSearch();
  });

  $inputnav.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const $firstChild = $suggestion.firstChild;
      if ($firstChild) {
        window.location.href = `./book?id=${$firstChild.id}`;
      }
    }
  });
};

// USAR LA FUNCION CON DISTINTOS INPUTS
initializeLiveSearch({
  inputSelector: "#search-input",
  suggestionSelector: "#autocomplete-list",
  fetchUrl: "https://biblioum02.onrender.com/book/name",
  onItemSelect: (item) => {
    window.location.href = `./book?id=${item.id}`;
  },
});

// CODIGO PARA LA FUNCIONALIDAD DEL PAGINATION

async function totalBookPages() {
  const $autorValue = document.getElementById("authorFilter").value;
  const $categoryValue = document.getElementById("categoryFilter").value;
  const $yearValue = document.getElementById("yearFilter").value;
  const category = $categoryValue ? $categoryValue : "";
  const author = $autorValue ? $autorValue : "";
  const year = $yearValue ? $yearValue : "";
  try {
    const response = await fetch(
      `https://biblioum02.onrender.com/pages?category=${category}&author=${author}&year=${year}`
    );
    const totalBooks = await response.json();
    const pages =
      Math.round(parseInt(totalBooks) / 20) < 1
        ? 1
        : Math.round(parseInt(totalBooks) / 20);
    return pages;
  } catch (error) {
    console.log(error);
  }
}

const uploadPaginationButtons = (currentPage, totalPages) => {
  const $fragment = document.createDocumentFragment();
  const $pagesContainer = document.getElementById("pagesContainer");
  $pagesContainer.innerHTML = "";

  // Calcula el rango de páginas visibles
  const maxPagesToShow = 10;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let index = startPage; index <= endPage; index++) {
    const button = document.createElement("button");
    button.classList.add("pagination-btn");
    if (index === currentPage) {
      button.classList.add("pagination-btn-focus");
    }
    button.dataset.page = index;
    button.textContent = index;
    $fragment.appendChild(button);
  }

  $pagesContainer.appendChild($fragment);

  // Añadir eventos de clic después de añadir los botones al DOM
  document.querySelectorAll(".pagination-btn").forEach((el) => {
    el.removeEventListener("click", handlePaginationClick); // Remover el evento si ya existe
    el.addEventListener("click", handlePaginationClick);
  });

  // Controlar visibilidad y funcionalidad de botones Anterior y Siguiente
  const prevButton = document.querySelector(
    ".pagination-btn-controller:first-child"
  );
  const nextButton = document.querySelector(
    ".pagination-btn-controller:last-child"
  );

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;

  prevButton.removeEventListener("click", handlePrevClick); // Evita múltiples escuchas
  nextButton.removeEventListener("click", handleNextClick); // Evita múltiples escuchas

  prevButton.addEventListener("click", handlePrevClick);
  nextButton.addEventListener("click", handleNextClick);
};
const updateBookCards = async (page) => {
  const offset = page * 20 - 20;
  console.log("esta es la pagina", page);
  const $autorValue = document.getElementById("authorFilter").value;
  const $categoryValue = document.getElementById("categoryFilter").value;
  const $yearValue = document.getElementById("yearFilter").value;
  const category = $categoryValue ? $categoryValue : null;
  const author = $autorValue ? $autorValue : null;
  const year = $yearValue ? $yearValue : null;

  try {
    const totalBooks = await fetch(
      `https://biblioum02.onrender.com/test?category=${category}&author=${author}&year=${year}&offset=${offset}`
    );
    const data = await totalBooks.json();
    const $fragment = document.createDocumentFragment();
    const $bookContainer = document.getElementById("cardContainer");
    const $paginationContainer = document.getElementById("pages-container");
    const children = Array.from($bookContainer.children);

    children.forEach((child) => {
      if (child !== $paginationContainer) {
        $bookContainer.removeChild(child);
      }
    });

    data.forEach((element) => {
      // Crea un nuevo elemento <a> y sus hijos
      const a = document.createElement("a");
      a.href = `./book?id=${element.book_id}`;
      a.className = "img-related";
      a.title = element.title;

      const divCard = document.createElement("div");
      divCard.id = element.id;
      divCard.className = "card-Book";

      const img = document.createElement("img");
      img.src = element.cover;
      img.alt = element.title;

      const divInfo = document.createElement("div");
      divInfo.className = "card-info";

      const pTitle = document.createElement("p");
      pTitle.className = "black";
      pTitle.textContent = element.title;

      const pAuthor = document.createElement("p");
      pAuthor.className = "black";
      pAuthor.textContent = element.author;

      // Ensambla los elementos
      divInfo.appendChild(pTitle);
      divInfo.appendChild(pAuthor);
      divCard.appendChild(img);
      divCard.appendChild(divInfo);
      a.appendChild(divCard);

      // Agrega el elemento <a> al contenedor fragment
      $fragment.appendChild(a);
    });
    $bookContainer.insertBefore($fragment, $paginationContainer);
  } catch (error) {
    console.log(error);
  }
};

const handlePaginationClick = async (event) => {
  const page = parseInt(event.target.dataset.page);
  const totalBooksPages = await totalBookPages();
  const totalPages = parseInt(totalBooksPages);
  uploadPaginationButtons(page, totalPages);
  updateBookCards(page);
  // window.scrollTo({ top: 950, behavior: 'smooth' });
};

// Funciones para manejar los clics en los botones de navegación
const handlePrevClick = async () => {
  const totalBooksPages = await totalBookPages();
  const currentPage = parseInt(
    document.querySelector(".pagination-btn-focus").dataset.page
  );
  const totalPages = parseInt(totalBooksPages);
  if (currentPage > 1) {
    uploadPaginationButtons(currentPage - 1, totalPages);
    updateBookCards(currentPage - 1);
    // window.scrollTo({ top: 950, behavior: 'smooth' });
  }
};

const handleNextClick = async () => {
  const totalBooksPages = await totalBookPages();
  const currentPage = parseInt(
    document.querySelector(".pagination-btn-focus").dataset.page
  );
  const totalPages = parseInt(totalBooksPages);
  if (currentPage < totalPages) {
    uploadPaginationButtons(currentPage + 1, totalPages);
    updateBookCards(currentPage + 1);
    // window.scrollTo({ top: 950, behavior: 'smooth' });
  }
};

// Inicializa la paginación con valores predeterminados
document.addEventListener("DOMContentLoaded", async () => {
  const initialPage = 1; // Puedes ajustar esto según tus necesidades
  uploadPaginationButtons(initialPage, await totalBookPages());
});

// Cambio de idioma en página
function cambiarIdioma() {
  const idiomaSeleccionado = document.getElementById("idioma").value;

  // Cambiar el atributo lang del elemento <html>
  document.documentElement.lang = idiomaSeleccionado;

  // Cambiar el contenido del saludo según el idioma seleccionado
  if (idiomaSeleccionado === "es") {
    document.getElementById("saludo").innerText = "Hola, bienvenido!";
  } else if (idiomaSeleccionado === "en") {
    document.getElementById("saludo").innerText = "Hello, welcome!";
  }
}

// MANEJO DE FILTROS PARA LOS LIBROS GENERALES DE MAIN //

const $btnFilters = document.getElementById("btnSetFilter");

$btnFilters.addEventListener("click", async () => {
  const totalBooksPages = await totalBookPages();
  const currentPageNumber = document.querySelector(".pagination-btn-focus")
    ? parseInt(document.querySelector(".pagination-btn-focus").dataset.page)
    : 1;
  const currentPage = currentPageNumber ? currentPageNumber : 1;

  const totalPages = parseInt(totalBooksPages);
  try {
    uploadPaginationButtons(currentPage, totalPages);
    updateBookCards(1);
  } catch (error) {
    console.log(error);
  }
});
