const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const USERS_FILE = path.join(__dirname, 'users.json');

// Helper to hash password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

function getUsers() {
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

async function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function register() {
    console.log('\n--- User Registration ---');
    const username = await ask('Enter username: ');
    const password = await ask('Enter password: ');

    const users = getUsers();
    if (users.find(u => u.username === username)) {
        console.log('Error: Username already exists!');
        return;
    }

    users.push({
        username,
        password: hashPassword(password)
    });

    saveUsers(users);
    console.log('Registration successful!');
}

async function login() {
    console.log('\n--- User Login ---');
    const username = await ask('Enter username: ');
    const password = await ask('Enter password: ');

    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user && user.password === hashPassword(password)) {
        console.log(`\nWelcome back, ${username}! Authentication successful.`);
        return true;
    } else {
        console.log('\nError: Invalid username or password.');
        return false;
    }
}

async function main() {
    console.log('Terminal Authentication System');
    console.log('1. Login');
    console.log('2. Register');
    console.log('3. Exit');

    const choice = await ask('\nSelect an option: ');

    switch (choice) {
        case '1':
            await login();
            break;
        case '2':
            await register();
            break;
        case '3':
            console.log('Goodbye!');
            rl.close();
            return;
        default:
            console.log('Invalid choice.');
    }

    main(); // Loop back
}

main();
