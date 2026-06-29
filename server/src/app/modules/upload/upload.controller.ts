import { Request, Response } from 'express';

import { UploadService } from './upload.service';

import { getTraceId } from '@/app/configs/requestContext.configs';
import { asyncHandler, sendResponse } from '@/app/utils/system.utils';

const single = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await UploadService.single(traceId, req.file);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'File uploaded successfully',
    data,
    traceId,
  });
});

const multiple = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await UploadService.multiple(traceId, req.files);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Files uploaded successfully',
    data,
    traceId,
  });
});

export const UploadController = { single, multiple };
