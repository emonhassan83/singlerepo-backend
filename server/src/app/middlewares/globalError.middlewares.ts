import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ZodError } from 'zod';

import { IErrorMessage } from '@/app/@types/system.types';
import { env } from '@/app/configs/env.configs';
import logger from '@/app/configs/logger.configs';
import { getTraceId } from '@/app/configs/requestContext.configs';
import ApiError from '@/app/errors/ApiError';
import handleDuplicateError from '@/app/errors/handleDuplicateError';
import handleValidationError from '@/app/errors/handleValidationError';
import handleZodError from '@/app/errors/handleZodError';

export const globalErrorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const traceId = getTraceId();

  let code = 500;
  let message = 'Something went wrong';
  let errorMessages: IErrorMessage[] = [];

  // Handle ZodError
  if (err.name === 'ZodError') {
    const simplifiedError = handleZodError(err as ZodError, traceId);
    code = simplifiedError.code;
    message = `${simplifiedError.errorMessages
      .map((err) => err.message)
      .join(', ')}`;
    errorMessages = simplifiedError.errorMessages;
  }
  // Handle ValidationError (e.g., Mongoose)
  else if (err.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err as MongooseError.ValidationError, traceId);
    code = simplifiedError.code;
    message = `${simplifiedError.errorMessages
      .map((err) => err.message)
      .join(', ')}`;
    errorMessages = simplifiedError.errorMessages;
  }
  // Handle DuplicateError (e.g., from database unique constraint violation)
  else if (err.name === 'DuplicateError') {
    const simplifiedError = handleDuplicateError(err, traceId);
    code = simplifiedError.code;
    message = `${simplifiedError.errorMessages
      .map((err) => err.message)
      .join(', ')}`;
    errorMessages = simplifiedError.errorMessages;
  }
  // Handle ApiError (custom error type)
  else if (err instanceof ApiError) {
    code = err.code;
    message = err.message || 'Something went wrong';
    errorMessages = err.message
      ? [
          {
            path: '',
            message: err.message,
          },
        ]
      : [];
  }
  // Handle generic Error
  else {
    logger.error({
      traceId: traceId,
      message: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      traceId: traceId,
    });
    return;
  }

  logger.error({
    traceId,
    message: message,
    stack: err.stack,
  });

  // Format multiple error messages as a comma-separated list in the message field
  const formattedMessage =
    errorMessages.length > 1
      ? errorMessages.map((err) => err.message).join(', ')
      : message;

  // Send response with statusCode, success, message, and error
  res.status(code).json({
    success: false,
    statusCode: code,
    message: `${formattedMessage}`,
    error: errorMessages, // Error details (path and message)
    traceId: traceId,
    stack: env.NODE_ENV === 'development' ? err?.stack : undefined, // Stack trace in development mode
  });
};
