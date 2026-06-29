import { AsyncResource } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import { requestContext } from '@/app/configs/requestContext.configs';

let uuidModule: any = null;

export const traceMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const runTrace = (v4: () => string) => {
    const traceId = v4();
    requestContext.run({ traceId }, () => {
      res.setHeader('x-trace-id', traceId);
      AsyncResource.bind(next)();
    });
  };

  if (uuidModule) {
    runTrace(uuidModule.v4);
  } else {
    import('uuid')
      .then((mod) => {
        uuidModule = mod;
        runTrace(mod.v4);
      })
      .catch((err) => {
        next(err);
      });
  }
};
