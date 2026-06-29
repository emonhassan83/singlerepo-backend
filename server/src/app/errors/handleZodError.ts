import { ZodError } from 'zod';

import { IErrorMessage } from '@/app/@types/system.types';

const handleZodError = (error: ZodError, traceId?: string) => {
  const errorMessages: IErrorMessage[] = error.issues.map(el => {
    return {
      path: String(el.path[el.path.length - 1]), 
      message: el.message,
    };
  });

  const code = 400;
  return {
    code,
    message: 'Zod Validation Error',
    errorMessages,
    traceId,
  };
};

export default handleZodError;
