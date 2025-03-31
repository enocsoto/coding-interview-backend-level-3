//#region Imports
import { Request, Response } from 'express';
import { ItemService } from '../services/itemService';
import { ValidationError } from '../../common/types/types';
//#endregion

export class ItemController {
    private itemService: ItemService;
    private readonly DEFAULT_PAGE = 1;
    private readonly DEFAULT_LIMIT = 10;

    constructor() {
        this.itemService = new ItemService();
    }

    public getAllItems = async (req: Request, res: Response): Promise<Response> => {
        try {
            const page = req.query.page ? Number(req.query.page) : this.DEFAULT_PAGE;
            const limit = req.query.limit ? Number(req.query.limit) : this.DEFAULT_LIMIT;

            if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
                return res.status(400).json({
                    error: 'Page and limit parameters must be positive numbers'
                });
            }

            const result = await this.itemService.findAll(page, limit);
            return res.json(result);
        } catch (error) {
            console.error('Error in getAllItems:', error);
            return res.status(500).json({ 
                error: 'Error getting items',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    public getItemById = async (req: Request, res: Response): Promise<Response> => {
        try {
            const item = await this.itemService.findById(req.params.id);
            return res.json(item);
        } catch (error) {
            if (error instanceof Error && error.message === 'Item not found') {
                return res.status(404).json({ error: 'Item not found' });
            }
            console.error('Error in getItemById:', error);
            return res.status(500).json({ 
                error: 'Error getting item',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    public createItem = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { name, price } = req.body;
            const item = await this.itemService.create(name, price);
            return res.status(201).json(item);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({
                    errors: [
                        {
                            field: !req.body.name ? 'name' : 'price',
                            message: error.message
                        }
                    ]
                });
            }
            console.error('Error in createItem:', error);
            return res.status(500).json({ 
                error: 'Error creating item',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    public updateItem = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { name, price } = req.body;
            const item = await this.itemService.update(req.params.id, name, price);
            return res.json(item);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Item not found') {
                    return res.status(404).json({ error: 'Item not found' });
                }
                if (error instanceof ValidationError) {
                    return res.status(400).json({
                        errors: [
                            {
                                field: 'price',
                                message: error.message
                            }
                        ]
                    });
                }
            }
            console.error('Error in updateItem:', error);
            return res.status(500).json({ 
                error: 'Error updating item',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    public deleteItem = async (req: Request, res: Response): Promise<Response> => {
        try {
            await this.itemService.delete(req.params.id);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof Error && error.message === 'Item not found') {
                return res.status(404).json({ error: 'Item not found' });
            }
            console.error('Error in deleteItem:', error);
            return res.status(500).json({ 
                error: 'Error deleting item',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
} 