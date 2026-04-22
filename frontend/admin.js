const FOOD_API = 'http://localhost:5000/api/foods';
const ORDER_API = 'http://localhost:5000/api/orders';

// Elements
const foodTableBody = document.getElementById('admin-table-body');
const orderTableBody = document.getElementById('orders-table-body');
const foodForm = document.getElementById('food-form');
const formContainer = document.getElementById('form-container');
const btnAddNew = document.getElementById('btn-add-new');
const btnCancel = document.getElementById('btn-cancel');
const formTitle = document.getElementById('form-title');

const sectionMenu = document.getElementById('section-menu');
const sectionOrders = document.getElementById('section-orders');
const tabMenu = document.getElementById('tab-menu');
const tabOrders = document.getElementById('tab-orders');

let isEditing = false;

// --- Tab Logic ---

window.switchTab = (tab) => {
    if (tab === 'menu') {
        sectionMenu.style.display = 'block';
        sectionOrders.style.display = 'none';
        tabMenu.classList.add('active');
        tabOrders.classList.remove('active');
        fetchFoods();
    } else {
        sectionMenu.style.display = 'none';
        sectionOrders.style.display = 'block';
        tabMenu.classList.remove('active');
        tabOrders.classList.add('active');
        fetchOrders();
    }
};

// --- Food Management ---

async function fetchFoods() {
    try {
        const response = await fetch(FOOD_API);
        const foods = await response.json();
        renderFoodTable(foods);
    } catch (error) {
        console.error('Error fetching foods:', error);
    }
}

function renderFoodTable(foods) {
    foodTableBody.innerHTML = '';
    foods.forEach(food => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${food.image}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                    <span>${food.name}</span>
                </div>
            </td>
            <td>${food.category}</td>
            <td><span class="dietary-tag ${food.type === 'veg' ? 'tag-veg' : 'tag-non-veg'}" style="font-size: 0.6rem;">${food.type.toUpperCase()}</span></td>
            <td>$${food.price}</td>
            <td>
                <button class="btn-sm btn-edit" onclick="editItem('${food.id}')">Edit</button>
                <button class="btn-sm btn-delete" onclick="deleteItem('${food.id}')">Delete</button>
            </td>
        `;
        foodTableBody.appendChild(row);
    });
}

foodForm.onsubmit = async (e) => {
    e.preventDefault();
    const foodId = document.getElementById('food-id').value;
    const foodData = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value,
        type: document.getElementById('type').value,
        image: document.getElementById('image').value,
        description: document.getElementById('description').value
    };

    try {
        const response = await fetch(isEditing ? `${FOOD_API}/${foodId}` : FOOD_API, {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(foodData)
        });

        if (response.ok) {
            fetchFoods();
            formContainer.style.display = 'none';
            foodForm.reset();
        }
    } catch (error) {
        console.error('Error saving food:', error);
    }
};

window.editItem = async (id) => {
    const response = await fetch(FOOD_API);
    const foods = await response.json();
    const food = foods.find(f => f.id === id);
    if (food) {
        isEditing = true;
        formTitle.textContent = 'Edit Food Item';
        document.getElementById('food-id').value = food.id;
        document.getElementById('name').value = food.name;
        document.getElementById('price').value = food.price;
        document.getElementById('category').value = food.category;
        document.getElementById('type').value = food.type;
        document.getElementById('image').value = food.image;
        document.getElementById('description').value = food.description;
        formContainer.style.display = 'block';
    }
};

window.deleteItem = async (id) => {
    if (confirm('Delete this item?')) {
        await fetch(`${FOOD_API}/${id}`, { method: 'DELETE' });
        fetchFoods();
    }
};

btnAddNew.onclick = () => {
    isEditing = false;
    formTitle.textContent = 'Add New Food Item';
    foodForm.reset();
    formContainer.style.display = 'block';
};

btnCancel.onclick = () => {
    formContainer.style.display = 'none';
};

// --- Order Management ---

async function fetchOrders() {
    try {
        const response = await fetch(ORDER_API);
        const orders = await response.json();
        renderOrderTable(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

function renderOrderTable(orders) {
    orderTableBody.innerHTML = '';
    orders.forEach(order => {
        const itemsList = order.items.map(i => `${i.name} x${i.quantity}`).join('<br>');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${order.customerName}</strong><br>
                <small>${order.phone}</small><br>
                <small>${order.address}</small>
            </td>
            <td>
                <div style="font-size: 0.85rem;">${itemsList}</div>
                ${order.specialInstructions ? `<div style="font-size: 0.75rem; color: var(--primary-gold); margin-top: 5px;">Note: ${order.specialInstructions}</div>` : ''}
            </td>
            <td>$${order.totalPrice.toFixed(2)}</td>
            <td>
                <select onchange="updateOrderStatus('${order._id}', this.value)" style="padding: 5px; font-size: 0.8rem;">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
            <td>
                <button class="btn-sm btn-delete" onclick="deleteOrder('${order._id}')">Delete</button>
            </td>
        `;
        orderTableBody.appendChild(row);
    });
}

window.updateOrderStatus = async (id, status) => {
    try {
        await fetch(`${ORDER_API}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        alert('Order status updated.');
    } catch (error) {
        console.error('Error updating status:', error);
    }
};

window.deleteOrder = async (id) => {
    if (confirm('Delete this order?')) {
        await fetch(`${ORDER_API}/${id}`, { method: 'DELETE' });
        fetchOrders();
    }
};

// Initialize
fetchFoods();
fetchOrders();
