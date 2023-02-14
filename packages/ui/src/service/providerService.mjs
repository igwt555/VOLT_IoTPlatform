import { HttpService } from './base';

class ProviderService extends HttpService {
  prefix = 'provider';

  create = data => this.post(this.prefix, data);

  findAll = () => this.get(this.prefix);

  findByProviderId = providerId => this.get(`${this.prefix}/${providerId}`);
}
export const providerService = new ProviderService();
