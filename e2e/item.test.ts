import request from 'supertest';
import { ServerExpress } from '../src/serverExpress';
import { sequelize } from '../src/common/config/database';
import dotenv from 'dotenv';

dotenv.config();

describe('Item API Tests', () => {
    let server: ServerExpress;

    beforeAll(async () => {
        server = new ServerExpress();
        await server.start();
        server.listen();
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    beforeEach(async () => {
        await sequelize.sync({ force: true });
    });

    describe('Basic Items functionality', () => {
        it('should be able to list all items', async () => {
            const response = await request(`http://localhost:${process.env.PORT}`).get('/api/items');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                items: [],
                total: 0,
                currentPage: 1,
                totalPages: 0,
                itemsPerPage: 10
            });
        });

        it('should be able to create a new item', async () => {
            const createResponse = await request(`http://localhost:${process.env.PORT}`)
                .post('/api/items')
                .send({
                    name: 'Item 1',
                    price: 100
                });

            expect(createResponse.status).toBe(201);
            expect(createResponse.body).toEqual(
                expect.objectContaining({
                    name: 'Item 1',
                    price: 100
                })
            );

            const response = await request(`http://localhost:${process.env.PORT}`).get('/api/items');
            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(1);
            expect(response.body.items[0]).toEqual(
                expect.objectContaining({
                    name: 'Item 1',
                    price: 100
                })
            );
        });

        it('should be able to get an item by id', async () => {
            const createResponse = await request(`http://localhost:${process.env.PORT}`)
                .post('/api/items')
                .send({
                    name: 'Item 1',
                    price: 100
                });

            const response = await request(`http://localhost:${process.env.PORT}`)
                .get(`/api/items/${createResponse.body.id}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    name: 'Item 1',
                    price: 100
                })
            );
        });

        it('should be able to update an item', async () => {
            const createResponse = await request(`http://localhost:${process.env.PORT}`)
                .post('/api/items')
                .send({
                    name: 'Item 1',
                    price: 100
                });

            const response = await request(`http://localhost:${process.env.PORT}`)
                .put(`/api/items/${createResponse.body.id}`)
                .send({
                    name: 'Item 1 updated',
                    price: 200
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    name: 'Item 1 updated',
                    price: 200
                })
            );

            const response2 = await request(`http://localhost:${process.env.PORT}`)
                .get(`/api/items/${createResponse.body.id}`);
            
            expect(response2.status).toBe(200);
            expect(response2.body).toEqual(
                expect.objectContaining({
                    name: 'Item 1 updated',
                    price: 200
                })
            );
        });

        it('should be able to delete an item', async () => {
            const createResponse = await request(`http://localhost:${process.env.PORT}`)
                .post('/api/items')
                .send({
                    name: 'Item 1',
                    price: 100
                });

            const response = await request(`http://localhost:${process.env.PORT}`)
                .delete(`/api/items/${createResponse.body.id}`);
            
            expect(response.status).toBe(204);

            const response2 = await request(`http://localhost:${process.env.PORT}`)
                .get(`/api/items/${createResponse.body.id}`);
            
            expect(response2.status).toBe(404);
            expect(response2.body).toEqual({
                error: 'Item not found'
            });
        });
    });

    describe('Validation Tests', () => {
        it('should return 400 when creating item with negative price', async () => {
            const response = await request(`http://localhost:${process.env.PORT}`)
                .post('/api/items')
                .send({
                    name: 'Item 1',
                    price: -100
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                errors: [
                    {
                        field: 'price',
                        message: 'Price cannot be negative'
                    }
                ]
            });
        });

        it('should return 400 when creating item without name', async () => {
            const response = await request(`http://localhost:${process.env.PORT}`)
                .post('/api/items')
                .send({
                    price: 100
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                errors: [
                    {
                        field: 'name',
                        message: 'Name and price are required'
                    }
                ]
            });
        });

        it('should return 404 when updating non-existent item', async () => {
            const response = await request(`http://localhost:${process.env.PORT}`)
                .put('/api/items/999')
                .send({
                    name: 'Item 1',
                    price: 100
                });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: 'Item not found'
            });
        });

        it('should return 404 when deleting non-existent item', async () => {
            const response = await request(`http://localhost:${process.env.PORT}`)
                .delete('/api/items/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: 'Item not found'
            });
        });
    });

    describe('Pagination Tests', () => {
        it('should return paginated items', async () => {
            // Create 15 items
            await Promise.all(
                Array.from({ length: 15 }, (_, i) =>
                    request(`http://localhost:${process.env.PORT}`)
                        .post('/api/items')
                        .send({
                            name: `Item ${i + 1}`,
                            price: 100
                        })
                )
            );

            // Test first page
            const response1 = await request(`http://localhost:${process.env.PORT}`)
                .get('/api/items?page=1&limit=10');
            
            expect(response1.status).toBe(200);
            expect(response1.body.items).toHaveLength(10);
            expect(response1.body.total).toBe(15);
            expect(response1.body.currentPage).toBe(1);
            expect(response1.body.totalPages).toBe(2);
            expect(response1.body.itemsPerPage).toBe(10);

            // Test second page
            const response2 = await request(`http://localhost:${process.env.PORT}`)
                .get('/api/items?page=2&limit=10');
            
            expect(response2.status).toBe(200);
            expect(response2.body.items).toHaveLength(5);
            expect(response2.body.currentPage).toBe(2);
        });

        it('should handle invalid pagination parameters', async () => {
            const response = await request(`http://localhost:${process.env.PORT}`)
                .get('/api/items?page=-1&limit=10');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                error: 'Page and limit parameters must be positive numbers'
            });
        });
    });
}); 