//#region Imports
import { Router } from 'express';
import { ItemController } from '../controllers/itemController';
//#endregion

const router = Router();
const itemController = new ItemController();

router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.post('/', itemController.createItem);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

export default router; 