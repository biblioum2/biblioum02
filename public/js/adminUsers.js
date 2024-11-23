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
    const $users = document.getElementById('usersData');
    const $fragment = document.createDocumentFragment();

    let term = $input.value.trim();

    while ($users.firstChild) {
        $users.removeChild($users.firstChild);
    }

    if (term.length > 0) {
        const query = new URLSearchParams({ term });

        fetch(`https://biblioum02.onrender.com/admin/user/data?${query}`)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(json => {
                json.forEach(el => {
                    const $tr = document.createElement('tr');

                    const $tdId = document.createElement('td');
                    $tdId.textContent = el.user_id;
                    $tr.appendChild($tdId);

                    const $tdName = document.createElement('td');
                    $tdName.textContent = el.username;
                    $tr.appendChild($tdName);

                    const $tdEmail = document.createElement('td');
                    $tdEmail.textContent = el.email;
                    $tr.appendChild($tdEmail);

                    const $tdRole = document.createElement('td');
                    $tdRole.textContent = el.role;
                    $tr.appendChild($tdRole);

                    const $tdActions = document.createElement('td');
                    $tdActions.innerHTML = `
                        <button class="btn-edit" data-id="${el.user_id}">Editar</button>
                        <button class="btn-delete" data-id="${el.user_id}">Eliminar</button>
                    `;
                    $tr.appendChild($tdActions);
                    
                    $fragment.appendChild($tr);
                });
                $users.appendChild($fragment);
            })
            .catch(err => {
                console.error('Error desde fetch:', err);
            });
    } else {
        fetch('https://biblioum02.onrender.com/admin/users/data')
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(json => {
                json.forEach(el => {
                    const $tr = document.createElement('tr');

                    const $tdId = document.createElement('td');
                    $tdId.textContent = el.user_id;
                    $tr.appendChild($tdId);

                    const $tdName = document.createElement('td');
                    $tdName.textContent = el.username;
                    $tr.appendChild($tdName);

                    const $tdEmail = document.createElement('td');
                    $tdEmail.textContent = el.email;
                    $tr.appendChild($tdEmail);

                    const $tdRole = document.createElement('td');
                    $tdRole.textContent = el.role;
                    $tr.appendChild($tdRole);

                    const $tdActions = document.createElement('td');
                    $tdActions.innerHTML = `
                        <button class="btn-edit" data-id="${el.user_id}">Editar</button>
                        <button class="btn-delete" data-id="${el.user_id}">Eliminar</button>
                    `;
                    $tr.appendChild($tdActions);

                    $fragment.appendChild($tr);
                });
                $users.appendChild($fragment);
            })
            .catch(err => {
                console.error('Error desde fetch:', err);
            });
    }
};

const $input = document.getElementById('search-input');
const debouncedSearch = debounce(handleSearch, 300);
$input.addEventListener('input', debouncedSearch);

// Función para esconder la notificación después de cierto tiempo
function hideNotification() {
    const notification = document.querySelector('.notification');
    if (notification) {
        setTimeout(() => {
            notification.style.opacity = '0'; // Cambia la opacidad para desaparecer gradualmente
            setTimeout(() => {
                notification.style.display = 'none'; // Oculta la notificación después de desvanecerse
            }, 500);
        }, 2500); // 2500 milisegundos = 2.5 segundos
    }
}
hideNotification();

