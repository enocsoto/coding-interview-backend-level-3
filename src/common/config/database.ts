//#region Imports
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { Item } from '../../item/models/Item';
//#endregion

dotenv.config();

const {
    DB_HOST = 'localhost',
    DB_PORT = '5434',
    DB_NAME = 'items_db',
    DB_USER = 'postgres',
    DB_PASSWORD = 'postgres',
    NODE_ENV = 'development'
} = process.env;

export const sequelize = new Sequelize({
    ...(NODE_ENV === 'test'
        ? {
              dialect: 'sqlite',
              storage: ':memory:',
              logging: false
          }
        : {
              host: DB_HOST,
              port: Number(DB_PORT),
              database: DB_NAME,
              username: DB_USER,
              password: DB_PASSWORD,
              dialect: 'postgres',
              logging: NODE_ENV === 'development' ? console.log : false
          }),
    models: [Item]
}); 