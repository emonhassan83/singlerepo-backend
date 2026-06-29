import { Router } from 'express';
import multer, { memoryStorage } from 'multer';

import { UploadController } from './upload.controller';

const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });

// Handle file upload
router.post(
  '/',
  upload.single('file'),
  UploadController.single,
);

router.post(
  '/multiple',
  upload.fields([{ name: 'files', maxCount: 10 }]),
  UploadController.multiple,
);

export const UploadRoutes = router;
