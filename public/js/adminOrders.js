const socket = io();
const mensajes = {
  success: 'Operación exítosa!',
  failed: 'Operación fallida!',
}
function cambiarFormatoFecha(fecha) {
  // Verificar si la fecha contiene "/"
  if (fecha.includes("/")) {
    // Dividir la fecha en partes
    const partes = fecha.split("/");
    
    // Verificar si la fecha tiene el formato correcto
    if (partes.length !== 3) {
      throw new Error("Formato de fecha incorrecto. Use dd/mm/yyyy.");
    }

    // Extraer el día, mes y año
    const dia = partes[0];
    const mes = partes[1];
    const anio = partes[2];

    // Retornar la fecha en el nuevo formato
    return `${anio}-${mes}-${dia}`;
  } else if (fecha.includes("-")) {
    // Dividir la fecha en partes
    const partes = fecha.split("-");
    
    // Verificar si la fecha tiene el formato correcto
    if (partes.length !== 3) {
      throw new Error("Formato de fecha incorrecto. Use yyyy-mm-dd.");
    }

    // Extraer el año, mes y día
    const anio = partes[0];
    const mes = partes[1];
    const dia = partes[2];

    // Retornar la fecha en el nuevo formato
    return `${anio}-${mes}-${dia}`;
  } else {
    throw new Error("Formato de fecha incorrecto. Use dd/mm/yyyy o yyyy-mm-dd.");
  }
}

let isShowingStatus = false;
document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
      dropdown.addEventListener('click', (event) => {
          // Evita el cierre del dropdown si se hace clic dentro de él
          event.stopPropagation();
          dropdown.querySelector('.dropdown-content').classList.toggle('show');
      });

      // Obtiene todas las opciones del dropdown
      const options = dropdown.querySelectorAll('.dropdown-content a');

      options.forEach(option => {
          option.addEventListener('click', (event) => {
              event.preventDefault(); // Evita que el enlace haga scroll a la parte superior

              const value = option.getAttribute('data-value'); // Obtiene el valor de data-value
              handleDropdownSelection(value); // Llama a la función con el valor seleccionado

              // Cierra el dropdown
              dropdown.querySelector('.dropdown-content').classList.remove('show');
          });
      });
  });

  window.addEventListener('click', () => {
      dropdowns.forEach(dropdown => {
          dropdown.querySelector('.dropdown-content').classList.remove('show');
      });
  });
});

