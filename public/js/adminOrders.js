const socket = io();
function cambiarFormatoFecha(fecha) {
  // Dividir la fecha en partes
  const partes = fecha.split("/");

  // Verificar si la fecha tiene el formato correcto
  if (partes.length !== 3) {
  const partes = fecha.split("-");
  const dia = partes[2];
  const mes = partes[1];
  const anio = partes[0];
  return `${anio}-${mes}-${dia}`;
    // throw new Error("Formato de fecha incorrecto. Use dd/mm/yyyy.");
  }

  // Extraer el día, mes y año
  const dia = partes[0];
  const mes = partes[1];
  const anio = partes[2];

  // Retornar la fecha en el nuevo formato
  return `${anio}-${mes}-${dia}`;
}

document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("orders-table");
  let isEditing = false; // Variable para rastrear si hay una fila editándose

  table.addEventListener("click", async function (event) {
    const $target = event.target;
    const $row = $target.closest("tr");

    if ($target.classList.contains("editBtn")) {
      // Verifica si ya hay una fila en edición
      if (!isEditing) {
        isEditing = true; // Establece el estado de edición
        editRow($target);
      }
    } else if ($target.classList.contains("applyBtn")) {
      try {
        const orderId = parseInt($row.querySelector(".rowid").textContent);
        const loanDate = $row.querySelector(".editable-input-1").value;
        const returnDate = $row.querySelector(".editable-input-2").value;
        const status = $row.querySelector(".editable-input-3").value;
        console.log("se procede a ejecutar el fetch");
        console.log(
          "datos desde el cliente: ",
          orderId,
          loanDate,
          returnDate,
          status
        );
        const result = await fetch(
          `http://localhost:3000/updateOrderRow?orderId=${orderId}&loanDate=${loanDate}&returnDate=${returnDate}&status=${status}`
        );
        console.log("se termino de ejecutar el fetch");

        applyChanges($target);
        if (!result.ok) {
          throw new Error("Error en la actualización");
        }
        isEditing = false; // Restablece el estado al aplicar cambios
      } catch (error) {
        console.log("Error al realizar update orders:", error);
        isEditing = false; // Asegúrate de restablecer el estado en caso de error
      }
    } else if ($target.classList.contains("cancelBtn")) {
      cancelChanges($target);
      isEditing = false; // Restablece el estado al cancelar cambios
    } else if ($target.classList.contains("rejectBtn")) {
      rejectOrder($target);
    } else if ($target.classList.contains("acceptBtn")) {
      acceptOrder($target);
    }
  });
  async function acceptOrder(button) {
    const row = button.closest("tr");
    const orderId = parseInt(row.querySelector(".rowid").textContent);
    const status = "No devuelta";
    const $notification = document.getElementById("notification");
    console.log("datos desde el cliente: ", orderId, status);

    try {
      const response = await fetch(`http://localhost:3000/updateOrderStatus1`, {
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
        // Eliminar la clase visible después de 500ms (coincide con la duración de la transición)
        $notification.classList.remove("success");
        $notification.textContent = '';
        // Añadir la clase hidden después de que la transición termine para ocultar el elemento
        setTimeout(() => {
          $notification.classList.add("hidden");
        }, 0); // 500ms para permitir que se complete la transición de opacidad a 0
      }, 3000); // Mantener el mensaje visible por 3 segundos antes de empezar a ocultarlo
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

    const classesToExtract = ["rowloan_date", "rowreturn_date", "rowstatus"];
    const filteredCells = Array.from(cells).filter((cell) => {
      return classesToExtract.some((className) =>
        cell.classList.contains(className)
      );
    });
    filteredCells.forEach((cell, index) => {
      console.log(cell, index);

      if (index < filteredCells.length - 1) {
        const originalValue = cambiarFormatoFecha(cell.textContent);
        console.log(originalValue);

        cell.setAttribute("data-original-value", originalValue);
        const input = document.createElement("input");
        input.type = "text";
        input.value = originalValue;
        // input.placeholder = originalValue;
        input.classList.add(`editable-input-${index + 1}`);
        input.id = `input-${index}`;
        input.style.width = `${getTextWidth(originalValue) + 10}px`;
        cell.innerHTML = "";
        cell.appendChild(input);
        if (input.id === "input-0" || input.id === "input-1") {
          flatpickr(input, {
            dateFormat: "Y-m-d",
            // altInput: true,
            altFormat: "d/m/Y",
            minDate: "today",
            maxDate:
              input.id === "input-1"
                ? new Date().fp_incr(20)
                : new Date().fp_incr(20),
          });
        }
      } else if (index === filteredCells.length - 1) {
        const originalValue = cell.textContent;
        cell.setAttribute("data-original-value", originalValue);
        const select = document.createElement("select");
        select.classList.add("editable-input-3");
        const options = ["Pendiente", "Devuelta", "No devuelta"];
        options.forEach((optionText) => {
          const option = document.createElement("option");
          option.value = optionText;
          option.textContent = optionText;
          select.appendChild(option);
        });
        select.value = originalValue; // Mantener el valor original seleccionado
        cell.innerHTML = "";
        cell.appendChild(select);
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
          const date = new Date(dateInput);
          const localDate = new Date(
            date.getTime() + date.getTimezoneOffset() * 60000
          );
          const formattedDate = localDate.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          cell.textContent = formattedDate;
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

// websocket
const getOrders = async () => {
  try {
    const response = await fetch(`http://localhost:3000/updateOrders`);
    const data = await response.json();
    console.log(data);
    console.table(data);
    return data;
  } catch (error) {
    console.error("Error al obtener las ordenes", error);
  }
};
const updateContent = async () => {
  const orders = await getOrders();
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

  orders.data.forEach((order) => {
    const $row = document.createElement("tr");

    propertyOrder.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(order, key)) {
        const $cell = document.createElement("td");
        $cell.className = `row${key}`;
        $cell.textContent = order[key];
        $row.appendChild($cell);

        // Si la clave es 'status', añade los botones
        if (key === "status") {
            const $cellButtons = document.createElement('td');
          const $acceptBtn = document.createElement("button");
          const $rejectBtn = document.createElement("button");
          const $editBtn = document.createElement("button");

        //   $acceptBtn.type = "button";
          $acceptBtn.classList.add("btn");
          $acceptBtn.classList.add("acceptBtn");
        //   $rejectBtn.type = "button";
          $rejectBtn.classList.add("btn");
          $rejectBtn.classList.add("rejectBtn");
        //   $editBtn.type = "button";
          $editBtn.classList.add("btn");
          $editBtn.classList.add("editBtn");

          $acceptBtn.textContent = "Aprobar";
          $rejectBtn.textContent = "Rechazar";
          $editBtn.textContent = "Editar";

          // Añade los botones a la fila
          $cellButtons.appendChild($editBtn);
          $cellButtons.appendChild($acceptBtn);
          $cellButtons.appendChild($rejectBtn);
          $row.appendChild($cellButtons);
        }
      }
    });

    $fragment.appendChild($row);
  });
  $contentOrders.appendChild($fragment);
};

socket.on("new order", () => {
  console.log("recibiendo el mensaje admin");
  updateContent();
});
