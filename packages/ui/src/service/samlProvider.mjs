import { HttpService } from './base.mjs';

class SamlProviderService extends HttpService {
  getSamlProvider = id => this.get(`samlprovider/${id}`);

  getSamlProviders = () => this.get('samlprovider');

  updateSamlProvider = (id, body) => this.post(`samlprovider/${id}`, body);

  deleteSAMLProvider = id => this.delete(`samlprovider/${id}`);
}
// eslint-disable-next-line import/prefer-default-export
export const samlProviderService = new SamlProviderService();
