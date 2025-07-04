// Admin functionality
let products = [];
let originalProducts = [];
let hasChanges = false;

document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    setupEventListeners();
    setupOrderAdminEvents();
});

// Functie om admin wijzigingen door te voeren naar alle pagina's
// Deze functie wordt aangeroepen na elke wijziging in de admin
function updateProductsFromAdmin(updatedProducts) {
    // Sla op in localStorage en markeer als admin-bewerkt
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    localStorage.setItem('hasAdminEdits', 'true');
    // Verwijder timestamp zodat de hybrid approach weet dat dit admin edits zijn
    localStorage.removeItem('productsTimestamp');
    console.log('Admin wijzigingen doorgevoerd naar alle pagina\'s:', updatedProducts.length);
}

// Functie om producten te verversen (force reload van server)
async function refreshProducts() {
    try {
        console.log('Producten verversen van server...');
        const response = await fetch('products.json');
        const data = await response.json();
        const serverProducts = data.components;
        // Update localStorage met de nieuwe data (reset admin edits)
        localStorage.setItem('products', JSON.stringify(serverProducts));
        localStorage.setItem('productsTimestamp', Date.now());
        localStorage.setItem('hasAdminEdits', 'false'); // Reset admin edits flag
        console.log('Producten verversen voltooid:', serverProducts.length);
        return serverProducts;
    } catch (error) {
        console.error('Fout bij verversen van producten:', error);
        return products; // Return huidige producten als fallback
    }
}

// Laad producten uit localStorage of haal ze op van de server
async function loadProducts() {
    try {
        // probeert eerst de local storage de laden
        const cachedProducts = localStorage.getItem('adminProducts');
        if (cachedProducts) {
            products = JSON.parse(cachedProducts);
        } else {
            // fetch de producten van products.json
            const response = await fetch('products.json');
            const data = await response.json();
            // Extract the components array from the JSON structure
            products = data.components || [];
        }
        // Ensure products is always an array
        if (!Array.isArray(products)) {
            products = [];
        }
        // Store original products for reset functionality
        originalProducts = JSON.parse(JSON.stringify(products));
        displayProducts();
        updateChangeStatus();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Fout bij het laden van producten', 'error');
        // Set empty array as fallback
        products = [];
        originalProducts = [];
        displayProducts();
        updateChangeStatus();
    }
}

// functie om eventlisteners toe te voegen
function setupEventListeners() {
    // voeg product form toe aan de html
    const addForm = document.getElementById('add-product-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddProduct);
    }
    // Save changes button
    const saveBtn = document.getElementById('save-changes');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveChanges);
    }
    // Reset buttons
    const resetBtn = document.getElementById('reset-products-btn');
    const resetHeaderBtn = document.getElementById('reset-products');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => confirmReset());
    }
    if (resetHeaderBtn) {
        resetHeaderBtn.addEventListener('click', () => confirmReset());
    }

    // bewerkings modal
    const editModal = document.getElementById('edit-modal');
    const closeEditBtn = document.getElementById('close-edit-modal');
    const cancelEditBtn = document.getElementById('cancel-edit');
    if (closeEditBtn) {
        closeEditBtn.addEventListener('click', closeEditModal);
    }
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }
    // bewerkings form
    const editForm = document.getElementById('edit-product-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditProduct);
    }
    // Confirmatie modal
    const confirmModal = document.getElementById('confirm-modal');
    const confirmCancelBtn = document.getElementById('confirm-cancel');
    const confirmOkBtn = document.getElementById('confirm-ok');
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', closeConfirmModal);
    }
    if (confirmOkBtn) {
        confirmOkBtn.addEventListener('click', () => {
            // dit wordt gezet door de confirmatie modal
            if (window.pendingConfirmAction) {
                window.pendingConfirmAction();
                window.pendingConfirmAction = null;
            }
        });
    }
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                closeConfirmModal();
            }
        });
    }
}