let rowBackup = document.createElement('tr');
// Función para manejar la eliminación de usuarios
document.addEventListener('click', async (event) => {
    const inEdition = document.getElementById('usersData').querySelector('td > input') ? true : null;
    console.log(inEdition);
    
    
    
    if (event.target.classList.contains('btn-delete')) {
        const userId = event.target.getAttribute('data-id');
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            fetch(`https://biblioum02.onrender.com/admin/users/${userId}`, {
                method: 'DELETE',
            })
            .then(res => {
                console.log('Respuesta del servidor:', res);
                return res.ok ? res.json() : res.json().then(data => Promise.reject(data));
            })
            .then(data => {
                console.log('Datos recibidos del servidor:', data);
                
                if (data.success) {
                    const row = document.querySelector(`tr[data-id="${userId}"]`);
                    if (row) {
                        row.remove();
                    }
                    alert('Usuario eliminado con éxito.');
                } else {
                    alert('Error al eliminar el usuario desde el servidor.');
                }
            })
            .catch(err => {
                console.error('Error desde fetch:', err);
                alert('Error al eliminar el usuario desde JS.');
            });
        }
    }else if(event.target.id === 'editBtn' && !inEdition){
        console.log('Editar usuario');
        
        // Lógica para editar usuarios
        const originalRow = event.target.closest('tr');
        console.log('Fila original',originalRow);
        
        rowBackup.innerHTML = originalRow.innerHTML;
        console.log('Copia de la fila',rowBackup);
        
        const cellsToEdit = originalRow.querySelectorAll('td:not(:first-child)');
        console.log('Celdas a editar',cellsToEdit);
        
        cellsToEdit.forEach((cell, indexCell) => {
          console.log('Celda',cell, indexCell);
          
            if (indexCell !== 4 && indexCell !== 3 && indexCell !== 1) {
                const text = cell.textContent;
                cell.innerHTML = `<input type="text" value="${text}">`;
            }else if(indexCell === 3){
                const text = cell.textContent;
                cell.innerHTML = `<select name="role" id="role">
                <option value="admin">Admin</option>
                <option value="student">Student</option>
                </select>`;

            }else if(indexCell === 1){
                const text = cell.textContent;
                cell.innerHTML = `<input type="email" value="${text}">`;
            }else{
                const buttonAccept = document.createElement('button');
                const buttonCancel = document.createElement('button');
                buttonAccept.textContent = 'Aceptar';
                buttonCancel.textContent = 'Cancelar';
                buttonAccept.classList.add('btn-accept');
                buttonCancel.classList.add('btn-cancel');
                buttonAccept.id = 'acceptBtn';
                buttonCancel.id = 'cancelBtn';
                cell.innerHTML = '';
                cell.appendChild(buttonAccept);
                cell.appendChild(buttonCancel);
            }
        });

        console.log('Celdas a editar',cellsToEdit);
        
    }else if(event.target.id === 'cancelBtn'){
        console.log('Cancelar edición');
        const row = event.target.closest('tr');
        isEditing = false;
        restoreRow(row, rowBackup);

    }else if(event.target.id === 'acceptBtn'){
        const row = event.target.closest('tr');
        const userId = row.getAttribute('data-id');
        const name = row.querySelector('td:nth-child(2) > input').value;
        const email = row.querySelector('td:nth-child(3) > input').value;
        const password = row.querySelector('td:nth-child(4) > input').value;
        const role = row.querySelector('td:nth-child(5) > select').value;
        const nameBackup = rowBackup.querySelector('td:nth-child(2)').textContent;
        const emailBackup = rowBackup.querySelector('td:nth-child(3)').textContent;
        const passwordBackup = rowBackup.querySelector('td:nth-child(4)').textContent;
        const roleBackup = rowBackup.querySelector('td:nth-child(5)').textContent;

        try {
            if(name === '' || email === '' || password === ''){
                alert('Todos los campos son obligatorios');
                return;
            }
            if(name === nameBackup && email === emailBackup && password === passwordBackup && role === roleBackup){
                alert('No se ha modificado ningún campo');
                return;
            }
            if(password.length < 8){
                alert('La contraseña debe tener al menos 8 caracteres');
                return;
            }
            if (password.length > 20) {
              alert('La contraseña no puede tener más de 20 caracteres');
              return;
            }
            if(role !== 'admin' && role !== 'student'){
                alert('El rol debe ser admin o student');
                return;
            }
            if(!email.includes('@')){
                alert('El email debe contener un @');
                return;
            }
            if(!email.includes('.')){
                alert('El email debe contener un .');
                return;
            }
            if(confirm('¿Estás seguro de que deseas editar este usuario?')){
              console.log('Editar usuario');
              
              const response = await fetch(`https://biblioum02.onrender.com/admin/users/${userId}`, {
                  method: 'PATCH',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ name, email, ...(password !== passwordBackup && { password }), role }),
              });
              console.log('Respuesta del servidor:', response);
              const data = await response.json();
              console.log('Datos recibidos del servidor:', data);
              if (data.success) {
                  const cells = row.querySelectorAll('td');
                  console.log('Celdas',cells);
                  
                  cells[1].textContent = name;
                  cells[2].textContent = email;
                  cells[3].textContent = "Password";
                  cells[4].textContent = role;
                  cells[5].innerHTML = `
                      <button id="editBtn" class="btn-edit">Editar</button>
                                  <button class="btn-delete" data-id="${userId}}">Eliminar</button>`
                  alert('Usuario editado con éxito.');
                  return;
              } else {
                  alert('Error al editar el usuario desde el servidor.');
                  return;
              }
            }
        } catch (error) {
            alert('Error al editar el usuario desde JS.');
            return;
        }
        
    }
    else if(event.target.id === 'editBtn' && inEdition){
        alert('Ya hay una fila en edición');
    }
});

