// import { Pool } from 'pg';

// const pool = new Pool({
//     user: 'postgres', // Database username
//     host: 'localhost', // Host (default is localhost)
//     database: 'firstdb', // Replace with your database name
//     password: 'restart@123', // Replace with your PostgreSQL password
//     port: 5432, // Default PostgreSQL port
// });

// export default pool;


import { Pool } from 'pg';

// Use the DATABASE_URL environment variable if it's set (for production)
const pool = new Pool({
    connectionString: "postgresql://qsdb_user:Eiw9JW183GXv5b4xVsdeHPteVknuwneK@dpg-cusqvkjqf0us739npn20-a/qsdb",  // This will be set in Render's environment variables
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Secure connection for production
});

export default pool;

