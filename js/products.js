// Products.js - Beheert het laden en weergeven van producten
// Dit bestand zorgt ervoor dat alle producten worden geladen en mooi worden weergegeven op de website

// Globale variabelen - deze variabelen kunnen overal in dit bestand gebruikt worden

// Hier slaan we alle producten op die we van de server krijgen
let allProducts = [];
// Hier slaan we de producten op die gefilterd zijn (bijvoorbeeld alleen CPU's)
let filteredProducts = [];

// Functie om producten te laden uit products.json of localStorage
// Hybrid approach: Admin wijzigingen in localStorage krijgen prioriteit
async function loadProducts() {
    try {
        // Check eerst of er admin-bewerkte producten zijn in localStorage
        // Als de admin producten heeft bewerkt, staan die in localStorage zonder timestamp
        const adminEditedProducts = localStorage.getItem('products');
        const hasAdminEdits = localStorage.getItem('hasAdminEdits') === 'true';
        // Als er admin wijzigingen zijn, gebruik die altijd
        if (hasAdminEdits && adminEditedProducts) {
            allProducts = JSON.parse(adminEditedProducts);
            filteredProducts = [...allProducts];
            console.log('Admin-bewerkte producten geladen uit localStorage:', allProducts.length);
            return allProducts;
        }
        // Anders: probeer eerst uit localStorage te laden (normale cache)
        const cachedProducts = localStorage.getItem('products');
        const cacheTimestamp = localStorage.getItem('productsTimestamp');
        const now = Date.now();
        const cacheAge = now - (cacheTimestamp || 0);
        // Cache is geldig voor 1 uur (3600000 milliseconden = 1 uur)
        if (cachedProducts && cacheAge < 3600000) {
            allProducts = JSON.parse(cachedProducts);
            filteredProducts = [...allProducts];
            console.log('Producten geladen uit localStorage cache:', allProducts.length);
            return allProducts;
        }
        // Anders fetch van products.json (als de cache te oud is of er niet is)
        console.log('Producten laden van server...');
        const response = await fetch('products.json');
        const data = await response.json();
        allProducts = data.components;
        filteredProducts = [...allProducts];
        // Sla op in localStorage (normale cache, geen admin edits)
        localStorage.setItem('products', JSON.stringify(allProducts));
        localStorage.setItem('productsTimestamp', now);
        // Markeer als niet admin-bewerkt
        localStorage.setItem('hasAdminEdits', 'false');
        console.log('Producten geladen van server en opgeslagen in localStorage:', allProducts.length);
        return allProducts;
    } catch (error) {
        // Als er iets mis gaat (bijvoorbeeld geen internet), probeer dan oude data te gebruiken
        console.error('Fout bij het laden van producten:', error);
        // Probeer als fallback uit localStorage (oude data)
        const cachedProducts = localStorage.getItem('products');
        if (cachedProducts) {
            allProducts = JSON.parse(cachedProducts);
            filteredProducts = [...allProducts];
            console.log('Fallback: Producten geladen uit localStorage (oude data):', allProducts.length);
            return allProducts;
        }
        return []; // Als er helemaal niks werkt, geef een lege lijst terug
    }
}

// Functie om producten te verversen (force reload van server)
// Dit wordt gebruikt als je de nieuwste producten wilt hebben, ook al zijn de oude nog niet verouderd
async function refreshProducts() {
    try {
        console.log('Producten verversen van server...');
        const response = await fetch('products.json');
        const data = await response.json();
        allProducts = data.components;
        filteredProducts = [...allProducts];
        // Update localStorage met de nieuwe data (reset admin edits)
        localStorage.setItem('products', JSON.stringify(allProducts));
        localStorage.setItem('productsTimestamp', Date.now());
        localStorage.setItem('hasAdminEdits', 'false'); // Reset admin edits flag
        console.log('Producten verversen voltooid:', allProducts.length);
        return allProducts;
    } catch (error) {
        console.error('Fout bij verversen van producten:', error);
        return allProducts; // Return huidige producten als fallback (beter dan niks)
    }
}

