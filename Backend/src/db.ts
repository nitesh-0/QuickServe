import { Pool } from 'pg';

const pool = new Pool({
    connectionString: 'postgresql://qsdb_user:Eiw9JW183GXv5b4xVsdeHPteVknuwneK@dpg-cusqvkjqf0us739npn20-a/qsdb',
    ssl: {
        rejectUnauthorized: false, // This is required for Render's database
    },
});

// Function to create the tables
const createTables = async () => {
    try {
        // Creating hotels table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.hotels (
                hotel_id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                address TEXT NOT NULL
            );
        `);

        // Creating menu_items table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.menu_items (
                menu_item_id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price NUMERIC(10,2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                hotel_id INTEGER REFERENCES public.hotels(hotel_id) ON DELETE CASCADE
            );
        `);

        // Creating orders table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.orders (
                order_id SERIAL PRIMARY KEY,
                table_id INTEGER,
                status VARCHAR(50) NOT NULL,
                total_price NUMERIC(10,2) NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (table_id) REFERENCES public.tables(table_id) ON DELETE SET NULL
            );
        `);

        // Creating order_items table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.order_items (
                order_item_id SERIAL PRIMARY KEY,
                menu_item_id INTEGER REFERENCES public.menu_items(menu_item_id) ON DELETE CASCADE,
                order_id INTEGER REFERENCES public.orders(order_id) ON DELETE CASCADE,
                quantity INTEGER NOT NULL,
                subtotal_price NUMERIC(10,2) NOT NULL
            );
        `);

        // Creating tables table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.tables (
                table_id SERIAL PRIMARY KEY,
                table_no INTEGER NOT NULL,
                qr_code_url TEXT,
                hotel_id INTEGER REFERENCES public.hotels(hotel_id) ON DELETE CASCADE
            );
        `);

        console.log('Tables created successfully!');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

// Call the function to create the tables
createTables();

export default pool;
