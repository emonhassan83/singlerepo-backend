import { Request, Response } from 'express';

import { getTraceId } from '@/app/configs/requestContext.configs';
import { OtpServices } from '@/app/modules/otp/otp.services';
import { asyncHandler, sendResponse } from '@/app/utils/system.utils';

const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const token = req?.headers?.authorization;
  const data = await OtpServices.verifyOTP(
    traceId,
    token as string,
    req.body.otp,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User signup successful',
    data,
    traceId,
  });
});

const sentOTPInMail = asyncHandler(async (req: Request, res: Response) => {
  const traceId = getTraceId();
  const data = await OtpServices.sendOtpInEmail(
    traceId,
    req.user._id,
    req.body.email
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Send OTP in mail please check it!',
    data,
    traceId,
  });
});

const sendOtpViaTokenInPhone = asyncHandler(
  async (req: Request, res: Response) => {
    const traceId = getTraceId();
    const result = await OtpServices.sendOtpViaTokenInPhone(
      traceId,
      req.user.userId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'OTP sent successfully',
      data: result,
      traceId,
    });
  }
);

const sendOtpViaDirectPhone = asyncHandler(
  async (req: Request, res: Response) => {
    const traceId = getTraceId();
    const result = await OtpServices.sendOtpViaDirectPhone(traceId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'OTP sent successfully',
      data: result,
      traceId,
    });
  }
);

export const OtpControllers = {
  verifyOTP,
  sentOTPInMail,
  sendOtpViaTokenInPhone,
  sendOtpViaDirectPhone,
};
