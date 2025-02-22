"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: 'postgres', // Database username
    host: 'localhost', // Host (default is localhost)
    database: 'firstdb', // Replace with your database name
    password: 'restart@123', // Replace with your PostgreSQL password
    port: 5432, // Default PostgreSQL port
});
exports.default = pool;
