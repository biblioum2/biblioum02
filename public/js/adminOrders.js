const local = "http://localhost:3000";
const render = "https://biblioum02.onrender.com";

const baseUrl = local;

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
const idUser = getCookie("userId");
console.log("ID USER DESDE ADMIN ORDERS", idUser);

const socket = io(`${baseUrl}`, {
  query: {
    userId: parseInt(idUser),
  },
});
const mensajes = {
  success: "Operación exítosa!",
  failed: "Operación fallida!",
};
function formatDate(dateInput) {
  const ddmmyyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  if (ddmmyyyyRegex.test(dateInput)) {
    const [day, month, year] = dateInput.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toISOString();
  } else {
    const date = new Date(dateInput);
    if (isNaN(date)) {
      throw new Error("Formato de fecha no válido");
    }
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }
}

let isShowingStatus = false;
document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("click", (event) => {
      event.stopPropagation();
      dropdown.querySelector(".dropdown-content").classList.toggle("show");
    });
    const options = dropdown.querySelectorAll(".dropdown-content a");
    options.forEach((option) => {
      option.addEventListener("click", (event) => {
        event.preventDefault();
        const value = option.getAttribute("data-value");
        handleDropdownSelection(value);
        dropdown.querySelector(".dropdown-content").classList.remove("show");
      });
    });
  });

  window.addEventListener("click", () => {
    dropdowns.forEach((dropdown) => {
      dropdown.querySelector(".dropdown-content").classList.remove("show");
    });
  });
});