// overzicht producten in de admin pagina
function displayProducts() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    if (products.length === 0) {
        productsList.innerHTML = `
        <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <p>Geen producten gevonden</p>
            </div>
        `;
        return;
    }
    const productsHTML = products.map((product, index) => {
        // caterogie kiezen voor bepaald product
        const category = getProductCategory(product);
        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                data-product-id="${product.id}">
                <div class="flex items-center space-x-4">
                    <img src="${product.image}" alt="${product.name}"
                        class="w-16 h-16 object-contain rounded bg-gray-100">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-medium text-gray-900 truncate">
                            ${product.name}
                        </h3>
                        <p class="text-sm text-gray-500">
                            Categorie: ${getCategoryName(category)}
                        </p>
                        <p class="text-sm text-gray-500">
                            Prijs: €${product.price.toFixed(2).replace('.', ',')}
                        </p>
                        ${product.amount
        ? `<p class="text-sm text-gray-500">Voorraad: ${product.amount}</p>`
        : ''}
                    </div>
                    <div class="flex space-x-1">
                        <button onclick="editProduct(${index})"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded
                             text-xs transition-colors duration-300 flex items-center space-x-1"
                            title="Bewerken">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2
                                    0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828
                                    15H9v-2.828l8.586-8.586z">
                                </path>
                            </svg>
                            <span>Bewerken</span>
                        </button>
                        <button onclick="deleteProduct(${index})"
                            class="bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded
                             text-xs transition-colors duration-300 flex items-center space-x-1"
                            title="Verwijderen">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5
                                    7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                            </svg>
                            <span>Verwijderen</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    productsList.innerHTML = productsHTML;
}

// Get category name from value
function getCategoryName(category) {
    const categories = {
        cpu: 'CPU',
        gpu: 'GPU',
        memory: 'Geheugen',
        storage: 'Opslag',
        motherboard: 'Moederbord',
        psu: 'Voeding',
        cooling: 'Koeling',
    };
    return categories[category] || category;
}

// Get product category based on name or specifications
function getProductCategory(product) {
    const name = product.name.toLowerCase();
    const specs = product.specifications || {};
    if (name.includes('cpu') || name.includes('intel') || name.includes('amd') || specs.socket) {
        return 'cpu';
    }
    if (name.includes('gpu') || name.includes('graphics') || name.includes('rtx') || name.includes('gtx')) {
        return 'gpu';
    }
    if (name.includes('memory') || name.includes('ddr') || name.includes('ram') || specs.memory_type) {
        return 'memory';
    }
    if (name.includes('ssd') || name.includes('hdd') || name.includes('storage') || specs.capacity) {
        return 'storage';
    }
    if (name.includes('motherboard') || name.includes('board') || specs.chipset) {
        return 'motherboard';
    }
    if (name.includes('psu') || name.includes('power') || name.includes('watt') || specs.wattage) {
        return 'psu';
    }
    if (name.includes('cooler') || name.includes('cooling') || name.includes('fan') || specs.type === 'Air Cooler') {
        return 'cooling';
    }
    return 'other';
}

// Handle add product
function handleAddProduct(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newProduct = {
        id: Date.now(), // Simple ID generation
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        image: formData.get('image'),
        description: formData.get('description') || '',
        amount: 10, // Default stock amount
        specifications: {}, // Empty specifications object
    };
    // Validate required fields
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.image) {
        showNotification('Vul alle verplichte velden in', 'error');
        return;
    }
    // Validate price
    if (newProduct.price <= 0) {
        showNotification('Prijs moet groter zijn dan 0',
            'error');
        return;
    }
    // Add product
    products.push(newProduct);
    hasChanges = true;
    // Update display
    displayProducts();
    updateChangeStatus();
    // Reset form
    event.target.reset();
    showNotification(
        'Product toegevoegd - klik "Wijzigingen Opslaan" ' +
        'om door te voeren naar alle pagina\'s',
        'success',
    );
}

// Edit product
function editProduct(index) {
    const product = products[index];
    if (!product) return;
    // Fill edit form
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-category').value = product.category;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-image').value = product.image;
    document.getElementById('edit-product-description').value = product.description || '';
    // Store current index for update
    document.getElementById('edit-product-form').dataset.editIndex = index;
    // Show modal
    document.getElementById('edit-modal').classList.remove('hidden');
}

// Handle edit product
function handleEditProduct(event) {
    event.preventDefault();
    console.log('handleEditProduct aangeroepen!'); // Debug log
    const formData = new FormData(event.target);
    const index = parseInt(event.target.dataset.editIndex);
    if (Number.isNaN(index) || index < 0 || index >= products.length) {
        showNotification('Product niet gevonden', 'error');
        return;
    }
    const originalProduct = products[index];
    const updatedProduct = {
        id: parseInt(formData.get('id')),
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        image: formData.get('image'),
        description: formData.get('description') || '',
        // Keep original amount
        amount: originalProduct.amount || 10,
        // Keep original specifications
        specifications: originalProduct.specifications || {},
    };
    console.log('Original product:', originalProduct); // Debug log
    console.log('Updated product:', updatedProduct); // Debug log
    // Validate required fields
    if (!updatedProduct.name || !updatedProduct.category || !updatedProduct.price || !updatedProduct.image) {
        showNotification('Vul alle verplichte velden in', 'error');
        return;
    }
    // Validate price
    if (updatedProduct.price <= 0) {
        showNotification('Prijs moet groter zijn dan 0', 'error');
        return;
    }
    // Update product
    products[index] = updatedProduct;
    hasChanges = true; // Zet hasChanges op true voor wijzigingen
    console.log('Product updated, hasChanges set to:', hasChanges); // Debug log
    // Update display
    displayProducts();
    updateChangeStatus();
    closeEditModal();
    showNotification(
        'Product bijgewerkt - klik "Wijzigingen Opslaan" om door te voeren naar alle pagina\'s',
        'success',
    );
}

