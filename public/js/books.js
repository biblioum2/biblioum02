document.addEventListener("DOMContentLoaded", function() {
    flatpickr("#publication_date", {
        dateFormat: "Y-m-d", // Muestra solo el año
        minDate: "1900-01-01", // Año mínimo
        maxDate: new Date().fp_incr(0), // Año máximo: el actual
        defaultDate: new Date().getFullYear(), // Fecha por defecto: el año actual
    });
});
