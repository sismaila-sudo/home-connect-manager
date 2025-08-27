const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('🚨 Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // PostgreSQL error handling
  if (err.code === '23505') {
    // Duplicate key error
    const message = 'Resource already exists';
    error = {
      message,
      statusCode: 400,
      type: 'DUPLICATE_KEY'
    };
  }

  if (err.code === '23503') {
    // Foreign key constraint error
    const message = 'Referenced resource not found';
    error = {
      message,
      statusCode: 400,
      type: 'FOREIGN_KEY_CONSTRAINT'
    };
  }

  if (err.code === '23502') {
    // Not null constraint error
    const message = 'Required field is missing';
    error = {
      message,
      statusCode: 400,
      type: 'NOT_NULL_CONSTRAINT'
    };
  }

  if (err.code === '22001') {
    // String data too long
    const message = 'Input data too long';
    error = {
      message,
      statusCode: 400,
      type: 'STRING_TOO_LONG'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401,
      type: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401,
      type: 'TOKEN_EXPIRED'
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
      type: 'VALIDATION_ERROR'
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = {
      message,
      statusCode: 400,
      type: 'FILE_TOO_LARGE'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = {
      message,
      statusCode: 400,
      type: 'UNEXPECTED_FILE'
    };
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    const message = 'Invalid ID format';
    error = {
      message,
      statusCode: 400,
      type: 'INVALID_ID'
    };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    const message = 'Too many requests, please try again later';
    error = {
      message,
      statusCode: 429,
      type: 'RATE_LIMITED'
    };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const type = error.type || 'SERVER_ERROR';

  const errorResponse = {
    error: type,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }

  // Add request ID if available
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, type = 'APPLICATION_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError
};