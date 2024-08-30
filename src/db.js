"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
var typeorm_1 = require("typeorm");
require('dotenv').config();
exports.AppDataSource = new typeorm_1.DataSource({
    host: "localhost",
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "node_admin",
    type: "mysql",
    entities: ["src/entity/*.js"],
    logging: true,
    synchronize: true
});
