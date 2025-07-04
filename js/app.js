// Dit script beheert alleen de carousel functionaliteit voor de hoofdpagina.
// Een carousel is een slideshow die automatisch door producten heen gaat

// Wacht tot de pagina volledig geladen is voordat we de carousel starten
document.addEventListener('DOMContentLoaded', function () {
    // Zoek de belangrijke elementen op de pagina
    const carousel = document.getElementById('carousel');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    // Check of alle elementen bestaan, anders kunnen we niks doen
    if (!carousel || !prevBtn || !nextBtn) {
        console.log('Carousel elementen niet gevonden - misschien zijn de HTML elementen er niet?');
        return;
    }
    // Zoek alle slides (carousel items) en houd bij welke slide nu actief is
    const items = carousel.querySelectorAll('.carousel-item');
    let currentIndex = 0;
    // Functie om naar een specifieke slide te gaan
    // Dit zorgt ervoor dat we oneindig door kunnen blijven gaan (van laatste naar eerste en andersom)
    function goToSlide(index) {
        // Als we voorbij de eerste slide gaan, ga naar de laatste
        if (index < 0) {
            index = items.length - 1;
        } else if (index >= items.length) {
            index = 0;
        }
        // Update welke slide nu actief is
        currentIndex = index;
        // Bereken hoeveel pixels we moeten verschuiven (elke slide is 100% breed)
        const translateX = -currentIndex * 100;
        // Verschuif de carousel naar de juiste positie (CSS transform)
        carousel.style.transform = `translateX(${translateX}%)`;
    }
    // Event listeners voor de knoppen
    prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
    });
    nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
    });
    // Auto-play functionaliteit - de carousel gaat automatisch door
    // setInterval betekent: doe dit elke X milliseconden (5000ms = 5 seconden)
    let autoPlayInterval = setInterval(() => {
        goToSlide(currentIndex + 1);
    }, 5000);
    // Pause auto-play bij hover - als je met je muis over de carousel gaat, stopt het automatisch
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });
    // Resume auto-play bij mouse leave - als je je muis weg haalt, gaat het weer automatisch
    carousel.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000);
    });
    // Keyboard navigatie - je kunt ook de pijltjestoetsen gebruiken
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            goToSlide(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
            goToSlide(currentIndex + 1);
        }
    });
    // Log hoeveel slides er zijn gevonden (voor debugging)
    console.log('Carousel geïnitialiseerd met', items.length, 'slides');
});
