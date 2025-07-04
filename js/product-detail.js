// Product Detail Page - Laadt en toont product informatie

// Globale variabelen
let currentProduct = null;
let allProducts = [];

// Functie om URL parameters te lezen
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Functie om producten te laden
async function loadProducts() {
    try {
        // Probeer eerst uit localStorage te laden
        const cachedProducts = localStorage.getItem('products');
        const cacheTimestamp = localStorage.getItem('productsTimestamp');
        const now = Date.now();
        const cacheAge = now - (cacheTimestamp || 0);

        // Cache is geldig voor 1 uur (3600000 ms)
        if (cachedProducts && cacheAge < 3600000) {
            allProducts = JSON.parse(cachedProducts);
            console.log('Producten geladen uit localStorage:', allProducts.length);
            return allProducts;
        }

        // Anders fetch van products.json
        console.log('Producten laden van server...');
        const response = await fetch('products.json');
        const data = await response.json();
        allProducts = data.components;
        // Sla op in localStorage
        localStorage.setItem('products', JSON.stringify(allProducts));
        localStorage.setItem('productsTimestamp', now);
        console.log('Producten geladen van server en opgeslagen in localStorage:', allProducts.length);
        return allProducts;
    } catch (error) {
        console.error('Fout bij het laden van producten:', error);
        return [];
    }
}

// Functie om product te laden op basis van ID
function loadProductById(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        showErrorState();
        return null;
    }
    return product;
}

// Functie om product informatie weer te geven
function displayProduct(product) {
    // Update page title

    document.title = `${product.name} - Vexaparts`;
    // Update breadcrumb

    const category = getProductCategory(product);
    const categoryText = getCategoryDisplayName(category);
    document.getElementById('product-category').textContent = categoryText;
    document.getElementById('product-category-text').textContent = categoryText;
    // Update product image

    const productImage = document.getElementById('product-image');
    productImage.src = product.image;
    productImage.alt = product.name;
    // Update product name

    document.getElementById('product-name').textContent = product.name;
    // Update product price

    document.getElementById('product-price').textContent = `€${product.price.toFixed(2).replace('.', ',')}`;
    // Update product description

    const description = generateProductDescription(product);
    document.getElementById('product-description').textContent = description;
    // Update specifications

    displaySpecifications(product);
    // Update related products

    displayRelatedProducts(product);
    // Setup add to cart button

    setupAddToCartButton(product);
    // Show product details
    document.getElementById('loading').style.display = 'none';
    document.getElementById('product-details').classList.remove('hidden');
}

// Functie om product categorie te bepalen
function getProductCategory(product) {
    const name = product.name.toLowerCase();
    const specs = Object.values(product.specifications || {}).join(' ').toLowerCase();
    if (name.includes('gpu') || name.includes('graphics') || specs.includes('gpu') || specs.includes('graphics')) {
        return 'gpu';
    } else if (name.includes('memory') || name.includes('ram') || specs.includes('ddr')) {
        return 'memory';
    } else if (name.includes('ssd') || name.includes('hdd') || name.includes('storage') || specs.includes('storage')) {
        return 'storage';
    } else if (name.includes('cooler') || name.includes('cooling') || specs.includes('cooling')) {
        return 'cooling';
    } else if (name.includes('motherboard') || specs.includes('motherboard')) {
        return 'motherboard';
    } else if (name.includes('psu') || name.includes('power') || specs.includes('power')) {
        return 'psu';
    } else if (name.includes('cpu') || name.includes('processor') || specs.includes('processor')) {
        return 'cpu';
    }
    return 'other';
}

// Functie om categorie display naam te krijgen
function getCategoryDisplayName(category) {
    const categoryNames = {
        cpu: 'Processor',
        gpu: 'Grafische Kaart',
        memory: 'Geheugen',
        storage: 'Opslag',
        motherboard: 'Moederbord',
        psu: 'Voeding',
        cooling: 'Koeling',
        other: 'Overig',
    };
    return categoryNames[category] || 'Overig';
}

