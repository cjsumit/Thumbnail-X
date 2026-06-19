import express from 'express';
import { getThumbnailbyId, getUsersThumbnails } from '../controllers/UserController.js';
import protect from '../middlewares/auth.js';
const UserRouter = express.Router();
UserRouter.get('/thumbnail', protect, getUsersThumbnails);
UserRouter.get('/thumbnail/:id', protect, getThumbnailbyId);
export default UserRouter;
