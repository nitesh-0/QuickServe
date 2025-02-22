"use strict";
// import { Pool } from 'pg';
Object.defineProperty(exports, "__esModule", { value: true });
// const pool = new Pool({
//     user: 'postgres', // Database username
//     host: 'localhost', // Host (default is localhost)
//     database: 'firstdb', // Replace with your database name
//     password: 'restart@123', // Replace with your PostgreSQL password
//     port: 5432, // Default PostgreSQL port
// });
// export default pool;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: 'postgresql://qsdb_user:Eiw9JW183GXv5b4xVsdeHPteVknuwneK@dpg-cusqvkjqf0us739npn20-a/qsdb',
    ssl: {
        rejectUnauthorized: false, // This is required for Render's database
    },
});
exports.default = pool;
