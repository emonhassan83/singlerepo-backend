import { JwtPayload } from 'jsonwebtoken';
 
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & { userId: string; _id: string; role: string; email: string };
      profile?: any;
      fileLimit?: number;
      fieldName?: string;
      requireAtLeastOne?: boolean;
      allOptional?: boolean;
      fieldConfig?: FieldConfig[];
      fileRequired: boolean;
      files?: { [fieldname: string]: Express.Multer.File[] };
      validatedQuery?: unknown;
    }
  }
}
