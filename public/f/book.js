const $showMore = document.getElementById("showMore");
$showMore.addEventListener('click', () => {
    const $description = document.getElementById('t1');
    
    // Obtener el valor actual de max-height usando getComputedStyle
    const currentMaxHeight = window.getComputedStyle($description).getPropertyValue('max-height');
    
    if (currentMaxHeight !== 'none') {
        $description.setAttribute('style', 'max-height: none; -webkit-mask-image: none;');
    } else {
        $description.setAttribute('style', 'max-height: 12em; -webkit-mask-image: linear-gradient(#000 60%, transparent);');
    }
});
