import { Schema, model } from "mongoose";
import { ICommentsModules, INotification } from "./notification.interface";
import { NOTIFICATION_MODEL_TYPE } from "./notification.constant";

const notificationSchema = new Schema<INotification>(
  {
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reference: {
      type: Schema.Types.ObjectId,
      refPath: "modelType",
    },
    modelType: {
      type: String,
      enum: Object.values(NOTIFICATION_MODEL_TYPE),
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Notification = model<INotification, ICommentsModules>(
  "Notification",
  notificationSchema,
);
