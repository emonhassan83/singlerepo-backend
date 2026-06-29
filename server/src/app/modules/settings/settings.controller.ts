import { Request, Response } from 'express';

import { SettingService } from './settings.service';

import { getTraceId } from '@/app/configs/requestContext.configs';
import { asyncHandler, sendResponse } from '@/app/utils/system.utils';

const getSetting = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await SettingService.getSetting(traceId, req.query.key as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Setting retrieved successfully',
    data,
    traceId,
  });
});

const getSettingGenerals = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await SettingService.getSettingGenerals(traceId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'General settings retrieved successfully',
    data,
    traceId,
  });
});

const createOrUpdate = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await SettingService.createOrUpdate(traceId, req.params.key as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Setting updated successfully',
    data,
    traceId,
  });
});

const updateGenerals = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  await SettingService.updateGenerals(traceId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'General settings updated successfully',
    data: null,
    traceId,
  });
});

export const SettingController = {
  getSetting,
  getSettingGenerals,
  createOrUpdate,
  updateGenerals,
};
