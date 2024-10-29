export function formatDate(dateInput) {
    // Verificar si el formato de entrada es dd/mm/yyyy
    const ddmmyyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    
    if (ddmmyyyyRegex.test(dateInput)) {
        // Si es en formato dd/mm/yyyy, convertir a Date
        const [day, month, year] = dateInput.split('/').map(Number);
        const date = new Date(year, month - 1, day); // Meses en JS son 0-indexed
        
        // Retornar en formato ISO (yyyy-mm-ddTHH:mm:ss.sssZ)
        return date.toISOString();
    } else {
        // Si no es un formato dd/mm/yyyy, se asume que es una fecha ISO
        const date = new Date(dateInput);
        
        // Verificar si la fecha es válida
        if (isNaN(date)) {
            throw new Error('Formato de fecha no válido');
        }
        
        // Retornar en formato dd/mm/yyyy
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Meses en JS son 0-indexed
        const year = date.getUTCFullYear();
        
        return `${day}/${month}/${year}`;
    }
}