const { sql } = require('@vercel/postgres');
async function setup(){
 await sql`CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, customer TEXT, phone TEXT, address TEXT, items JSONB, total INT, status TEXT DEFAULT 'pending', created TIMESTAMP DEFAULT NOW())`;
 await sql`CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name TEXT, price INT, stock INT, image TEXT)`;
 await sql`INSERT INTO products (name, price, stock) VALUES ('Phethagatsa Bundle 5L', 250, 100) ON CONFLICT DO NOTHING`;
 console.log('DB READY');
}
setup();
