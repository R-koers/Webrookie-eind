// Cart.js - Beheert de winkelwagen functionaliteit
// Dit bestand zorgt ervoor dat je producten kunt toevoegen aan je winkelwagen en beheren

// Globale variabelen - deze variabelen kunnen overal in dit bestand gebruikt worden
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Functie om producten toe te voegen aan winkelwagen
// Deze functie wordt aangeroepen als je op "In winkelwagen" klikt
function addToCart(productId) {
    console.log('addToCart aangeroepen met productId:', productId);
    // Haal product informatie op uit localStorage (de browser opslag)
    // We hebben de producten eerder opgeslagen in localStorage voor snelle toegang
    const products = JSON.parse(localStorage.getItem('products')) || [];
    console.log('Producten uit localStorage:', products.length);
    // Zoek het juiste product op basis van de productId
    // find() zoekt door de lijst tot het het juiste product vindt
    const product = products.find(p => p.id === productId);
    console.log('Gevonden product:', product);
    // Check of het product bestaat
    if (!product) {
        console.error('Product niet gevonden:', productId);
        showNotification('Product niet gevonden. Probeer de pagina te verversen.');
        return;
    }
    // Valideer product data - check of alle belangrijke velden er zijn
    // Dit voorkomt problemen als er iets mis is met de product data
    if (!product.name || typeof product.price !== 'number' || !product.image) {
        console.error('Ongeldige product data:', product);
        showNotification('Product data is ongeldig. Probeer de pagina te verversen.');
        return;
    }
    // Check of product al in winkelwagen zit
    // Als het product al in de winkelwagen zit, verhoog dan alleen de hoeveelheid
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
        console.log('Hoeveelheid verhoogd voor bestaand product:', existingItem);
    } else {
        // Als het product nog niet in de winkelwagen zit, voeg het dan toe
        const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
        };
        cart.push(newItem);
        console.log('Nieuw product toegevoegd aan winkelwagen:', newItem);
    }
    // Sla winkelwagen op in localStorage (browser opslag)
    // Dit zorgt ervoor dat je winkelwagen bewaard blijft als je de pagina ververst
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Winkelwagen opgeslagen in localStorage:', cart);
    // Toon bevestiging aan de gebruiker
    showNotification(`${product.name} toegevoegd aan winkelwagen!`);
    // Update cart display - zorg ervoor dat de winkelwagen op de pagina wordt bijgewerkt
    updateCartDisplay();
}

// Functie om producten uit winkelwagen te verwijderen
// Deze functie wordt aangeroepen als je op het prullenbak icoon klikt
function removeFromCart(productId) {
    const foundItem = cart.find(item => item.id === productId);
    if (foundItem) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        showNotification(`${foundItem.name} verwijderd uit winkelwagen`);
    }
}

// Functie om hoeveelheid aan te passen
// Deze functie wordt aangeroepen als je op de + of - knoppen klikt
function updateQuantity(productId, newQuantity) {
    // Als de nieuwe hoeveelheid 0 of minder is, verwijder het product dan helemaal
    if (newQuantity <= 0) {
        const foundItem = cart.find(item => item.id === productId);
        if (foundItem) {
            removeFromCart(productId);
            showNotification(`${foundItem.name} verwijderd uit winkelwagen`);
        }
        return;
    }
    // Zoek het item en update de hoeveelheid
    const foundItem = cart.find(item => item.id === productId);
    if (foundItem) {
        const oldQuantity = foundItem.quantity;
        foundItem.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        // Toon een bericht over wat er is veranderd
        if (newQuantity > oldQuantity) {
            showNotification(`${foundItem.name} hoeveelheid verhoogd naar ${newQuantity}`);
        } else if (newQuantity < oldQuantity) {
            showNotification(`${foundItem.name} hoeveelheid verlaagd naar ${newQuantity}`);
        }
    }
}

