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

        fetch(`http://localhost:3000/admin/user/data?${query}`)
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
        fetch('http://localhost:3000/admin/users/data')
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

// Función para manejar la eliminación de usuarios
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-delete')) {
        const userId = event.target.getAttribute('data-id');
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            fetch(`http://localhost:3000/admin/users/${userId}`, {
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
    }
});


//Funcion para validar los datos del formulario

