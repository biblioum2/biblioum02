export function getCookie(nombre) {
    // Divide las cookies en un array usando el delimitador "; "
    const cookies = document.cookie.split('; ');
  
    // Busca la cookie deseada
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
  
        // Verifica si la cookie comienza con el nombre deseado
        if (cookie.startsWith(nombre + '=')) {
            // Devuelve el valor de la cookie (parte después del "=")
            return cookie.substring(nombre.length + 1);
        }
    }
  
    // Si la cookie no se encuentra, devuelve null
    return null;
  }
