import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';

class Domain extends Model {}
export default Domain;

Domain.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('Available', 'Not-Available'),
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: 'Domain',
    tableName: 'domains',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);