// Functie om product beschrijving te genereren
function generateProductDescription(product) {
    const category = getProductCategory(product);
    const categoryName = getCategoryDisplayName(category);
    let description = `Deze ${categoryName.toLowerCase()} van ${product.name} +
     biedt uitstekende prestaties voor uw PC build. `;
    if (product.specifications) {
        const specs = Object.values(product.specifications);
        if (specs.length > 0) {
            description += `Met specificaties zoals +
            ${specs.slice(0, 3).join(', ')} levert dit product betrouwbare en snelle prestaties. `;
        }
    }
    description += `Perfect voor gaming, werkstations +
     of algemeen gebruik. Leverbaar met gratis verzending en 2 jaar garantie.`;
    return description;
}

// Functie om specificaties weer te geven
function displaySpecifications(product) {
    const specsContainer = document.getElementById('specifications');
    if (!product.specifications || Object.keys(product.specifications).length === 0) {
        specsContainer.innerHTML = '<div class="p-4 text-gray-500  text-center">"Geen specificaties beschikbaar</div>';
        return;
    }
    const specsHTML = Object.entries(product.specifications).map(([key, value]) => `
        <div class="flex justify-between items-center py-3 px-4">
            <dt class="text-sm font-medium
            text-gray-900 capitalize">${key.replace(/_/g, ' ')}</dt>
            <dd class="text-sm text-gray-600">${value}</dd>
        </div>
    `).join('');
    specsContainer.innerHTML = specsHTML;
}

// Functie om gerelateerde producten weer te geven
function displayRelatedProducts(product) {
    const relatedContainer = document.getElementById('related-products');
    const currentCategory = getProductCategory(product);
    // Filter producten van dezelfde categorie, maar niet het huidige product
    const relatedProducts = allProducts
        .filter(p => p.id !== product.id && getProductCategory(p) === currentCategory)
        .slice(0, 4);
    if (relatedProducts.length === 0) {
        relatedContainer.innerHTML =
            '<p class="text-gray-500 text-center col-span-full py-8">' +
            'Geen gerelateerde producten gevonden</p>';
        return;
    }
    const relatedHTML = relatedProducts.map(relatedProduct => `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200
        overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div class="aspect-square flex items-center justify-center bg-gray-50 p-4">
                <img src="${relatedProduct.image}" alt="${relatedProduct.name}"
                 class="max-w-full max-h-full object-contain">
            </div>
            <div class="p-4">
                <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-2">${relatedProduct.name}</h3>
                <p class="text-lg font-bold text-blue-950
                mb-3">€${relatedProduct.price.toFixed(2).replace('.', ',')}</p>
                <a href="product.html?id=${relatedProduct.id}" class="block
                w-full bg-blue-950 hover:bg-blue-900 text-white text-cente
                py-2 px-4 rounded-lg transition-colors duration-300 text-sm font-medium">
                   Bekijk product
                </a>
            </div>
        </div>
    `).join('');
    relatedContainer.innerHTML = relatedHTML;
}

// Functie om add to cart button te setup
function setupAddToCartButton(product) {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    addToCartBtn.addEventListener('click', function () {
        if (typeof window.addToCart === 'function') {
            window.addToCart(product.id);
        } else {
            console.error('addToCart functie niet beschikbaar');
            showNotification('Er is een fout opgetreden. Probeer het opnieuw.');
        }
    });
}

// Functie om error state te tonen
function showErrorState() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-state').classList.remove('hidden');
}

// Functie om notificatie te tonen
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

// Hoofdfunctie om de pagina te initialiseren
async function initializeProductPage() {
    try {
        // Laad producten
        await loadProducts();
        // Haal product ID uit URL
        const productId = parseInt(getUrlParameter('id'));
        if (!productId) {
            showErrorState();
            return;
        }
        // Laad specifiek product
        const product = loadProductById(productId);
        if (!product) {
            showErrorState();
            return;
        }
        // Sla huidig product op
        currentProduct = product;
        // Toon product informatie
        displayProduct(product);
    } catch (error) {
        console.error('Fout bij initialiseren van product pagina:', error);
        showErrorState();
    }
}

// Start de initialisatie wanneer de DOM geladen is
document.addEventListener('DOMContentLoaded', initializeProductPage);
