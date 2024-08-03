const $books = document.getElementById('books');
const $fragment = document.createDocumentFragment();
document.querySelector("select").addEventListener('change', () => {
  const selectedOption = event.target.options[event.target.selectedIndex];
  const selectedText = selectedOption.text;
  console.log('select funcionando', selectedOption.value, selectedText);
  
  fetch(`http://localhost:3000/books/category`)
  .then().then().catch();
});








const slides = document.querySelectorAll('.slide');
let currentIndex = 0;
const slideInterval = 4000; // Cambiar cada 3 segundos

function showSlide(index) {
  const slidesContainer = document.querySelector('.slides');
  const slideWidth = slides[0].clientWidth;
  slidesContainer.style.transform = `translateX(-${index * slideWidth}px)`;
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
}

setInterval(nextSlide, slideInterval);