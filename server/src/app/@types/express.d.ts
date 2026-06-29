import { JwtPayload } from 'jsonwebtoken';
 
import UserModel from '@/app/schemas/user/user.schema';
 
declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | UserModel;
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