// verwijder product
function deleteProduct(index) {
    if (index < 0 || index >= products.length) {
        showNotification('Product niet gevonden', 'error');
        return;
    }
    const product = products[index];
    // laat confirmatie zien
    showConfirmModal(
        'Product Verwijderen',
        `Weet je zeker dat je "${product.name}" wilt verwijderen?`,
        () => {
            products.splice(index, 1);
            hasChanges = true;
            displayProducts();
            updateChangeStatus();
            showNotification(
                'Product verwijderd - klik "Wijzigingen Opslaan" om door te voeren naar alle pagina\'s',
                'success',
            );
        },
    );
}

// Save de veranderingen en debugs
function saveChanges() {
    console.log('saveChanges aangeroepen!');
    console.log('hasChanges:', hasChanges);
    console.log('products:', products);
    try {
        // Save to admin localStorage
        localStorage.setItem('adminProducts', JSON.stringify(products));
        // Update products.js cache en markeer als admin-bewerkt
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('hasAdminEdits', 'true');
        localStorage.removeItem('productsTimestamp'); // Verwijder timestamp voor hybrid approach
        // Roep de lokale functie aan om wijzigingen door te voeren naar alle pagina's
        updateProductsFromAdmin(products);
        hasChanges = false;
        updateChangeStatus();
        console.log('Wijzigingen opgeslagen!'); // Debug log
        showNotification(
            'Wijzigingen succesvol opgeslagen en doorgevoerd naar alle pagina\'s',
            'success',
        );
    } catch (error) {
        console.error('Error saving changes:', error);
        showNotification('Fout bij het opslaan van wijzigingen', 'error');
    }
}

// Reset products to original state
function resetProducts() {
    // Close confirmation modal first
    closeConfirmModal();
    products = JSON.parse(JSON.stringify(originalProducts));
    hasChanges = false;
    // Clear localStorage en reset hybrid approach
    localStorage.removeItem('adminProducts');
    localStorage.removeItem('products');
    localStorage.removeItem('hasAdminEdits');
    localStorage.removeItem('productsTimestamp');
    // Roep de lokale refresh functie aan om producten opnieuw te laden uit products.json
    refreshProducts().then(() => {
        displayProducts();
        updateChangeStatus();
        showNotification('Producten succesvol gereset naar originele staat!', 'success');
    }).catch(() => {
        displayProducts();
        updateChangeStatus();
        showNotification('Producten succesvol gereset naar originele staat!', 'success');
    });
}

// Confirm reset
function confirmReset() {
    showConfirmModal(
        'Producten Resetten',
        'Weet je zeker dat je alle wijzigingen wilt ongedaan maken? Dit kan niet ongedaan worden gemaakt.',
        resetProducts,
    );
}

// Update change status
function updateChangeStatus() {
    const saveBtn = document.getElementById('save-changes');
    console.log('updateChangeStatus aangeroepen, hasChanges:', hasChanges); // Debug log
    console.log('saveBtn gevonden:', !!saveBtn); // Debug log
    if (saveBtn) {
        if (hasChanges) {
            saveBtn.disabled = false;
            saveBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
            saveBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            console.log('Save button ingeschakeld'); // Debug log
        } else {
            saveBtn.disabled = true;
            saveBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            saveBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            console.log('Save button uitgeschakeld'); // Debug log
        }
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    document.getElementById('edit-product-form').reset();
}

// Show confirmation modal
function showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    window.pendingConfirmAction = onConfirm;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

// Close confirmation modal
function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
}

// Show notification
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

// Export functions for global access
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;


