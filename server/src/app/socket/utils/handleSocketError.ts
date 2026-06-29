import mongoose from "mongoose";
import { Socket } from "socket.io";

import { TAckFn } from "../interface/socket.interface";

import ackHandler from "./ackHandler";

import ApiError from "@/app/errors/ApiError";

/**
 * Handles all types of errors in Socket.io events with proper status codes and messages
 * Designed to match the style and structure of the Prisma version
 */
export const handleSocketError = (err: any, socket: Socket, ack?: TAckFn) => {
  let status = 500;
  let message = "Something went wrong!";
  let error = err;

  // ==================== Mongoose Validation Error ====================
  if (err instanceof mongoose.Error.ValidationError) {
    status = 422;
    message = "Validation error!";

    const errors: any = {};

    // Collect detailed validation errors for each field
    Object.keys(err.errors).forEach((key) => {
      const e = err.errors[key];
      errors[key] = {
        message: e.message,
        kind: e.kind,
        path: e.path,
        value: e.value,
      };
    });

    // Use the first error message as the main message
    const firstError = Object.values(err.errors)[0];
    message = firstError?.message || "Validation failed";

    error = {
      message,
      errors, // Detailed field-level errors
      code: "validation_error",
    };
  }

  // ==================== Cast Error (Invalid ObjectId, Wrong Type, etc.) ====================
  else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    error = {
      message,
      path: err.path,
      value: err.value,
      kind: err.kind,
      code: "cast_error",
    };
  }

  // ==================== Duplicate Key Error (Unique Constraint Violation) ====================
  else if (err.name === "MongoServerError" && err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    const value = err.keyValue?.[field];

    message = `${field} '${value}' already exists!`;
    error = {
      message,
      field,
      value,
      code: "duplicate_key",
    };
  }

  // ==================== Document Not Found ====================
  else if (
    err.name === "DocumentNotFoundError" ||
    message.toLowerCase().includes("not found")
  ) {
    status = 404;
    message = "Record not found!";
  }

  // ==================== Custom ApiError ====================
  else if (err instanceof ApiError) {
    status = err.code;
    message = err.message;
    error = err;
  }

  // ==================== JWT Authentication Errors ====================
  else if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token!";
  } else if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token has expired!";
  }

  // ==================== General MongoDB / Mongoose Errors ====================
  else if (err.name === "MongoServerError") {
    switch (err.code) {
      case 11001:
        message = "Duplicate key error!";
        status = 409;
        break;
      default:
        message = "Database operation failed!";
    }
  }

  // ==================== Fallback for any other Error ====================
  else if (err instanceof Error) {
    message = err.message || message;
  }

  // ==================== Send Response to Client ====================
  if (ack) {
    ackHandler(ack, { success: false, message, status });
  }

  socket.emit("socketError", {
    success: false,
    status,
    message,
    error: error instanceof Error ? error.message : error,
  });

  // Log error for debugging (remove or adjust in production if needed)
  console.error("[Socket Error]:", {
    status,
    message,
    originalError: err,
  });
};