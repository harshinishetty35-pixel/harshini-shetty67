require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gourmethub';
const DATA_FILE = path.join(__dirname, 'data.json');

// Define Schema
const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    category: String,
    type: String,
    image: String
});

const Food = mongoose.model('Food', foodSchema);

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        // Read data.json
        if (!fs.existsSync(DATA_FILE)) {
            console.error('data.json not found. Nothing to migrate.');
            process.exit(1);
        }

        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        console.log(`Found ${data.length} items to migrate.`);

        // Clear existing data (optional but safer for a clean start)
        await Food.deleteMany({});
        console.log('Cleared existing data from MongoDB.');

        // Prepare data (remove old 'id' field to let MongoDB generate _id)
        const itemsToInsert = data.map(({ id, ...rest }) => rest);

        await Food.insertMany(itemsToInsert);
        console.log('Successfully migrated data to MongoDB!');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