function restoreRow(row, rowBackup) {
    console.log(rowBackup);
    
    row.innerHTML = rowBackup.innerHTML;
}

// Manejo de la paginación 👇 ----------------------------------------------------------------

async function calculateTotalUserPages() {
    
    try {
      const response = await fetch(
        `https://biblioum02.onrender.com/admin/users/total`
      );
      console.log('Respuesta del servidor:', response);
      
      const totalUsers = await response.json();
      console.log('Total de usuarios:', totalUsers);
      
      const pages =
        Math.ceil(parseInt(totalUsers) / 10) < 1
          ? 1
          : Math.ceil(parseInt(totalUsers) / 10);
          console.log('Páginas totales:', pages);
          
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
  const updateUsersTable = async (page) => {
    const offset = page * 10 - 10;
    // console.log("esta es la pagina", page);
    console.log("este es el offset", offset);
    
    try {
      const totalUsers = await fetch(
        `https://biblioum02.onrender.com/admin/users/data?offset=${offset}`
      );
      const data = await totalUsers.json();
      console.log('Datos de usuarios:', data);
      const $usersRows = document.getElementById("usersData");
      $usersRows.innerHTML = "";
      const $fragment = document.createDocumentFragment();
      data.forEach((user) => {
        const $tr = document.createElement("tr");
        $tr.dataset.id = user.user_id;
        $tr.innerHTML = `
          <td>${user.user_id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>Password</td>
          <td>${user.role}</td>
          <td>
            <button id="editBtn" class="btn-edit">Editar</button>
            <button class="btn-delete" data-id="${user.user_id}">Eliminar</button>
          </td>
        `;
        $fragment.appendChild($tr);
      });
      $usersRows.appendChild($fragment);
      
    } catch (error) {
      console.log(error);
    }
  };
  
  const handlePaginationClick = async (event) => {
    const page = parseInt(event.target.dataset.page);
    const totalBooksPages = await calculateTotalUserPages();
    const totalPages = parseInt(totalBooksPages);
    uploadPaginationButtons(page, totalPages);
    updateUsersTable(page);
    // window.scrollTo({ top: 950, behavior: 'smooth' });
  };
  
  // Funciones para manejar los clics en los botones de navegación
  const handlePrevClick = async () => {
    const totalBooksPages = await calculateTotalUserPages();
    const currentPage = parseInt(
      document.querySelector(".pagination-btn-focus").dataset.page
    );
    const totalPages = parseInt(totalBooksPages);
    if (currentPage > 1) {
      uploadPaginationButtons(currentPage - 1, totalPages);
      updateUsersTable(currentPage - 1);
      // window.scrollTo({ top: 950, behavior: 'smooth' });
    }
  };
  
  const handleNextClick = async () => {
    const totalBooksPages = await calculateTotalUserPages();
    const currentPage = parseInt(
      document.querySelector(".pagination-btn-focus").dataset.page
    );
    const totalPages = parseInt(totalBooksPages);
    if (currentPage < totalPages) {
      uploadPaginationButtons(currentPage + 1, totalPages);
      updateUsersTable(currentPage + 1);
      // window.scrollTo({ top: 950, behavior: 'smooth' });
    }
  };
  
  // Inicializa la paginación con valores predeterminados
  document.addEventListener("DOMContentLoaded", async () => {
    const initialPage = 1; 
    uploadPaginationButtons(initialPage, await calculateTotalUserPages());
  });