// Functie om winkelwagen weer te geven
// Deze functie zorgt ervoor dat de winkelwagen mooi wordt getoond op de pagina
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    // Check of de HTML elementen bestaan
    if (!cartItems || !cartTotal) return;
    // Als de winkelwagen leeg is, toon dan een bericht
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-gray-500 text-center py-4">Je winkelwagen is leeg</p>';
        cartTotal.textContent = '€0,00';
        return;
    }
    // Filter out items with invalid data - verwijder items die kapot zijn
    // Dit voorkomt problemen als er iets mis is met de data
    const validCartItems = cart.filter(item => item &&
        item.id &&
        item.name &&
        typeof item.price === 'number' &&
        item.price > 0 &&
        item.image &&
        typeof item.quantity === 'number' &&
        item.quantity > 0,
    );
    // Update cart with only valid items - vervang de winkelwagen met alleen geldige items
    if (validCartItems.length !== cart.length) {
        cart.length = 0;
        cart.push(...validCartItems);
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    // Als er geen geldige items zijn, toon dan een lege winkelwagen
    if (validCartItems.length === 0) {
        cartItems.innerHTML = '<p class="text-gray-500 text-center py-4">Je winkelwagen is leeg</p>';
        cartTotal.textContent = '€0,00';
        return;
    }
    // Maak HTML voor alle items in de winkelwagen
    // map() maakt van elk item een HTML stukje
    const cartHTML = validCartItems.map(cartItem => `
        <div class="flex items-center space-x-2 py-2 border-b border-gray-200 last:border-b-0">
            <img src="${cartItem.image}" alt="${cartItem.name}" class="w-8 h-8 object-contain rounded flex-shrink-0">
            <div class="flex-1 min-w-0">
                <h4 class="text-xs font-medium text-gray-900 truncate">${cartItem.name}</h4>
                <p class="text-xs text-gray-500">€${cartItem.price.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="flex items-center space-x-1">
                <button onclick="updateQuantity(${cartItem.id}, ${cartItem.quantity - 1})"
                 class="text-gray-400 hover:text-gray-600 p-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                    </svg>
                </button>
                <span class="text-xs font-medium w-6 text-center">${cartItem.quantity}</span>
                <button onclick="updateQuantity(${cartItem.id}, ${cartItem.quantity + 1})"
                 class="text-gray-400 hover:text-gray-600 p-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </button>
                <button onclick="removeFromCart(${cartItem.id})" class="text-red-400 hover:text-red-600 p-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                         d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5
                         7m5 4v6m4-6v6m1-10V4a1
                         1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    cartItems.innerHTML = cartHTML;
    // Bereken totaal - vermenigvuldig prijs met hoeveelheid voor elk item en tel alles op
    const total = validCartItems.reduce((sum, filteredItem) => sum + (filteredItem.price * filteredItem.quantity), 0);
    cartTotal.textContent = `€${total.toFixed(2).replace('.', ',')}`;
}

// Functie om notificatie te tonen
// Deze functie maakt een popup bericht dat even verschijnt en dan weer verdwijnt
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 translate-x-full bg-green-500 text-white';
    notification.textContent = message;
    notification.style.cursor = 'pointer';
    notification.addEventListener('click', () => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    });
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Functie om cart modal te openen/sluiten
// Deze functie wordt aangeroepen als je op het winkelwagen icoon klikt
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.toggle('hidden');
        if (!modal.classList.contains('hidden')) {
            updateCartDisplay();
        }
    }
}

// Functie om winkelwagen te resetten
function resetCart() {
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
    showNotification('Winkelwagen is gereset');
}

// Functie om winkelwagen te legen
function clearCart() {
    if (cart.length === 0) {
        showNotification('Winkelwagen is al leeg');
        return;
    }
    const itemCount = cart.length;
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
    showNotification(`${itemCount} product${itemCount > 1 ? 'en' : ''} verwijderd uit winkelwagen`);
}

// Event listeners voor cart modal
document.addEventListener('DOMContentLoaded', function () {
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const modal = document.getElementById('cart-modal');

    if (openCartBtn) {
        openCartBtn.addEventListener('click', toggleCart);
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', toggleCart);
    }
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    if (modal) {
        modal.addEventListener('click',
            function (e) {
                if (e.target === modal) {
                    toggleCart();
                }
            });
    }
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click',
            function () {
                if (cart.length > 0) {
                    window.location.href = 'checkout.html';
                }
            });
    }
    // Update cart display bij het laden
    updateCartDisplay();
});

// Maak functies beschikbaar in globale scope
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleCart = toggleCart;
window.resetCart = resetCart;
window.clearCart = clearCart;