export const CACHE = {
  TTL_SHORT:    20_000,   // 20 วินาที
  TTL_MEDIUM:   60_000,   // 1 นาที
  TTL_LONG:     300_000,  // 5 นาที
  TOKEN_TTL:    60_000,   // 1 นาที (user token cache)
  MAX_TOKENS:   1_000,    // LRU cache size
} as const;

export const LIMITS = {
  FILE_SIZE_MAX:     50 * 1024 * 1024,  // 50MB (upload)
  AVATAR_SIZE_MAX:   5 * 1024 * 1024,   // 5MB (community upload)
  AVATAR_MAX_OUTPUT: 5 * 1024 * 1024,   // 5MB (after processing)
  STOCK_COMPRESS_MIN: 250,              // จำนวน items ก่อน compress
  STOCK_COMPRESS_BYTES: 50_000,         // bytes ก่อน compress
  PAGINATION_MAX:    1_000,             // max rows per query
  RETRY_MAX:         5,                 // max retry attempts
  ENCRYPTION_ITERATIONS: 100_000,       // PBKDF2 iterations
} as const;

export const HTTP = {
  OK:            200,
  CREATED:       201,
  BAD_REQUEST:   400,
  UNAUTHORIZED:  401,
  FORBIDDEN:     403,
  NOT_FOUND:     404,
  CONFLICT:      409,
  TOO_MANY:      429,
  SERVER_ERROR:  500,
} as const;

export const RATE_LIMIT = {
  AUTH_WINDOW_MS:      15 * 60 * 1000,  // 15 นาที
  AUTH_MAX:            50,
  MUTATION_WINDOW_MS:  1 * 60 * 1000,   // 1 นาที
  MUTATION_MAX:        30,
  GLOBAL_WINDOW_MS:    1 * 60 * 1000,
  GLOBAL_MAX:          200,
} as const;
