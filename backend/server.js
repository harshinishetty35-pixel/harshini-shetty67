require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gourmethub';

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Food Model ---
const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    category: String,
    type: String,
    image: String
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id; // Map _id to id for frontend compatibility
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

const Food = mongoose.model('Food', foodSchema);

// --- Order Model ---
const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    specialInstructions: String,
    items: [
        {
            foodId: mongoose.Schema.Types.ObjectId,
            name: String,
            quantity: Number,
            price: Number
        }
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// --- Static Files ---
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// --- API Endpoints: Foods ---

// GET all foods
app.get('/api/foods', async (req, res) => {
    try {
        const foods = await Food.find();
        res.json(foods);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new food
app.post('/api/foods', async (req, res) => {
    const food = new Food(req.body);
    try {
        const newFood = await food.save();
        res.status(201).json(newFood);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update food
app.put('/api/foods/:id', async (req, res) => {
    try {
        const updatedFood = await Food.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } 
        );
        if (updatedFood) {
            res.json(updatedFood);
        } else {
            res.status(404).json({ message: 'Food item not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE food
app.delete('/api/foods/:id', async (req, res) => {
    try {
        const deletedFood = await Food.findByIdAndDelete(req.params.id);
        if (deletedFood) {
            res.json({ message: 'Deleted successfully' });
        } else {
            res.status(404).json({ message: 'Food item not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- API Endpoints: Orders ---

// GET all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST place new order
app.post('/api/orders', async (req, res) => {
    const order = new Order(req.body);
    try {
        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH update order status
app.patch('/api/orders/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (updatedOrder) {
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (deletedOrder) {
            res.json({ message: 'Order deleted successfully' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
