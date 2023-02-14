/* eslint-disable import/no-cycle */
import { Server } from 'socket.io';

import Db from './db.mjs';
import { tryRegisterDevice } from './utils/tryRegisterDevice.mjs';
import getUserFromToken from './helpers/getUserFromToken.mjs';
import Organization from './models/organization.mjs';
import Device from './models/device.mjs';

export const ccs = {}; // current connections

export const NAMESPACE = Object.freeze({
  WSUNIT: '/wsunit',
  WSWEBCLIENT: '/wsWebClient',
  chartdata: '/chartdata',
});
export const io = new Server({
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
  },
});

export const wsUnitNamespace = io.of(NAMESPACE.WSUNIT);
export const wsWebClientNamespace = io.of(NAMESPACE.WSWEBCLIENT);
export const chartDataNamespace = io.of(NAMESPACE.chartdata);

// eslint-disable-next-line consistent-return
wsUnitNamespace.use(async (socket, next) => {
  // const authToken = socket.handshake?.query?.token;
  // if (!authToken) {
  //   return next(new Error('Authentication error'));
  // }
  // const user = await getUserFromToken(authToken);
  // // eslint-disable-next-line no-param-reassign
  // socket.device = user;
  next();
});

// eslint-disable-next-line consistent-return
wsWebClientNamespace.use(async (socket, next) => {
  const authToken = socket.handshake?.query?.token;
  if (!authToken) {
    return next(new Error('Authentication error'));
  }
  const user = await getUserFromToken(authToken);
  // eslint-disable-next-line no-param-reassign
  socket.data = user;
  next();
});

// eslint-disable-next-line consistent-return
chartDataNamespace.use(async (socket, next) => {
  const authToken = socket.handshake?.query?.token;
  if (!authToken) {
    return next(new Error('Authentication error'));
  }
  const user = await getUserFromToken(authToken);
  // eslint-disable-next-line no-param-reassign
  socket.data = user;
  next();
});

wsUnitNamespace.on('connection', async socket => {
  // eslint-disable-next-line no-unused-vars
  const { macAddrEth } = socket.handshake.query;
  const mac = macAddrEth?.replace(/:/g, '');
  socket.join(mac);
  console.log(`Device connected. MAC: ${mac}, socketId: ${socket.id} from ${socket.handshake.address}`);
  ccs[mac] = socket;
  const device = await tryRegisterDevice(mac);

  socket.on('disconnect', async () => {
    delete ccs[mac];
    Device.update({ last_connectivity_event: Date.now() }, { where: { id: device?.id }, limit: 1 });
    console.log('[WS] >> [browsers]', { event: 'leave', unit: mac });
  });

  console.log('[WS] >> [browsers]', { event: 'join', unit: mac });

  const { settings } = await Organization.findByPk(device.organization_id, {
    attributes: ['settings'],
    raw: true,
  });
  socket.emit('settingsChange', settings);
});

wsWebClientNamespace.on('connection', socket => {
  const { token } = socket.handshake.query;
  console.log(`Web client connected. socketId: ${socket.id} from ${socket.handshake.address}`);

  if (token !== '&JanMUy7p&P9K37o0*Ho1Ah4') { // TODO: implement short-term token
    console.warn(`Disconnecting web client (${socket.id}) that presented bad AUTH:`, token);
    return socket.disconnect();
  }
  return null;
});

chartDataNamespace.on('connection', async socket => {
  socket.on('join', room => {
    if (socket?.data?.user) {
      socket.join(room);
      socket.to(room).emit('Authenticated User Joined');
      return { ok: true };
    }
    return { ok: false, error: `Access denied to room: ${room}` };
  });
});

export const getActiveCodes = async () => {
  const dbRes = await Db.manyOrNone('SELECT sales_id as "salesId", code FROM codes');
  const accessCodes = dbRes.map(r => `${r.salesId}*${r.code}`);
  return accessCodes;
};

export const sendCodesToUnits = async codes => {
  console.log('[WS] >> [units] EVT:updateCodes', codes?.length, 'codes');
  io.of(NAMESPACE.WSUNIT).emit('updateCodes', codes);
};
