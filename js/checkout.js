// Checkout functionality
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Filter valid cart items
    const validCartItems = cart.filter(item => 
        item && 
        item.id && 
        item.name && 
        typeof item.price === 'number' && 
        item.price > 0 &&
        item.image &&
        typeof item.quantity === 'number' && 
        item.quantity > 0
    );
    
    if (validCartItems.length === 0) {
        showEmptyCartMessage();
        return;
    }
    
    // Display order items
    const itemsHTML = validCartItems.map(item => `
        <div class="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
            <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-contain rounded flex-shrink-0">
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 truncate">${item.name}</h4>
                <p class="text-xs text-gray-500">Aantal: ${item.quantity}</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-medium text-gray-900">€${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
            </div>
        </div>
    `).join('');
    
    orderItems.innerHTML = itemsHTML;
    
    // Calculate totals
    const subtotal = validCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 60 ? 0 : 4.95; // Free shipping above €60
    const vat = subtotal * 0.21; // 21% BTW
    const total = subtotal + shipping + vat;
    
    // Update summary
    subtotalElement.textContent = `€${subtotal.toFixed(2).replace('.', ',')}`;
    shippingElement.textContent = shipping === 0 ? 'Gratis' : `€${shipping.toFixed(2).replace('.', ',')}`;
    vatElement.textContent = `€${vat.toFixed(2).replace('.', ',')}`;
    totalElement.textContent = `€${total.toFixed(2).replace('.', ',')}`;
    
    // Store totals for payment simulation
    window.orderTotals = {
        subtotal: subtotal,
        shipping: shipping,
        vat: vat,
        total: total
    };
}

// Show empty cart message
function showEmptyCartMessage() {
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center">
                    <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                    </svg>
                    <h2 class="text-xl font-semibold text-gray-900 mb-2">Je winkelwagen is leeg</h2>
                    <p class="text-gray-600 mb-6">Voeg producten toe aan je winkelwagen om af te rekenen.</p>
                    <a href="parts.html" class="bg-blue-950 hover:bg-blue-900 text-white py-2 px-6 rounded-lg transition-colors duration-300">
                        Bekijk producten
                    </a>
                </div>
            </div>
        `;
    }
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    
    // Real-time validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
    
    // Form submission
    form.addEventListener('submit', handleFormSubmission);
}

// Validate individual field
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remove existing error
    clearFieldError(event);
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Dit veld is verplicht');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Voer een geldig e-mailadres in');
            return false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Voer een geldig telefoonnummer in');
            return false;
        }
    }
    
    // Postal code validation (Dutch format)
    if (field.id === 'postal-code' && value) {
        const postalRegex = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i;
        if (!postalRegex.test(value)) {
            showFieldError(field, 'Voer een geldige postcode in (bijv. 1234 AB)');
            return false;
        }
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    // Remove existing error
    clearFieldError({ target: field });
    
    // Add error styling
    field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    errorDiv.id = `${field.id}-error`;
    
    // Insert after field
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(event) {
    const field = event.target;
    const errorDiv = document.getElementById(`${field.id}-error`);
    
    if (errorDiv) {
        errorDiv.remove();
    }
    
    field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
}

// Handle form submission
function handleFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate all required fields
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
    
    // Check if cart has items
    if (!cart || cart.length === 0) {
        showNotification('Je winkelwagen is leeg', 'error');
        return;
    }
    
    // Simulate payment processing
    simulatePayment(formData);
}

// Setup payment simulation
function setupPaymentSimulation() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', updatePaymentUI);
    });
}

// Update payment UI based on selected method
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
    }
    
    placeOrderBtn.textContent = buttonText;
}

// Simulate payment processing
function simulatePayment(formData) {
    const placeOrderBtn = document.getElementById('place-order-btn');
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    
    if (!placeOrderBtn || !selectedMethod) return;
    
    // Disable button and show loading
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Betaling verwerken...
    `;
    
    // Simulate payment processing delay
    setTimeout(() => {
        const method = selectedMethod.value;
        let success = true;
        
        // Simulate different success rates for different payment methods
        switch (method) {
            case 'ideal':
                success = Math.random() > 0.1; // 90% success rate
                break;
            case 'creditcard':
                success = Math.random() > 0.05; // 95% success rate
                break;
            case 'paypal':
                success = Math.random() > 0.15; // 85% success rate
                break;
        }
        
        if (success) {
            // Payment successful
            processSuccessfulOrder(formData);
        } else {
            // Payment failed
            handlePaymentFailure();
        }
        
        // Re-enable button
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Bestelling plaatsen';
    }, 2000 + Math.random() * 2000); // Random delay between 2-4 seconds
}

// Process successful order
function processSuccessfulOrder(formData) {
    // Generate order number
    const orderNumber = 'VEX-' + Date.now().toString().slice(-8) + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    
    // Create order object
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
                country: formData.get('country')
            }
        },
        items: cart,
        totals: window.orderTotals,
        paymentMethod: formData.get('payment-method'),
        notes: formData.get('order-notes'),
        orderDate: new Date().toISOString(),
        status: 'confirmed'
    };
    
    // Store order in localStorage (in real app, this would go to a database)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    localStorage.removeItem('cart');
    
    // Show success modal
    showSuccessModal(orderNumber);
    
    // Send confirmation email (simulated)
    simulateEmailConfirmation(order);
}

// Handle payment failure
function handlePaymentFailure() {
    showNotification('Betaling mislukt. Probeer het opnieuw of kies een andere betaalmethode.', 'error');
    
    // Shake the form to indicate error
    const form = document.getElementById('checkout-form');
    form.classList.add('animate-pulse');
    setTimeout(() => {
        form.classList.remove('animate-pulse');
    }, 1000);
}

// Show success modal
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

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full ${
        type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Export functions for global access
window.loadOrderSummary = loadOrderSummary;
window.showNotification = showNotification;
