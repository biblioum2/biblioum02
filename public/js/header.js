const $logo = document.getElementById("logo");

const adasda = "http://localhost:3000";

async function getUserData(){
  try {
    const response = await fetch(`${baseUrl}/payloadXtract`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.log("Error al obtener los datos del usuario: ", error);
    
  }
};

$logo.addEventListener("click", () => {
  window.location.href = "/uman";
});

function getCookie(nombre) {
  const cookies = document.cookie.split("; ");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    if (cookie.startsWith(nombre + "=")) {
      return cookie.substring(nombre.length + 1);
    }
  }
  return null;
}

function formatDate(dateInput) {
  // Verificar si el formato de entrada es dd/mm/yyyy
  const ddmmyyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  if (ddmmyyyyRegex.test(dateInput)) {
    // Si es en formato dd/mm/yyyy, convertir a Date
    const [day, month, year] = dateInput.split("/").map(Number);
    const date = new Date(year, month - 1, day); // Meses en JS son 0-indexed

    // Retornar en formato ISO (yyyy-mm-ddTHH:mm:ss.sssZ)
    return date.toISOString();
  } else {
    // Si no es un formato dd/mm/yyyy, se asume que es una fecha ISO
    const date = new Date(dateInput);

    // Verificar si la fecha es válida
    if (isNaN(date)) {
      throw new Error("Formato de fecha no válido");
    }

    // Retornar en formato dd/mm/yyyy
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Meses en JS son 0-indexed
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }
}

function highlightButton(selectedButton) {
  const buttons = document.querySelectorAll(".sub-options-btn");

  buttons.forEach((button) => {
    if (button === selectedButton) {
      button.classList.add("active");
      button.classList.remove("inactive");
    } else {
      button.classList.remove("active");
      button.classList.add("inactive");
    }
  });
}

async function getOrders(values) {
  try {
    const queryString = new URLSearchParams(values).toString();
    
    
    const response = await fetch(`${adasda}/getorders?${queryString}`);
    

    return response;
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const $subOptions = document.querySelector(".sub-options");

  document.addEventListener("click", (event) => {
    const $profileButton = document.getElementById("profile-button");
    const $element = document.getElementById("user-info");

    // Verifica si el clic ocurrió en el botón de perfil o dentro del propio elemento
    if ($profileButton.contains(event.target)) {
      $element.classList.toggle("ghost");
    } else if (!$element.contains(event.target)) {
      $element.classList.add("ghost");
    }

    
  });
  if ($subOptions) {
    $subOptions.addEventListener("click", async (event) => {
      
      const idUser = getCookie("userId");
      
      
      const $target = event.target;
      const filter = { user_id: idUser, status: "Pendiente" };
      highlightButton($target);

      if ($target.id && $target.id.includes("btn-waiting")) {
      

        filter.status = "Pendiente";
        // Aquí puedes agregar la lógica para el botón "waiting"
      } else if ($target.id && $target.id.includes("btn-pending")) {
        
        filter.status = "No devuelta";
      } else if ($target.id && $target.id.includes("btn-history")) {
        
        filter.status = "Devuelta";
      }
      try {
        

        const result = await getOrders(filter);
        const data = await result.json();
        const ordenes = data.response;
        
        const $ordersContainer = document.querySelector(
          ".profile-info-responses"
        );
        const $fragment = document.createDocumentFragment();
        if (data.response.length > 0) {
          

          $ordersContainer.innerHTML = "";
          ordenes.forEach((element) => {
            const $order = document.createElement("div");
            const $title = document.createElement("p");
            const $loan = document.createElement("p");
            const $return = document.createElement("p");
            const $buttons = document.createElement("div");

            const $deleteButton = document.createElement("button");

            const $iconDelete = document.createElement("i");

            $order.classList.add("prestamo-element");
            $order.dataset.id = element.id;

            $iconDelete.classList.add("fa-solid");
            $iconDelete.classList.add("fa-trash");

            $deleteButton.appendChild($iconDelete);

            $deleteButton.title = "Eliminar";
            $deleteButton.dataset.action = "delete";

            $buttons.appendChild($deleteButton);
            $buttons.classList.add("prestamo-buttons");

            $title.textContent = element.title;
            $loan.textContent = element.loan_date;
            $return.textContent = element.return_date;

            $order.appendChild($title);
            $order.appendChild($loan);
            $order.appendChild($return);
            $order.appendChild($buttons);
            $fragment.appendChild($order);
          });
        } else {
          const $emptyOrders = document.createElement("div");
          const $message = document.createElement("p");
          $ordersContainer.innerHTML = "";
          $emptyOrders.appendChild($message);
          $emptyOrders.style =
            "width: 100%; height: 10rem; display: flex; align-items: center; justify-content: center;";
          $message.style = "color: rgb(168, 168, 168);";
          $message.textContent = "No hay elementos para mostrar";
          $fragment.appendChild($emptyOrders);
        }
        $ordersContainer.appendChild($fragment);
      } catch (error) {
        console.log(error);
      }
    });
  }

  // Selecciona el primer elemento con la clase 'profile-info-responses'
  const allOrders = document.querySelector(".profile-info-responses");

  if (allOrders) {
    // Selecciona todos los elementos con la clase 'profile-info-responses'
    const ordersContainers = document.getElementsByClassName(
      "profile-info-responses"
    );

    // Itera sobre cada elemento y agrega un evento 'click' a cada uno
    Array.from(ordersContainers).forEach((ordersContainer) => {
      ordersContainer.addEventListener("click", async (event) => {
        
        let isEditing = false;
        const target = event.target.closest("button");
        const order = target.closest(".prestamo-element");
       

        if (target && target.dataset.action === "edit" && isEditing === false) {
          

          const selectors = order.querySelectorAll("p");
          

          const filteredSelectors = Array.from(selectors).slice(1);
          

          filteredSelectors.forEach((element, index) => {
            const oldElement = element;
            

            const input = document.createElement("input");
            input.classList.add("prestamo-inputs");
            input.placeholder = "New element";
            oldElement.parentNode.replaceChild(input, oldElement);

            flatpickr(input, {
              dateFormat: "d/m/Y",
              altInput: true,
              altFormat: "d/m/Y",
              minDate: "today",
              maxDate:
                index === 0 ? new Date().fp_incr(0) : new Date().fp_incr(20),
            });
          });
        } else if (target && target.dataset.action === "delete") {
          const orderId = parseInt(order.dataset.id);
          try {
            const result = await fetch(`${adasda}/deleteOrder`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ orderId }),
            });

            order.remove();
            alert("Registro eliminado con exito!");
          } catch (error) {
            console.error(error);
          }
        }
      });
    });
  }
});