async function handleDropdownSelection(value) {
  switch (value) {
    case "Pendiente":
      console.log("Seleccionaste Opción Pendiente");
      try {
        await updateContent("Pendiente");
        console.info("Operacion exitosa: ");
      } catch (error) {
        console.error("Error al actualizar ordenes: ", error);
      }
      break;
    case "Devuelta":
      console.log("Seleccionaste Opción Devuelta");
      try {
        await updateContent("Devuelta");
        console.info("Operacion exitosa: ");
      } catch (error) {
        console.error("Error al actualizar ordenes: ", error);
      }
      break;
    case "No devuelta":
      console.log("Seleccionaste Opción: ", value);
      try {
        await updateContent("No devuelta");
        console.info("Operacion exitosa: ");
      } catch (error) {
        console.error("Error al actualizar ordenes: ", error);
      }
      break;
    default:
      console.log("Opción no válida");
      break;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("orders-table");
  let isEditing = false;

  table.addEventListener("click", async function (event) {
    const $target = event.target;
    const $row = $target.closest("tr");

    if ($target.classList.contains("editBtn")) {
      if (!isEditing) {
        isEditing = true;
        editRow($target);
      }
    } else if ($target.classList.contains("applyBtn")) {
      try {
        const $simpleReturnDate = $row.querySelector(".editable-input-2").value;
        const $simpleLoanDate = $row.querySelector(".editable-input-1").value;
        console.log(
          "info de los inputs antes de formatear: ",
          $simpleLoanDate,
          $simpleReturnDate
        );

        const orderId = parseInt($row.querySelector(".rowid").textContent);
        const loanDate = $simpleLoanDate.trim();
        const returnDate = $simpleReturnDate.trim();
        console.log(
          "info de los inputs despues de formatear: ",
          loanDate,
          returnDate
        );

        console.log("se procede a ejecutar el fetch");
        console.log("datos desde el cliente: ", orderId, loanDate, returnDate);
        const result = await fetch(
          `${baseUrl}/updateOrderRow?orderId=${orderId}&loanDate=${loanDate}&returnDate=${returnDate}`
        );
        console.log("se termino de ejecutar el fetch");

        applyChanges($target);
        if (!result.ok) {
          throw new Error("Error en la actualización");
        }
        isEditing = false;
      } catch (error) {
        console.log("Error al realizar update orders:", error);
        isEditing = false;
      }
    } else if ($target.classList.contains("cancelBtn")) {
      cancelChanges($target);
      isEditing = false;
    } else if ($target.classList.contains("rejectBtn")) {
      rejectOrder($target);
    } else if ($target.classList.contains("acceptBtn")) {
      acceptOrder($target, "No devuelta");
    } else if ($target.classList.contains("receivedBtn")) {
      acceptOrder($target, "Devuelta");
    }
  });
  async function rejectOrder(element) {
    const $row = element.closest("tr");
    const $orderId = parseInt($row.querySelector(".rowid").textContent);
    const $notification = document.getElementById("notification");

    try {
      const response = await fetch(`${baseUrl}/deleteOrder`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: $orderId,
        }),
      });
      const data = await response.json();
      $notification.textContent =
        data.success === true ? mensajes.success : mensajes.failed;
      $notification.classList.remove("hidden");
      $notification.classList.add("success");
      setTimeout(() => {
        $notification.classList.remove("success");
        $notification.textContent = "";
        setTimeout(() => {
          $notification.classList.add("hidden");
        }, 0);
      }, 3000);
      $row.innerHTML = "";
    } catch (error) {
      $notification.textContent = mensajes.failed;
      $notification.classList.toggle("hidden");
      $notification.classList.toggle("error");
      console.error("Error al eliminar orden: ", error);
    }
  }
  async function acceptOrder(button, value) {
    const row = button.closest("tr");
    const orderId = parseInt(row.querySelector(".rowid").textContent);
    const status = value.trim();
    const $notification = document.getElementById("notification");
    console.log("datos desde el cliente: ", orderId, status);

    try {
      const response = await fetch(`${baseUrl}/updateOrderStatus1`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          status: status,
        }),
      });
      const data = await response.json();
      $notification.textContent =
        data.success == true ? "Operacion exitosa!" : "Operacion fallida!";
      $notification.classList.remove("hidden");
      $notification.classList.add("success");
      setTimeout(() => {
        $notification.classList.remove("success");
        $notification.textContent = "";
        setTimeout(() => {
          $notification.classList.add("hidden");
        }, 0);
      }, 3000);
      row.innerHTML = "";
    } catch (error) {
      $notification.textContent = "Operacion fallida!";
      $notification.classList.toggle("hidden");
      $notification.classList.toggle("error");
      console.error(error);
    }
  }
  function editRow(button) {
    const row = button.closest("tr");
    const cells = row.querySelectorAll("td");
    console.log(cells);

    const classesToExtract = ["rowloan_date", "rowreturn_date"];
    const filteredCells = Array.from(cells).filter((cell) => {
      return classesToExtract.some((className) =>
        cell.classList.contains(className)
      );
    });
    filteredCells.forEach((cell, index) => {
      console.log(cell, index);

      if (index < filteredCells.length) {
        const originalValue = cell.textContent;
        console.log(originalValue);

        cell.setAttribute("data-original-value", originalValue);
        const input = document.createElement("input");
        input.type = "text";
        input.value = originalValue;
        input.classList.add(`editable-input-${index + 1}`);
        input.id = `input-${index}`;
        input.style.width = `${getTextWidth(originalValue) + 10}px`;
        cell.innerHTML = "";
        cell.appendChild(input);
        if (input.id === "input-0" || input.id === "input-1") {
          flatpickr(input, {
            dateFormat: "d/m/Y",
            altFormat: "d/m/Y",
            minDate: "today",
            maxDate:
              input.id === "input-1"
                ? new Date().fp_incr(20)
                : new Date().fp_incr(20),
          });
        }
      }
    });

    const actionsCell = row.querySelector("td:last-child");
    actionsCell.setAttribute("data-original-buttons", actionsCell.innerHTML);
    actionsCell.innerHTML = `
            <button class="btn applyBtn">Aplicar</button>
            <button class="btn cancelBtn">Cancelar</button>
        `;
  }

  function getTextWidth(text) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = "16px Arial";
    return context.measureText(text).width;
  }

  function applyChanges(button) {
    console.log("Ejecutando applychanges");

    const row = button.closest("tr");
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, index) => {
      if (index < cells.length - 1) {
        const input = cell.querySelector("input");
        if (input) {
          const dateInput = input.value;
          console.log("fecha final: ", dateInput);

          cell.textContent = dateInput;
        } else {
          const select = cell.querySelector("select");
          if (select) {
            cell.textContent = select.value;
          }
        }
      }
    });
    alert(
      "Cambios aplicados a la orden ID: " +
        row.querySelector(".rowid").textContent
    );
    restoreButtons(row);
  }

  function cancelChanges(button) {
    const row = button.closest("tr");
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, index) => {
      if (index < cells.length - 1) {
        const originalValue = cell.getAttribute("data-original-value");
        if (originalValue) {
          cell.textContent = originalValue;
        }
      } else if (index === cells.length - 1) {
        const originalValue = cell.getAttribute("data-original-value");
        if (originalValue) {
          cell.textContent = originalValue;
        }
      }
    });

    restoreButtons(row);
  }

  function restoreButtons(row) {
    const actionsCell = row.querySelector("td:last-child");
    const originalButtons = actionsCell.getAttribute("data-original-buttons");
    actionsCell.innerHTML = originalButtons;
  }
});

