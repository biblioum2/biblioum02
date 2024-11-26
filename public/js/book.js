const local = "http://localhost:3000";
const render = "https://biblioum02.onrender.com";

const baseUrl = local;

const $userId = document.getElementById("userId");
const socket = io(`${baseUrl}`, {
  query: {
    userId: parseInt($userId.value),
  },
});

document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#requestDate", {
    dateFormat: "Y-m-d",
    minDate: "today",
    maxDate: new Date().fp_incr(0),
  });
});

document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#returnDate", {
    dateFormat: "Y-m-d",
    minDate: "today", // Establece la fecha mínima
    maxDate: new Date().fp_incr(7), // Establece la fecha máxima (una semana)
  });
});

// SOLICITAR LOS ELEMENTOS PARA EJECUTAR LA ORDEN

const $solicitarBtn = document.getElementById("solicitud-btn");
const $solicitudModal = document.getElementById("requestBookModal");
const $submitCancelBtn = document.getElementById("sub-btn-2");
const $closeModalBtn = document.getElementById("close-modal");
const $orderForm = document.getElementById("requestBookForm");

$closeModalBtn.addEventListener("click", () => {
  $solicitudModal.style.display = "none";
});

$submitCancelBtn.addEventListener("click", () => {
  $solicitudModal.style.display = "none";
});

$solicitarBtn.addEventListener("click", () => {
  $solicitudModal.style.display = "flex";
});

// EMITIR LA ORDEN AL SERVIDOR
$orderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const $bookId = document.getElementById("bookId");
  const $title = document.getElementById("bookTitle");
  const $requestDate = document.getElementById("requestDate");
  const $returnDate = document.getElementById("returnDate");
  const data = {
    userId: $userId.value,
    bookId: $bookId.value,
    title: $title.value,
    loanDate: $requestDate.value,
    returnDate: $returnDate.value,
  };
  console.log("data desde cliente book", data);

  const mensaje = "conexion funcionando";
  if (
    data.userId === "" ||
    data.bookId === "" ||
    data.title === "" ||
    data.loanDate === "" ||
    data.returnDate === ""
  ) {
    alert("Todos los campos son requeridos");
    return;
  }
  socket.emit("order", data, mensaje);
  $solicitudModal.style.display = "none";
  alert("Orden enviada con exito");
});

// MANEJAR LA RESPUESTA AL CREAR UNA ORDEN

// logica para desplegar la descripcion
const $showMore = document.getElementById("showMore");
$showMore.addEventListener("click", () => {
  const $description = document.getElementById("t1");

  // Obtener el valor actual de max-height usando getComputedStyle
  const currentMaxHeight = window
    .getComputedStyle($description)
    .getPropertyValue("max-height");

  if (currentMaxHeight !== "none") {
    $description.setAttribute(
      "style",
      "max-height: none; -webkit-mask-image: none;"
    );
  } else {
    $description.setAttribute(
      "style",
      "max-height: 12em; -webkit-mask-image: linear-gradient(#000 60%, transparent);"
    );
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

    fetch(`${baseUrl}/book/name?${query}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((json) => {
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
        console.error("Error desde fetch:", err);
      });
  } else {
    console.log("");
  }
};

// Inicialización de la búsqueda
const $suggestion = document.getElementById("autocomplete-list");
const $inputnav = document.getElementById("search-input");
const debouncedSearch = debounce(handleSearch, 120);
$inputnav.addEventListener("input", debouncedSearch);

$inputnav.addEventListener("focusout", () => {
  while ($suggestion.firstChild) {
    $suggestion.removeChild($suggestion.firstChild);
  }
});

$inputnav.addEventListener("focus", () => {
  debouncedSearch();
});

async function updateRatingBook(userId, bookId, score) {
  userId = userId ? parseInt(userId) : null;
  bookId = bookId ? parseInt(bookId) : null;
  score = score ? parseInt(score) : null;
  console.log("DATOS DESDE EL CLIENTE: ", userId, bookId, score);

  // Validar userId
  if (userId === null || isNaN(userId) || userId <= 0) {
    alert("ID de usuario invalido.");
    console.error("Invalid userId. It must be a positive integer.");
    return;
  }

  // Validar bookId
  if (bookId === null || isNaN(bookId) || bookId <= 0) {
    alert("ID de libro invalido.");
    console.error("Invalid bookId. It must be a positive integer.");
    return;
  }

  // Validar score
  if (score === null || isNaN(score) || score < 1 || score > 5) {
    alert("Puntuacion no valida, se debe enviar una puntuacion de 1 a 5.");
    console.error("Invalid score. It must be an integer between 1 and 5.");
    return;
  }

  try {
    const result = await fetch(`${baseUrl}/updateRatingBook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        bookId: bookId,
        score: score,
      }),
    });
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.success}`);
    }
    const data = await result.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching the data:", error);
  }
}

function createModal() {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <p>Some text in the Modal..</p>
      </div>
    `;
  document.body.appendChild(modal);
  return modal;
}
async function getRating(radio) {
  const rating = parseInt(radio.value);
  console.log(`Rating seleccionado: ${rating}`);
  const userId = $userId.value;
  console.log("Este es el user id", userId);

  const bookId = document.getElementById("bookId").value;
  console.log("Este es el bookid", bookId);

  parseInt(bookId);
  parseInt(userId);
  await updateRatingBook(userId, bookId, rating);
}
