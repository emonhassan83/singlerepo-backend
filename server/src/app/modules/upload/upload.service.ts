import { HttpStatusCode } from 'axios';

import {
  categorizeFile,
  generateS3Key,
  getExtension,
  normalizeMulterFiles,
  toMB,
} from './upload.helpers';

import ApiError from '@/app/errors/ApiError';
import { uploadManyToS3, uploadToS3 } from '@/app/utils/s3.utils';

const multiple = async (traceId: string, files: any): Promise<object[]> => {
  const fileArray = normalizeMulterFiles(files);
  if (!fileArray.length) return [];

  const tasks = fileArray.map((file) => {
    const { folder } = categorizeFile(file);
    const key = generateS3Key(file);
    return { file, folder, key };
  });

  const uploaded = await uploadManyToS3(tasks);

  return uploaded.map((item, i) => {
    const file = fileArray[i];
    const { type } = categorizeFile(file);
    const ext = getExtension(file);
    return {
      url: item.url,
      size: toMB(file.size),
      extension: ext ? `.${ext}` : null,
      type,
      mimetype: file.mimetype,
      originalName: file.originalname,
    };
  });
};

const single = async (traceId: string, file: Express.Multer.File | undefined): Promise<object> => {
  if (!file) {
    throw new ApiError(HttpStatusCode.BadRequest, 'File is required', traceId);
  }

  const fileName = `${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const url = await uploadToS3({ file, fileName });

  return { url, size: toMB(file.size) };
};

export const UploadService = { multiple, single };