// Functie om admin wijzigingen door te voeren naar alle pagina's
// Deze functie wordt aangeroepen door de admin pagina na elke wijziging
function updateProductsFromAdmin(updatedProducts) {
    allProducts = updatedProducts;
    filteredProducts = [...allProducts];
    // Sla op in localStorage en markeer als admin-bewerkt
    localStorage.setItem('products', JSON.stringify(allProducts));
    localStorage.setItem('hasAdminEdits', 'true');
    // Verwijder timestamp zodat de hybrid approach weet dat dit admin edits zijn
    localStorage.removeItem('productsTimestamp');
    console.log('Admin wijzigingen doorgevoerd naar alle pagina\'s:', allProducts.length);
    // Update de weergave als we op een pagina zijn die producten toont
    updateProductDisplay();
}

// Functie om producten weer te geven in een container
// containerId is de ID van het HTML element waar de producten in moeten komen
// limit is optioneel - als je maar een paar producten wilt laten zien
function displayProducts(products, containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.log(`Container ${containerId} niet gevonden - misschien bestaat het HTML element niet?`);
        return;
    }
    // Beperk het aantal producten als er een limit is
    // slice(0, limit) betekent: neem alleen de eerste X producten
    const productsToShow = limit ? products.slice(0, limit) : products;
    if (productsToShow.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Geen producten gevonden.</p>';
        return;
    }
    // Genereer HTML voor alle producten
    // map() betekent: maak van elk product een HTML kaartje
    // join('') betekent: plak alle HTML kaartjes aan elkaar
    const productsHTML = productsToShow.map(product => createProductCard(product)).join('');
    container.innerHTML = productsHTML; // Zet de HTML in de container
}

