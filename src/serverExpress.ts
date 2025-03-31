
import express, { Express } from 'express';
import { sequelize } from './common/config/database';
import itemRoutes from './item/routes/itemRoutes';
import dotenv from 'dotenv';
//#endregion
dotenv.config();

export class ServerExpress {
    private app: Express;
    private port: number;

    constructor() {
        this.app = express();
        this.port = Number(process.env.PORT) || 3000;
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        this.app.use(express.json());
    }

    private setupRoutes(): void {
        // Ping route
        this.app.get('/api/ping', (_req, res) => {
            res.json({ ok: true });
        });

        // Items routes
        this.app.use('/api/items', itemRoutes);
    }

    public async start(): Promise<void> {
        try {
            await sequelize.sync();
            console.log('Database synchronized');
        } catch (error) {
            console.error('Error synchronizing database:', error);
            throw error;
        }
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log(`Express server running on port ${this.port}`);
        });
    }
} 