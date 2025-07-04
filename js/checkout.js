// Checkout functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
document.addEventListener('DOMContentLoaded',
    function () {
    // Initialize checkout
        loadOrderSummary();
        setupFormValidation();
        setupPaymentSimulation();
        // Check if cart is empty
        if (!cart || cart.length === 0) {
            showEmptyCartMessage();
        }
    });

// Load order summary from cart
function loadOrderSummary() {
    const orderItems = document.getElementById('order-items');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const vatElement = document.getElementById('vat');
    const totalElement = document.getElementById('total');
    if (!orderItems || !cart || cart.length === 0) {
        showEmptyCartMessage();
        return;
    }
    // Filter  items
    const validCartItems = cart.filter(item => item &&
        item.id &&
        item.name &&
        typeof item.price === 'number' &&
        item.price > 0 &&
        item.image &&
        typeof item.quantity === 'number' &&
        item.quantity > 0,
    );
    if (validCartItems.length === 0) {
        showEmptyCartMessage();
        return;
    }
    // laat de items zien
    const itemsHTML = validCartItems.map(item => `
        <div class="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
            <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-contain rounded flex-shrink-0">
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 truncate">${item.name}</h4>
                <p class="text-xs text-gray-500">Aantal: ${item.quantity}</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-medium text-gray-900"> +
                €${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
            </div>
        </div>
    `).join('');
    orderItems.innerHTML = itemsHTML;
    // Calculate totals
    const subtotal = validCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 60 ? 0 : 4.95; // gratis verzending boven de 60 euro
    const vat = subtotal * 0.21; // 21% BTW
    const total = subtotal + shipping + vat;
    // Update
    subtotalElement.textContent = `€${subtotal.toFixed(2).replace('.', ',')}`;
    shippingElement.textContent = shipping === 0 ? 'Gratis' : `€${shipping.toFixed(2).replace('.', ',')}`;
    vatElement.textContent = `€${vat.toFixed(2).replace('.', ',')}`;
    totalElement.textContent = `€${total.toFixed(2).replace('.', ',')}`;
    //  sla totals op
    window.orderTotals = {
        subtotal: subtotal,
        shipping: shipping,
        vat: vat,
        total: total,
    };
}

