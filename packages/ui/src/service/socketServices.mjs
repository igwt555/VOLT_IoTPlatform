import { io } from 'socket.io-client';

class SocketioService {
  socket;

  setupSocketConnection = async () => {
    const token = JSON.parse(localStorage.getItem('vuex'))?.auth?.token;
    this.socket = await io(`${window.location.host}/chartdata`, {
      connection: 'Upgrade',
      'sec-websocket-version': '13',
      upgrade: 'websocket',
      query: { token },
    });

    this.socket.emit('join');

    this.socket.on('Authenticated User Joined', () => {
      console.log('Authenticated user joined');
    });
  };

  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
    }
  };
}

export default new SocketioService();
