import 'dotenv/config';

const {
  DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_HOSTNAME, DATABASE_PORT, DATABASE_SSL } = process.env;

const dialectOptions = {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
};

export default {
  development: {
    username: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    host: DATABASE_HOSTNAME,
    port: DATABASE_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: DATABASE_HOSTNAME?.includes('localhost') || DATABASE_HOSTNAME?.includes('127.0.0.1') || DATABASE_SSL === 'false' ? {} : dialectOptions,
  },
  test: {
    dialect: 'sqlite',
    force: true,
  },
  production: {
    dialect: 'postgres',
    dialectOptions,
  },
};
