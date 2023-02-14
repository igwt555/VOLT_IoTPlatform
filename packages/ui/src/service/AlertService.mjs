import axios from 'axios';

export default class AlertService {
  async getAlertSettings() {
    return axios.get('data/alerts/default.json').then(res => {
      localStorage.setItem('alerts', JSON.stringify(res.data.data));
      return res.data.data;
    });
  }

  async getAlerts() {
    return axios.get('data/alerts/alerts.json').then(res => res.data.data);
  }

  async changeAlertState(id) {
    const alerts = JSON.parse(localStorage.getItem('alerts'));
    const index = alerts.findIndex(alert => alert.id === id);
    alerts[index].value = !alerts[index].value;
    localStorage.setItem('alerts', JSON.stringify(alerts));
    return alerts;
  }
}
