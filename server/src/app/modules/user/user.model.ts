import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

import { IUser, IUserModal } from "./user.interface";
import {
  REGISTER_WITH,
  registerWith,
  USER_ROLE,
  USER_STATUS,
} from "./user.constant";
import { generateCryptoString } from "@/app/utils/generateCryptoString";

const userSchema = new Schema<IUser, IUserModal>(
  {
    // Define your schema properties here
    id: {
      type: String,
      unique: true,
      default: () => generateCryptoString(4),
    },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    password: { type: String, required: true },
    fcmToken: { type: String, default: null },
    profileAvatar: { type: String, default: null },

    countryCode: { type: String, default: null },
    phone: { type: String, default: null },
    address: { type: String, required: false },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    timeZone: { type: String, default: "UTC" },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.user,
      index: true,
    },

    registerWith: {
      type: String,
      enum: registerWith,
      default: REGISTER_WITH.credentials,
    },

    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.active,
      index: true,
    },
    needsPasswordChange: { type: Boolean },
    passwordChangedAt: { type: Date },
    isSignUpOtpVerified: {
      type: Boolean,
      default: false,
    },
    isLoginOTPVerified: {
      type: Boolean,
      default: false,
    },
    isResetPasswordVerified: {
      type: Boolean,
      default: false,
    },
    isChangeEmailOtpVerified: {
      type: Boolean,
      default: false,
    },
    isChangePhoneOtpVerified: {
      type: Boolean,
      default: false,
    },
    isLegalTermsAccepted: { type: Boolean, required: true },

    expireAt: {
      type: Date,
      default: () => {
        const expireAt = new Date();
        return expireAt.setMinutes(expireAt.getMinutes() + 30);
      },
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Static methods
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await this.findOne({ email });
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

// for location and auto expire inactive users
userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function () {
  // Hash password if modified
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

export const User: IUserModal = model<IUser, IUserModal>("User", userSchema);