// Functie om een product card te maken
// Dit maakt van een product object een mooi HTML kaartje
function createProductCard(product) {
    const shortSpecs = getShortSpecs(product);
    // Dit is een template string - het maakt HTML met de product gegevens
    return `
        <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all
        duration-300 border border-gray-200 group product-card">
            <div class="w-full h-[300px] flex justify-center items-center p-4 bg-gray-50 overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="max-w-full max-h-full w-auto
                h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                style="max-width: 100%; max-height: 100%;" />
            </div>
            <div class="p-4 space-y-3">
                <h3 class="text-lg font-bold text-gray-800 line-clamp-2 min-h-[56px]
                group-hover:text-blue-950 transition-colors">
                    ${product.name}
                </h3>
                <p class="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                    ${shortSpecs}
                </p>
                <div class="font-bold text-blue-950">
                    <span class="text-2xl">€${product.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="flex flex-row gap-2 justify-between">
                    <a href="product.html?id=${product.id}"
                        class="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors
                         duration-300 text-sm font-medium flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor"
                        //  viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1
                             1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clip-rule="evenodd" />
                        </svg>
                        Lees meer
                    </a>
                    <button data-product-id="${product.id}" class="add-to-cart-btn bg-blue-950
                     hover:bg-blue-900 text-white py-2 px-4 rounded-lg
                     transition-colors duration-300 text-sm font-medium flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                        //  fill="currentColor">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74
                             11.846 4.632 14 6.414 14H15a1
                            1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0
                             0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3
                             0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        In winkelwagen
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Helper functie voor korte specificaties
// Deze functie maakt van alle specificaties een korte tekst die past op het product kaartje
function getShortSpecs(product) {
    if (!product.specifications) return "";
    // Object.entries() maakt van een object een lijst van [key, value] paren
    // slice(0, 3) neemt alleen de eerste 3 specificaties
    // map() maakt van elke specificatie alleen de waarde (niet de naam)
    // join(" • ") plakt ze aan elkaar met een bullet point ertussen
    const specsToShow = Object.entries(product.specifications)
        .slice(0, 3)
        .map(([_, value]) => `${value}`)
        .join(" • ");
    return specsToShow;
}

// Functie om de category van een product te bepalen
// Deze functie kijkt naar de naam en specificaties om te bepalen wat voor soort product het is
function getProductCategory(product) {
    const name = product.name.toLowerCase();
    const specs = Object.values(product.specifications || {}).join(' ').toLowerCase();
    // Check voor verschillende categorieën (CPU, GPU, etc.)
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
    // Als het niks van bovenstaande is, is het "anders"
    return 'other';
}

// Functie om producten te filteren en sorteren
// Deze functie doet het echte werk van het filteren en sorteren
function filterAndSortProducts(category = '', sortBy = 'name-asc', searchTerm = '') {
    let filtered = [...allProducts]; // Maak een kopie van alle producten
    // Category filter - als er een categorie is gekozen, filter dan op die categorie
    if (category) {
        filtered = filtered.filter(product => getProductCategory(product) === category);
    }
    // Search filter - als er een zoekterm is ingevoerd, zoek dan in namen en specificaties
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(product => product.name.toLowerCase().includes(searchLower) ||
            Object.values(product.specifications || {}).some(value => value.toLowerCase().includes(searchLower)),
        );
    }
    // Sorting - sorteren op verschillende manieren
    switch (sortBy) {
        case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        default:
            // No sorting if sortBy is unrecognized
            break;
    }
    // Geef de gefilterde en gesorteerde producten terug
    return filtered;
}

// Functie om best sellers weer te geven (top 4 producten)
function displayBestSellers() {
    // Eerste 4 producten als best sellers
    const bestSellers = allProducts.slice(0, 4);
    displayProducts(bestSellers, 'card-container', 4);
}

// Functie om filters te initialiseren (voor parts.html)
function initializeFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    const searchInput = document.getElementById('search-input');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', updateProductDisplay);
    }
    if (sortBy) {
        sortBy.addEventListener('change', updateProductDisplay);
    }
    if (searchInput) {
        searchInput.addEventListener('input', updateProductDisplay);
    }
}

// Functie om product display bij te werken
function updateProductDisplay() {
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    const searchInput = document.getElementById('search-input');
    // Check of we op een pagina zijn met filters (parts.html)
    if (categoryFilter && sortBy && searchInput) {
        const category = categoryFilter.value;
        const sort = sortBy.value;
        const search = searchInput.value;
        const filtered = filterAndSortProducts(category, sort, search);
        displayProducts(filtered, 'card-container');
    } else {
        // Op andere pagina's (index.html, product.html) update gewoon de bestaande weergave
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'index.html' || currentPage === '') {
            displayBestSellers();
        } else if (currentPage === 'parts.html') {
            displayProducts(allProducts, 'card-container');
        }
    }
}

// Initialisatie functie
async function initializeProducts() {
    await loadProducts();
    // Event delegation voor add-to-cart knoppen
    document.addEventListener('click', function (e) {
        if (e.target.closest('.add-to-cart-btn')) {
            const button = e.target.closest('.add-to-cart-btn');
            const productId = parseInt(button.getAttribute('data-product-id'));
            if (productId && typeof window.addToCart === 'function') {
                window.addToCart(productId);
            } else {
                console.error('addToCart functie niet beschikbaar of ongeldig product ID:', productId);
            }
        }
    });
    // Check welke pagina we zijn
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '') {
        // Best sellers op homepage
        displayBestSellers();
    } else if (currentPage === 'parts.html') {
        // Alle producten met filters op parts pagina
        displayProducts(allProducts, 'card-container');
        initializeFilters();
    }
}

// Start de initialisatie wanneer de DOM geladen is
document.addEventListener('DOMContentLoaded', initializeProducts);

// Maak functies beschikbaar in globale scope voor andere bestanden
window.updateProductsFromAdmin = updateProductsFromAdmin;
