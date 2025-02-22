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

const pool = new Pool({
    connectionString: 'postgresql://qsdb_user:Eiw9JW183GXv5b4xVsdeHPteVknuwneK@dpg-cusqvkjqf0us739npn20-a/qsdb',
    ssl: {
        rejectUnauthorized: false, // This is required for Render's database
    },
});

export default pool;


