import Sequelize from 'sequelize';
import enVariables from './config.mjs';

const env = process.env.NODE_ENV || 'development';
const config = enVariables[env];
const db = {};

export const sequelize =
  process.env.NODE_ENV === 'test' ? new Sequelize('sqlite::memory:', config) :
    process.env.DATABASE_URL ? new Sequelize(process.env.DATABASE_URL, config) :
      new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

export const onDbReady = db.sequelize
  .sync()
  .then(() => console.log('Database connection succeeded:', sequelize.config.host?.length > 0 ? sequelize.config.host : sequelize.config.database))
  .catch(err => console.log('Err in db connection', err));

export default db;
