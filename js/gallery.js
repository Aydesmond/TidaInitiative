/* LIGHTBOX SCRIPT — place before closing </body> tag */
const galleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
let currentIndex = 0;

function openLightbox(img) {
  currentIndex = galleryImages.indexOf(img);
  document.getElementById('lightbox-img').src = img.src;
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

function changeImage(direction, event) {
  event.stopPropagation();
  currentIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
  document.getElementById('lightbox-img').src = galleryImages[currentIndex].src;
}

// Close with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') changeImage(1, { stopPropagation: () => {} });
  if (e.key === 'ArrowLeft') changeImage(-1, { stopPropagation: () => {} });
});