// Función que maneja la selección del dropdown
async function handleDropdownSelection(value) {
  switch (value) {
      case 'Pendiente':
          // Acción para Opción 1
          console.log('Seleccionaste Opción Pendiente');
          try {
            await updateContent('Pendiente');
            console.info('Operacion exitosa: ');
            
          } catch (error) {
            console.error('Error al actualizar ordenes: ',error);
          }
          break;
      case 'Devuelta':
          // Acción para Opción 2
          console.log('Seleccionaste Opción Devuelta');
          try {
            await updateContent('Devuelta');
            console.info('Operacion exitosa: ');
            
          } catch (error) {
            console.error('Error al actualizar ordenes: ',error);
          }
          break;
      case 'No devuelta':
          // Acción para Opción 3
          console.log('Seleccionaste Opción: ', value);
          try {
            await updateContent('No devuelta');
            console.info('Operacion exitosa: ');
            
          } catch (error) {
            console.error('Error al actualizar ordenes: ',error);
          }
          break;
      default:
          console.log('Opción no válida');
          break;
  }
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
        const $simpleReturnDate = $row.querySelector(".editable-input-2").value;
        const $simpleLoanDate = $row.querySelector(".editable-input-1").value;
        console.log('info de los inputs antes de formatear: ', $simpleLoanDate, $simpleReturnDate);
        
        const orderId = parseInt($row.querySelector(".rowid").textContent);
        const loanDate = cambiarFormatoFecha($simpleLoanDate);
        const returnDate = cambiarFormatoFecha($simpleReturnDate);
        console.log('info de los inputs despues de formatear: ', loanDate, returnDate);
        
        console.log("se procede a ejecutar el fetch");
        console.log(
          "datos desde el cliente: ",
          orderId,
          loanDate,
          returnDate,
        );
        const result = await fetch(
          `http://localhost:3000/updateOrderRow?orderId=${orderId}&loanDate=${loanDate}&returnDate=${returnDate}`
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
      acceptOrder($target, "No devuelta");
    } else if ($target.classList.contains("receivedBtn")) {
      acceptOrder($target, "Devuelta");
    }
  });
  async function rejectOrder(element){
    const $row = element.closest('tr');
    const $orderId = parseInt($row.querySelector(".rowid").textContent);
    const $notification = document.getElementById("notification");

    try {
      const response = await fetch('http://localhost:3000/deleteOrder', {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: $orderId,
        }),
      });
      const data = await response.json();
      $notification.textContent = data.success === true ? mensajes.success : mensajes.failed;
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
      $row.innerHTML = "";
    } catch (error) {
      $notification.textContent = mensajes.failed;
      $notification.classList.toggle("hidden");
      $notification.classList.toggle("error");
      console.error('Error al eliminar orden: ',error);
      
    }

  };
  // function showOptions(element) {
  //   if (element.classList.contains('t-status')){
  //     console.log('click en status');
  //     const $optionsContainer = document.createElement('div');
  //     const $fragment = document.createDocumentFragment();
  //     const options = ['Pendiente', 'Devuelto', 'No-devuelto' ]
  //     options.forEach((element) => {
  //       const $option = document.createElement('div');
  //       $option.textContent = element;
  //       $option.classList.add(`option-${element}`);
  //       $option.classList.add(`option`);
  //       $fragment.appendChild($option);
  //     });
      
  //     $optionsContainer.appendChild($fragment);
  //     $optionsContainer.classList.add('options');
  //     console.log('Regresando las opciones al dom:', $optionsContainer);
  //     element.appendChild($optionsContainer);
      
  //   } else if (element.classList.contains('t-loan-date')){
  //     console.log('click en loan date');
      
  //   } else if (element.classList.contains('t-return-date')){
  //     console.log('click en return date');
      
  //   }
  // };
  async function acceptOrder(button,value) {
    const row = button.closest("tr");
    const orderId = parseInt(row.querySelector(".rowid").textContent);
    const status = value.trim();
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
        // input.placeholder = originalValue;
        input.classList.add(`editable-input-${index + 1}`);
        input.id = `input-${index}`;
        input.style.width = `${getTextWidth(originalValue) + 10}px`;
        cell.innerHTML = "";
        cell.appendChild(input);
        if (input.id === "input-0" || input.id === "input-1") {
          flatpickr(input, {
            dateFormat: "d/m/Y",
            // altInput: true,
            altFormat: "d/m/Y",
            minDate: "today",
            maxDate:
              input.id === "input-1"
                ? new Date().fp_incr(20)
                : new Date().fp_incr(20),
          });
        }
      // } else if (index === filteredCells.length - 1) {
      //   const originalValue = cell.textContent;
      //   cell.setAttribute("data-original-value", originalValue);
      //   const select = document.createElement("select");
      //   select.classList.add("editable-input-3");
      //   const options = ["Pendiente", "Devuelta", "No devuelta"];
      //   options.forEach((optionText) => {
      //     const option = document.createElement("option");
      //     option.value = optionText;
      //     option.textContent = optionText;
      //     select.appendChild(option);
      //   });
      //   select.value = originalValue; // Mantener el valor original seleccionado
      //   cell.innerHTML = "";
      //   cell.appendChild(select);
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
          console.log('fecha para incrustar 1: ',dateInput);
          
          const date = new Date(dateInput);
          console.log('fecha para incrustar tipo date: ', date);
          
          const localDate = new Date(
            date.getTime() + date.getTimezoneOffset() * 60000
          );
          console.log('fecha local: ', localDate);
          
          const formattedDate = localDate.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          console.log('fecha final: ', formattedDate);
          
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

// websocket
const getOrders = async (value) => {
  let status = value.toString().trim();
  console.log('status enviado al cliente: ', value);
  
  try {
    const response = await fetch(`http://localhost:3000/updateOrders?status=${status}`);
    const data = await response.json();
    console.log(data);
    console.table(data);
    return data;
  } catch (error) {
    console.error("Error al obtener las ordenes", error);
  }
};
const updateContent = async (value) => {
  console.log('status enviado al cliente: ', value);
  const $emptyResults = document.querySelector('.no-elements');
  const orders = await getOrders(value);
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
// console.log("contenido de orders: ", orders);
if (orders.data.length === 0){
  $emptyResults.classList.remove('hidden');
} else {
  $emptyResults.classList.add('hidden');
  orders.data.forEach((order) => {
    const $row = document.createElement("tr");

    propertyOrder.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(order, key)) {
        const $cell = document.createElement("td");
        $cell.className = `row${key}`;
        $cell.textContent = order[key];
        $row.appendChild($cell);
    
        // Si la clave es 'status', añade los botones según el valor del status
        if (key === "status") {
          const $cellButtons = document.createElement('td');
          const statusValue = order[key];
    
          // Función para crear botones con clase y texto
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
  console.log("recibiendo el mensaje admin");
  updateContent('Pendiente');
});
