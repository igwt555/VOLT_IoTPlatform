import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import Device from './device.mjs';
import User from './user.mjs';

class OttoInspectionReport extends Model {}
export default OttoInspectionReport;

OttoInspectionReport.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
    },
    device_id: {
      type: DataTypes.UUID,
    },
    report: {
      type: DataTypes.JSONB,
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'OttoInspectionReport',
    tableName: 'otto_inspection_reports',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

OttoInspectionReport.belongsTo(User, { foreignKey: 'user_id' });
OttoInspectionReport.belongsTo(Device, { foreignKey: 'device_id' });
