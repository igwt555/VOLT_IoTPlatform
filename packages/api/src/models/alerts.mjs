import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import Organization from './organization.mjs';

class Alerts extends Model { }
export default Alerts;
Alerts.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  description: {
    type: DataTypes.STRING,
  },
  organization_id: {
    type: DataTypes.UUID,
  },
}, { timestamps: true, sequelize, modelName: 'Alerts', tableName: 'alerts', createdAt: 'created_at', updatedAt: 'updated_at' });
Alerts.belongsTo(Organization, { foreignKey: 'organization_id' });