// Fetch and render orders on admin page
function fetchOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // newest first
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    const emptyDiv = document.getElementById('orders-empty');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!orders || orders.length === 0) {
        emptyDiv.classList.remove('hidden');
        return;
    } else {
        emptyDiv.classList.add('hidden');
    }
    orders.forEach(order => {
        const totalItems = order.items.reduce((sum, item) => sum + (item.amount || item.quantity || 1), 0);
        order.items.forEach((item, idx) => {
            const tr = document.createElement('tr');
            tr.className = idx === 0 ? 'border-t-4 border-gray-300' : '';
            // Tijd, Order ID, alleen bij eerste product van order (rowspan)
            if (idx === 0) {
                const tijdTd = document.createElement('td');
                tijdTd.className = 'px-4 py-2 align-top text-xs text-gray-500';
                tijdTd.rowSpan = order.items.length;
                tijdTd.textContent = formatOrderTime(order.orderDate);
                tr.appendChild(tijdTd);
                const idTd = document.createElement('td');
                idTd.className = 'px-4 py-2 align-top font-mono text-sm text-blue-900';
                idTd.rowSpan = order.items.length;
                idTd.textContent = order.orderNumber;
                tr.appendChild(idTd);
            }
            // Product naam
            const productTd = document.createElement('td');
            productTd.className = 'px-4 py-2 text-gray-900';
            productTd.textContent = item.name || item.productName || '-';
            tr.appendChild(productTd);
            // Aantal
            const amountTd = document.createElement('td');
            amountTd.className = 'px-4 py-2 text-center';
            amountTd.textContent = item.amount || item.quantity || 1;
            tr.appendChild(amountTd);
            // Totaal items (alleen bij eerste product van order)
            if (idx === 0) {
                const totalTd = document.createElement('td');
                totalTd.className = 'px-4 py-2 text-center font-semibold';
                totalTd.rowSpan = order.items.length;
                totalTd.textContent = totalItems;
                tr.appendChild(totalTd);
                // Acties (print)
                const actionsTd = document.createElement('td');
                actionsTd.className = 'px-4 py-2 text-center';
                actionsTd.rowSpan = order.items.length;
                const printBtn = document.createElement('button');
                printBtn.className = 'bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded text-xs';
                printBtn.textContent = 'Print';
                printBtn.onclick = () => printOrder(order);
                actionsTd.appendChild(printBtn);
                tr.appendChild(actionsTd);
            }
            tbody.appendChild(tr);
        });
        // Extra visuele scheiding tussen bestellingen
        const sepTr = document.createElement('tr');
        sepTr.innerHTML = `<td colspan="6" class="p-0"><div class="border-b-4 border-gray-300"></div></td>`;
        tbody.appendChild(sepTr);
    });
}

function formatOrderTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '\n' + date.toLocaleDateString();
}

// Search functionality
function filterOrders(orders, query) {
    if (!query) return orders;
    query = query.toLowerCase();
    return orders.filter(order => {
        if (order.orderNumber.toLowerCase().includes(query)) return true;
        return order.items.some(item => (item.name || '').toLowerCase().includes(query));
    });
}

// Print order (simple print of order details)
function printOrder(order) {
    const win = window.open('', '_blank');
    win.document.write('<html><head><title>Order ' + order.orderNumber + '</title>');
    win.document.write('<style>body{font-family:sans-serif;padding:2em;}h2{margin-bottom:0.5em;}table{border-collapse:collapse;width:100%;margin-top:1em;}td,th{border:1px solid #E0E0E0;padding:8px;}th{background:#f5f5f5;}tr:nth-child(even){background:#fafafa;}@media print{button{display:none;}}</style>');
    win.document.write('</head><body>');
    win.document.write('<h2>Order ' + order.orderNumber + '</h2>');
    win.document.write('<p><strong>Datum:</strong> ' + new Date(order.orderDate).toLocaleString() + '</p>');
    win.document.write('<p><strong>Klant:</strong> ' + order.customer.firstName + ' ' + order.customer.lastName + ' (' + order.customer.email + ')</p>');
    win.document.write('<table><thead><tr><th>Product</th><th>Aantal</th></tr></thead><tbody>');
    order.items.forEach(item => {
        win.document.write('<tr><td>' + (item.name || '-') + '</td><td>' + (item.amount || item.quantity || 1) + '</td></tr>');
    });
    win.document.write('</tbody></table>');
    win.document.write('<p><strong>Totaal:</strong> €' + (order.totals?.grandTotal?.toFixed(2) || '-') + '</p>');
    win.document.write('<button onclick="window.print()">Print</button>');
    win.document.write('</body></html>');
    win.document.close();
}

// Live refresh
function refreshOrdersTable() {
    const orders = fetchOrders();
    const searchInput = document.getElementById('order-search');
    const query = searchInput ? searchInput.value : '';
    renderOrdersTable(filterOrders(orders, query));
}

// Event listeners for order management
function setupOrderAdminEvents() {
    const searchInput = document.getElementById('order-search');
    if (searchInput) {
        searchInput.addEventListener('input', refreshOrdersTable);
    }
    const refreshBtn = document.getElementById('order-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshOrdersTable);
    }
    // Initial render
    refreshOrdersTable();
}