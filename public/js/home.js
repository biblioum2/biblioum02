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

    let term = $category.value - 1;
    console.log(`ejecutando category ${term}`);

    try {
      const response = await fetch(`http://localhost:3000/category/${term}`);
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

// FUNCION LIVESEARCH

// SE OBTIENE EL CONTENEDOR QUE ALMACENA LAS SUGERENCIAS EN HTML
const $suggestion = document.getElementById("autocomplete-list");

// SE OBTIENE EL ELEMENTO INPUT DE BUSQUEDA
const $inputnav = document.getElementById("search-input");

// SE CREA LA FUNCION DE BUSQUEDA
const handleSearch = async () => {
  // SE INICIALIZA UNA VARIABLE QUE SIMULA UN FRAGMENTO DEL DOM
  const $fragment = document.createDocumentFragment();

  // SE OBTIENE EL VALOR INTRODUCIDO EN EL INPUT
  let term = $inputnav.value.trim();

  // SE ELIMINAN LOS ELEMENTOS HIJOS DEL CONTENEDOR DE SUGERENCIAS
  while ($suggestion.firstChild) {
    $suggestion.removeChild($suggestion.firstChild);
  }

  // SE VERIFICA QUE EL INPUT TENGA CONTENIDO
  if (term.length > 0) {
    // SE INICIALIZA LA VARIABLE QUERY CON EL VALOR FORMATEADO DEL INPUT
    const query = new URLSearchParams({ term });

    // SE REALIZA LA PETICION A LA RUTA PASANDO EL QUERY
    fetch(`http://localhost:3000/book/name?${query}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res))) // MANEJO RESPUESTA EXITOSA O RECHAZADA
      .then((json) => {
        // MANEJA LA RESPUESTA
        json.forEach((el) => {
          const $sugres = document.createElement("div");
          $sugres.textContent = el.title;
          $sugres.id = el.id;
          $sugres.classList.add("sugestitem");

          // Establecer el atributo data-id con el ID del libro
          $sugres.setAttribute("data-id", el.id);

          // Añadir el evento click para redirigir a la URL
          $sugres.addEventListener("mousedown", () => {
            window.location.href = `./book?id=${el.id}`;
          });

          $fragment.appendChild($sugres);
        });
        $suggestion.appendChild($fragment);
      })
      .catch((err) => {
        // SE MANEJA EL ERROR
        console.error("Error desde fetch:", err);
      });
  } else {
    console.log("");
  }
};

const debouncedSearch = debounce(handleSearch, 220); // INICIAMOS UNA VARIABLE QUE INCORPORA EL DELAY Y EL SEARCH
$inputnav.addEventListener("input", debouncedSearch); //INICIA LA BUSQUEDA CUANDO EL SE ESCRIBE EN EL INPUT

$inputnav.addEventListener("focusout", () => {
  //REMOVER LAS SUGERENCIAS CUANDO SE DEJA DE HACER FOCUS AL INPUT
  while ($suggestion.firstChild) {
    $suggestion.removeChild($suggestion.firstChild);
  }
});

$inputnav.addEventListener("focus", () => {
  // INICIAR LA BUSQUEDA CUANDO SE HACE FOCUS AL INPUT
  debouncedSearch();
});

$inputnav.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const $firstChild = $suggestion.firstChild;
    window.location.href = `./book?id=${$firstChild.id}`;
  }
});

// CODIGO PARA LA FUNCIONALIDAD DEL PAGINATION

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
    el.addEventListener("click", (event) => {
      const page = parseInt(event.target.dataset.page);
      uploadPaginationButtons(page, totalPages);
    });
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

// Funciones para manejar los clics en los botones de navegación
const handlePrevClick = () => {
  const currentPage = parseInt(
    document.querySelector(".pagination-btn-focus").dataset.page
  );
  const totalPages = parseInt(
    document.getElementById("pagesContainer").dataset.totalpages
  );
  if (currentPage > 1) {
    uploadPaginationButtons(currentPage - 1, totalPages);
  }
};

const handleNextClick = () => {
  const currentPage = parseInt(
    document.querySelector(".pagination-btn-focus").dataset.page
  );
  const totalPages = parseInt(
    document.getElementById("pagesContainer").dataset.totalpages
  );
  if (currentPage < totalPages) {
    uploadPaginationButtons(currentPage + 1, totalPages);
  }
};

// Inicializa la paginación con valores predeterminados
document.addEventListener("DOMContentLoaded", () => {
  const $totalPagesContainer = document.getElementById("pagesContainer");
  const initialPage = 1; // Puedes ajustar esto según tus necesidades
  const totalPages = parseInt(
    $totalPagesContainer.getAttribute("data-totalPages")
  );

  uploadPaginationButtons(initialPage, totalPages);
});