const getOrders = async (value) => {
  let status = value.toString().trim();
  console.log("status enviado al cliente: ", value);

  try {
    const response = await fetch(`${baseUrl}/updateOrders?status=${status}`);
    const data = await response.json();
    console.log(data);
    console.table(data);
    return data;
  } catch (error) {
    console.error("Error al obtener las ordenes", error);
  }
};
const updateContent = async (value) => {
  console.log("status enviado al cliente: ", value);
  const $emptyResults = document.querySelector(".no-elements");
  const orders = await getOrders(value);
  console.log(orders);
  const $fragment = document.createDocumentFragment();
  const $contentOrders = document.getElementById("content");
  const orden = [];
  $contentOrders.innerHTML = "";

  const propertyOrder = [
    "id",
    "title",
    "username",
    "loan_date",
    "return_date",
    "status",
  ];
  if (orders.data.length === 0) {
    $emptyResults.classList.remove("hidden");
  } else {
    $emptyResults.classList.add("hidden");
    orders.data.forEach((order) => {
      const $row = document.createElement("tr");

      propertyOrder.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(order, key)) {
          const $cell = document.createElement("td");
          $cell.className = `row${key}`;
          $cell.textContent = order[key];
          $cell.title = order[key];
          $row.appendChild($cell);

          if (key === "status") {
            const $cellButtons = document.createElement("td");
            const statusValue = order[key];

            const createButton = (className, textContent, disabled = false) => {
              const $btn = document.createElement("button");
              $btn.classList.add("btn", className);
              $btn.textContent = textContent;
              $btn.disabled = disabled;
              if (disabled) {
                $btn.classList.add("btn-disabled");
                $btn.classList.remove("btn");
              }
              return $btn;
            };

            if (statusValue === "Pendiente") {
              const $acceptBtn = createButton("acceptBtn", "Aprobar");
              const $rejectBtn = createButton("rejectBtn", "Rechazar");
              const $editBtn = createButton("editBtn", "Editar");

              $cellButtons.appendChild($editBtn);
              $cellButtons.appendChild($acceptBtn);
              $cellButtons.appendChild($rejectBtn);
            } else if (statusValue === "No devuelta") {
              const $receivedBtn = createButton("receivedBtn", "Recibido");
              const $editBtn = createButton("editBtn", "Editar");

              $cellButtons.appendChild($receivedBtn);
              $cellButtons.appendChild($editBtn);
            } else if (statusValue === "Devuelta") {
              const $acceptBtn = createButton("acceptBtn", "Aprobar", true);
              const $rejectBtn = createButton("rejectBtn", "Rechazar", true);
              const $editBtn = createButton("editBtn", "Editar", true);

              $cellButtons.appendChild($editBtn);
              $cellButtons.appendChild($acceptBtn);
              $cellButtons.appendChild($rejectBtn);
            }

            $row.appendChild($cellButtons);
          }
        }
      });

      $fragment.appendChild($row);
    });
    $contentOrders.appendChild($fragment);
  }
};

socket.on("new order", () => {
  updateContent("Pendiente");
});
