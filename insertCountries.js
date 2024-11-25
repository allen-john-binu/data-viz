const fs = require('fs');
const { Client } = require('pg');
const jsonObject = require('./countryList.json');

const countries = jsonObject.countries;

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',  
    password: 'data',
    port: 5432,
});

async function connectAndInsert() {
    try {
        await client.connect();
        console.log('Connected to the database.');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS countries (
                id VARCHAR(3) PRIMARY KEY,
                name VARCHAR(255),
                continent VARCHAR(255)
            );
        `;
        await client.query(createTableQuery);
        console.log('Table "countries" created or already exists.');

        const insertQuery = `
            INSERT INTO countries (id, name, continent)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO NOTHING;  -- Avoid duplicate insertions
        `;
        
        for (const obj of countries) {
            const { _, id, name, continent } = obj;
            await client.query(insertQuery, [id, name, continent]);
            console.log(`Inserted: ${name} (${id})`);
        }
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
        console.log('Connection closed.');
    }
}

connectAndInsert();