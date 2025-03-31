//#region Imports
import { Item } from '../models/Item';
import { ValidationError } from '../../common/types/types';
//#endregion

export class ItemService {
  async findAll(page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await Item.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      
      return {
        items: rows,
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        itemsPerPage: limit
      };
    } catch (error) {
      throw new Error('Error getting items');
    }
  }

  async findById(id: string) {
    try {
      const item = await Item.findByPk(id);
      if (!item) {
        throw new Error('Item not found');
      }
      return item;
    } catch (error) {
      if (error instanceof Error && error.message === 'Item not found') {
        throw error;
      }
      throw new Error('Error getting item');
    }
  }

  async create(name: string, price: number) {
    try {
      if (!name || !price) {
        throw new ValidationError('Name and price are required');
      }
      if (price < 0) {
        throw new ValidationError('Price cannot be negative');
      }
      return await Item.create({ name, price });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Error creating item');
    }
  }

  async update(id: string, name: string, price: number) {
    try {
      const item = await Item.findByPk(id);
      if (!item) {
        throw new Error('Item not found');
      }
      if (price < 0) {
        throw new ValidationError('Price cannot be negative');
      }
      await item.update({ name, price });
      return item;
    } catch (error) {
      if (error instanceof Error && 
        (error.message === 'Item not found' || error instanceof ValidationError)) {
        throw error;
      }
      throw new Error('Error updating item');
    }
  }

  async delete(id: string) {
    try {
      const item = await Item.findByPk(id);
      if (!item) {
        throw new Error('Item not found');
      }
      await item.destroy();
    } catch (error) {
      if (error instanceof Error && error.message === 'Item not found') {
        throw error;
      }
      throw new Error('Error deleting item');
    }
  }
} 