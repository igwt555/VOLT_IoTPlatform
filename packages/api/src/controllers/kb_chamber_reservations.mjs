import KbChamberReservation from '../models/kb_chamber_reservation.mjs';

export const findAll = async (req, res) => {
  const kbChamberReservation = await KbChamberReservation.findAll();
  return res.json({ kbChamberReservation, success: true });
};

export const create = async (req, res) => {
  await KbChamberReservation.create({ ...req.body });
  const kbChamberReservation = await KbChamberReservation.findAll();
  return res.json({ kbChamberReservation, success: true });
};
