// Central place to read process.env once, typed, instead of
// process.env.X scattered across the app (like you'd do in Express).
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',

  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/todo_db',

  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },

  corsOrigin: process.env.CORS_ORIGIN ?? '*',

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
});
