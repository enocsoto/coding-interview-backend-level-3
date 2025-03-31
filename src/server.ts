//#region Imports
import { Server } from '@hapi/hapi';
import { sequelize } from './common/config/database';
import { Item } from './item/models/Item';
//#endregion

const excludeTimestamps = (item: Item) => {
    const { createdAt, updatedAt, ...rest } = item.toJSON();
    return rest;
};

export const initializeServer = async () => {
    const server = new Server({
        port: process.env.PORT || 3000,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/ping',
        handler: () => ({ ok: true })
    });


    server.route([
        {
            method: 'GET',
            path: '/items',
            handler: async () => {
                const items = await Item.findAll();
                return items.map(excludeTimestamps);
            }
        },
        {
            method: 'GET',
            path: '/items/{id}',
            handler: async (request, h) => {
                const item = await Item.findByPk(request.params.id);
                if (!item) {
                    return h.response({ error: 'Item no encontrado' }).code(404);
                }
                return excludeTimestamps(item);
            }
        },
        {
            method: 'POST',
            path: '/items',
            handler: async (request, h) => {
                const { name, price } = request.payload as any;
                if (!name || !price) {
                    return h.response({
                        errors: [
                            {
                                field: !name ? 'name' : 'price',
                                message: `Field "${!name ? 'name' : 'price'}" is required`
                            }
                        ]
                    }).code(400);
                }
                if (price < 0) {
                    return h.response({
                        errors: [
                            {
                                field: 'price',
                                message: 'Field "price" cannot be negative'
                            }
                        ]
                    }).code(400);
                }
                const item = await Item.create({ name, price });
                return h.response(excludeTimestamps(item)).code(201);
            }
        },
        {
            method: 'PUT',
            path: '/items/{id}',
            handler: async (request, h) => {
                const { name, price } = request.payload as any;
                const item = await Item.findByPk(request.params.id);
                if (!item) {
                    return h.response({ error: 'Item no encontrado' }).code(404);
                }
                if (price < 0) {
                    return h.response({
                        errors: [
                            {
                                field: 'price',
                                message: 'Field "price" cannot be negative'
                            }
                        ]
                    }).code(400);
                }
                await item.update({ name, price });
                return excludeTimestamps(item);
            }
        },
        {
            method: 'DELETE',
            path: '/items/{id}',
            handler: async (request, h) => {
                const item = await Item.findByPk(request.params.id);
                if (!item) {
                    return h.response({ error: 'Item no encontrado' }).code(404);
                }
                await item.destroy();
                return h.response().code(204);
            }
        }
    ]);

    await server.initialize();
    await sequelize.sync({ alter: true });

    return server;
};

export const startServer = async () => {
    const server = await initializeServer();
    await server.start();
    console.log('Server running on %s', server.info.uri);
    return server;
};