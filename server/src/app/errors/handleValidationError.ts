import { Error } from 'mongoose';

import { IErrorMessage } from '@/app/@types/system.types';

const handleValidationError = (error: Error.ValidationError, traceId?: string) => {
  const errorMessages: IErrorMessage[] = Object.values(error.errors).map(
    (el: Error.ValidatorError | Error.CastError) => {
      return {
        path: el.path,
        message: el.message,
      };
    }
  );

  const code = 400;
  return {
    code,
    message: 'Validation Error',
    errorMessages,
    traceId,
  };
};

export default handleValidationError;
