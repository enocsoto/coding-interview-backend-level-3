//#region Imports
import { ServerExpress } from '../serverExpress';
import { sequelize } from '../common/config/database';
import { Item } from './models/Item';
import fetch from 'node-fetch';
//#endregion

interface PaginatedResponse {
    items: any[];
    total: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
}

describe('API Tests', () => {
    let server: ServerExpress;
    const baseUrl = `http://localhost:${process.env.PORT}/api`;

    beforeAll(async () => {
        server = new ServerExpress();
        await server.start();
        server.listen();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(async () => {
        await Item.destroy({ where: {} });
    });

    describe('GET /ping', () => {
        it('should return ok true', async () => {
            const response = await fetch(`${baseUrl}/ping`);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data).toEqual({ ok: true });
        });
    });

    describe('GET /items', () => {
        it('should return empty array when no items exist', async () => {
            const response = await fetch(`${baseUrl}/items`);
            const data = await response.json() as PaginatedResponse;
            expect(response.status).toBe(200);
            expect(data).toEqual({
                items: [],
                total: 0,
                currentPage: 1,
                totalPages: 0,
                itemsPerPage: 10
            });
        });

        it('should return items with pagination', async () => {
            // Crear 15 items
            await Item.bulkCreate(
                Array.from({ length: 15 }, (_, i) => ({
                    name: `Item ${i + 1}`,
                    price: 100
                }))
            );

            // Probar primera página
            const response1 = await fetch(`${baseUrl}/items?page=1&limit=10`);
            const data1 = await response1.json() as PaginatedResponse;
            expect(response1.status).toBe(200);
            expect(data1.items).toHaveLength(10);
            expect(data1.total).toBe(15);
            expect(data1.currentPage).toBe(1);
            expect(data1.totalPages).toBe(2);
            expect(data1.itemsPerPage).toBe(10);

            // Probar segunda página
            const response2 = await fetch(`${baseUrl}/items?page=2&limit=10`);
            const data2 = await response2.json() as PaginatedResponse;
            expect(response2.status).toBe(200);
            expect(data2.items).toHaveLength(5);
            expect(data2.currentPage).toBe(2);
        });
    });

    describe('GET /items/:id', () => {
        it('should return 404 when item does not exist', async () => {
            const response = await fetch(`${baseUrl}/items/1`);
            const data = await response.json();
            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'Item no encontrado' });
        });

        it('should return item when it exists', async () => {
            const item = await Item.create({ name: 'Test Item', price: 100 });
            const response = await fetch(`${baseUrl}/items/${item.id}`);
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data).toEqual({
                id: item.id,
                name: 'Test Item',
                price: 100
            });
        });
    });

    describe('POST /items', () => {
        it('should create item with valid data', async () => {
            const response = await fetch(`${baseUrl}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'New Item',
                    price: 100
                })
            });
            const data = await response.json();
            expect(response.status).toBe(201);
            expect(data).toEqual({
                id: expect.any(Number),
                name: 'New Item',
                price: 100
            });
        });

        it('should return 400 when name is missing', async () => {
            const response = await fetch(`${baseUrl}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ price: 100 })
            });
            const data = await response.json();
            expect(response.status).toBe(400);
            expect(data).toEqual({
                errors: [
                    {
                        field: 'name',
                        message: 'Name and price are required'
                    }
                ]
            });
        });

        it('should return 400 when price is negative', async () => {
            const response = await fetch(`${baseUrl}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'New Item',
                    price: -100
                })
            });
            const data = await response.json();
            expect(response.status).toBe(400);
            expect(data).toEqual({
                errors: [
                    {
                        field: 'price',
                        message: 'Price cannot be negative'
                    }
                ]
            });
        });
    });

    describe('PUT /items/:id', () => {
        it('should update item with valid data', async () => {
            const item = await Item.create({ name: 'Test Item', price: 100 });
            const response = await fetch(`${baseUrl}/items/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'Updated Item',
                    price: 200
                })
            });
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data).toEqual({
                id: item.id,
                name: 'Updated Item',
                price: 200
            });
        });

        it('should return 404 when item does not exist', async () => {
            const response = await fetch(`${baseUrl}/items/1`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'Updated Item',
                    price: 200
                })
            });
            const data = await response.json();
            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'Item no encontrado' });
        });

        it('should return 400 when price is negative', async () => {
            const item = await Item.create({ name: 'Test Item', price: 100 });
            const response = await fetch(`${baseUrl}/items/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'Updated Item',
                    price: -200
                })
            });
            const data = await response.json();
            expect(response.status).toBe(400);
            expect(data).toEqual({
                errors: [
                    {
                        field: 'price',
                        message: 'Price cannot be negative'
                    }
                ]
            });
        });
    });

    describe('DELETE /items/:id', () => {
        it('should delete existing item', async () => {
            const item = await Item.create({ name: 'Test Item', price: 100 });
            const response = await fetch(`${baseUrl}/items/${item.id}`, {
                method: 'DELETE'
            });
            expect(response.status).toBe(204);

            const deletedItem = await Item.findByPk(item.id);
            expect(deletedItem).toBeNull();
        });

        it('should return 404 when item does not exist', async () => {
            const response = await fetch(`${baseUrl}/items/1`, {
                method: 'DELETE'
            });
            const data = await response.json();
            expect(response.status).toBe(404);
            expect(data).toEqual({ error: 'Item no encontrado' });
        });
    });
}); 