// laat zien dat de cart leeg is
function showEmptyCartMessage() {
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center">
                    <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                         d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2
                          0 01-2 2H9a2 2 0 01-2-2v-6m6
                         0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                    </svg>
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">Je winkelwagen is leeg</h2>
                    <p class="text-gray-600 mb-6">Voeg producten toe aan je winkelwagen om af te rekenen.</p>
                    <a href="parts.html" class="bg-blue-950 hover:bg-blue-900
                    text-white py-2 px-6 rounded-lg transition-colors duration-300">
                        Bekijk producten
                    </a>
                </div>
            </div>
        `;
    }
}

// Setup voor form validatie
function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    // real time validatie
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
    // Form submissie
    form.addEventListener('submit', handleFormSubmission);
}

// Validatie van individuele fields
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    // verwijder de error
    clearFieldError(event);
    // Check of de required field leeg is of niet
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Dit veld is verplicht');
        return false;
    }
    // Email validatie
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Voer een geldig e-mailadres in');
            return false;
        }
    }
    // telefoon nummer validatie
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Voer een geldig telefoonnummer in');
            return false;
        }
    }
    // post code validatie (voor nederlandse postcodes)
    if (field.id === 'postal-code' && value) {
        const postalRegex = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i;
        if (!postalRegex.test(value)) {
            showFieldError(field, 'Voer een geldige postcode in (bijv. 1234 AB)');
            return false;
        }
    }
    return true;
}

// Show error field als er iets fout gaat bij de betaling
function showFieldError(field, message) {
    // verwijder bestaaande error
    clearFieldError({ target: field });
    // voeg error styling toe
    field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
    // Creeer error bericht
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    errorDiv.id = `${field.id}-error`;
    // Insert na de field
    field.parentNode.appendChild(errorDiv);
}

// verwijder field errors
function clearFieldError(event) {
    const field = event.target;
    const errorDiv = document.getElementById(`${field.id}-error`);
    if (errorDiv) {
        errorDiv.remove();
    }
    field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
}

// Handel form submissie af
function handleFormSubmission(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    // validatie voor alle fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    if (!isValid) {
        showNotification('Vul alle verplichte velden correct in', 'error');
        return;
    }
    // Check of er items in de winkelwagen zitten
    if (!cart || cart.length === 0) {
        showNotification('Je winkelwagen is leeg', 'error');
        return;
    }
    // Simuleer betaling
    simulatePayment(formData);
}

// Setup betalings simulatie
function setupPaymentSimulation() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', updatePaymentUI);
    });
}

// Update de betalings ui gebasseerd op betalings wijze
function updatePaymentUI() {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (!selectedMethod || !placeOrderBtn) return;
    const method = selectedMethod.value;
    let buttonText = 'Bestelling plaatsen';
    switch (method) {
        case 'ideal':
            buttonText = 'Betaling via iDEAL';
            break;
        case 'creditcard':
            buttonText = 'Betaling via Creditcard';
            break;
        case 'paypal':
            buttonText = 'Betaling via PayPal';
            break;
        default:
            buttonText = 'Bestelling plaatsen';
            break;
    }
    placeOrderBtn.textContent = buttonText;
}

// Simuleer betalings process
function simulatePayment(formData) {
    const placeOrderBtn = document.getElementById('place-order-btn');
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    if (!placeOrderBtn || !selectedMethod) return;
    //  disable de button
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962
             0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Betaling verwerken...
    `;
    // simuleer betalings process
    setTimeout(() => {
        const method = selectedMethod.value;
        let success = true;
        // Simuleer sucess hoeveelheid per betaling
        switch (method) {
            case 'ideal':
                success = Math.random() > 0.1;
                break;
            case 'creditcard':
                success = Math.random() > 0.05;
                break;
            case 'paypal':
                success = Math.random() > 0.15;
                break;
            default:
                success = true;
                break;
        }
        if (success) {
            // betaling successvol
            processSuccessfulOrder(formData);
        } else {
            // betaling gefaald
            handlePaymentFailure();
        }
        // re enable button
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Bestelling plaatsen';
    }, 2000 + Math.random() * 2000); // willekeurig delay tussen 2000  ms
}

// Process voor een successvol order
function processSuccessfulOrder(formData) {
    // Genereer order nummer
    const orderNumber = 'VEX-' + Date.now().toString().slice(-8) + '-' +
     Math.random().toString(36).substr(2, 4).toUpperCase();
    // Creeer order object
    const order = {
        orderNumber: orderNumber,
        customer: {
            firstName: formData.get('first-name'),
            lastName: formData.get('last-name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: {
                street: formData.get('street'),
                postalCode: formData.get('postal-code'),
                city: formData.get('city'),
                country: formData.get('country'),
            },
        },
        items: cart,
        totals: window.orderTotals,
        paymentMethod: formData.get('payment-method'),
        notes: formData.get('order-notes'),
        orderDate: new Date().toISOString(),
        status: 'confirmed',
    };
    // sla order op in local storage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    // clear de winkelwagen
    cart = [];
    localStorage.removeItem('cart');
    // laat success modal zien
    showSuccessModal(orderNumber);
    // Stuur simulatie conformatie
    simulateEmailConfirmation(order);
}

// handel betalings fouten
function handlePaymentFailure() {
    showNotification('Betaling mislukt. Probeer het opnieuw of kies een andere betaalmethode.', 'error');
    // sdit schud de form als er een fout is
    const form = document.getElementById('checkout-form');
    form.classList.add('animate-pulse');
    setTimeout(() => {
        form.classList.remove('animate-pulse');
    }, 1000);
}

// laat success modal zien
function showSuccessModal(orderNumber) {
    const modal = document.getElementById('success-modal');
    const orderNumberElement = document.getElementById('order-number');
    if (modal && orderNumberElement) {
        orderNumberElement.textContent = orderNumber;
        modal.classList.remove('hidden');
    }
}

// Simulate email confirmation
function simulateEmailConfirmation(order) {
    console.log('📧 Simulated email confirmation sent to:', order.customer.email);
    console.log('📦 Order details:', order);
    // In a real application, this would send an actual email
    // For now, we just log it to the console
}

// laat notificatie zien
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 translate-x-full ${
        type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`;
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

// exporteer de functies
window.loadOrderSummary = loadOrderSummary;
window.showNotification = showNotification;
