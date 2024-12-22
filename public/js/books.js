document.addEventListener("DOMContentLoaded", function() {
    flatpickr("#publication_date", {
        dateFormat: "Y-m-d",
        minDate: "1900-01-01",
        maxDate: new Date().fp_incr(0),
        defaultDate: new Date().getFullYear(),
    });
});
