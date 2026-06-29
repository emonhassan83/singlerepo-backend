// handleDuplicateError.ts
import { IErrorMessage } from "@/app/@types/system.types";

const handleDuplicateError = (error: any, traceId?: string) => {
  const errorMessages: IErrorMessage[] = [
    {
      path: error.keyValue ? Object.keys(error.keyValue)[0] : 'unknown',
      message: `${Object.keys(error.keyValue)[0]} already exists`,
    },
  ];

  const code = 409;
  return {
    code,
    message: 'Duplicate entry detected',
    errorMessages,
    traceId,
  };
};

export default handleDuplicateError;
