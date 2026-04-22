const API_URL = 'http://localhost:5000/api';
const menuGrid = document.getElementById('menu-grid');
const navbar = document.getElementById('navbar');
const filterBtns = document.querySelectorAll('.filter-btn');

// Cart Elements
const cartIcon = document.getElementById('cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const totalPriceEl = document.getElementById('cart-total-price');
const checkoutForm = document.getElementById('checkout-form');
const successModal = document.getElementById('success-modal');

let allFoods = [];
let cart = JSON.parse(localStorage.getItem('gourmetCart')) || [];

// --- Menu Functions ---

async function fetchFoods() {
    try {
        const response = await fetch(`${API_URL}/foods`);
        allFoods = await response.json();
        renderMenu(allFoods);
        updateCartUI();
    } catch (error) {
        console.error('Error fetching foods:', error);
        menuGrid.innerHTML = '<p style="color: var(--accent-red); grid-column: 1/-1; text-align: center;">Failed to load menu. Please check if the server is running.</p>';
    }
}

function renderMenu(foods) {
    menuGrid.innerHTML = '';
    if (foods.length === 0) {
        menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No items found in this category.</p>';
        return;
    }

    foods.forEach(food => {
        const card = document.createElement('div');
        card.className = 'food-card';
        card.innerHTML = `
            <div class="food-img-container">
                <img src="${food.image}" alt="${food.name}" loading="lazy">
                <span class="dietary-tag ${food.type === 'veg' ? 'tag-veg' : 'tag-non-veg'}">
                    ${food.type === 'veg' ? 'VEG' : 'NON-VEG'}
                </span>
            </div>
            <div class="food-info">
                <h3>${food.name}</h3>
                <p class="food-desc">${food.description}</p>
                <div class="food-footer">
                    <span class="price">$${food.price}</span>
                    <button class="btn-add-cart" onclick="addToCart('${food.id}')">Add to Cart</button>
                </div>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

// --- Cart Functions ---

window.addToCart = (id) => {
    const food = allFoods.find(f => f.id === id);
    if (!food) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...food, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    openCartSidebar();
};

function saveCart() {
    localStorage.setItem('gourmetCart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update items list
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>$${item.price} x ${item.quantity}</span>
            </div>
            <div class="cart-qty-controls">
                <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    totalPriceEl.textContent = `$${total.toFixed(2)}`;
}

window.updateQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    saveCart();
    updateCartUI();
};

const openCartSidebar = () => cartSidebar.classList.add('active');
const closeCartSidebar = () => cartSidebar.classList.remove('active');

cartIcon.onclick = openCartSidebar;
closeCart.onclick = closeCartSidebar;

// --- Checkout Functions ---

checkoutForm.onsubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const orderData = {
        customerName: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        address: document.getElementById('cust-address').value,
        specialInstructions: document.getElementById('cust-instructions').value,
        items: cart.map(item => ({
            foodId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        totalPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            cart = [];
            saveCart();
            updateCartUI();
            closeCartSidebar();
            checkoutForm.reset();
            successModal.classList.add('active');
        }
    } catch (error) {
        console.error('Order submission failed:', error);
        alert('Failed to place order. Please try again.');
    }
};

window.closeSuccessModal = () => successModal.classList.remove('active');

// --- Helpers ---

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.getAttribute('data-category');
        renderMenu(category === 'All' ? allFoods : allFoods.filter(f => f.category === category));
    });
});

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

fetchFoods();
