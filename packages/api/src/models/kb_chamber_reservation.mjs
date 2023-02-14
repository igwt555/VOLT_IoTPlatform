import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db.mjs';
import Device from './device.mjs';
import User from './user.mjs';
import KbDevice from './kb_device.mjs';

class KbChamberReservation extends Model {}
export default KbChamberReservation;

KbChamberReservation.init(
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
    chamber_id: {
      type: DataTypes.INTEGER,
    },
    reservation_type: {
      type: DataTypes.ENUM('one-off', 'persistent'),
    },
    created_by: {
      type: DataTypes.UUID,
    },
    kb_device_id: {
      type: DataTypes.UUID,
    },
  },
  { timestamps: true, sequelize, modelName: 'Kb_Chamber_Reservation', tableName: 'kb_chamber_reservations', createdAt: 'created_at', updatedAt: 'updated_at' },
);

KbChamberReservation.belongsTo(User, { foreignKey: 'user_id' });
KbChamberReservation.belongsTo(Device, { foreignKey: 'device_id' });
KbChamberReservation.belongsTo(KbDevice, { foreignKey: 'kb_device_id' });
