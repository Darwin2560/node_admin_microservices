import { DataSource } from "typeorm";

require('dotenv').config();

export const AppDataSource = new DataSource({
    host: "localhost",
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "node_admin",
    type: "mysql",
    entities: ["src/entity/*.js"],
    logging: true,
    synchronize: true
});
