import { HttpService } from './base';

class DomainService extends HttpService {
  prefix = 'domain';

  create = data => this.post(this.prefix, data);

  findAll = () => this.get(this.prefix);

  findByDomainId = domainId => this.get(`${this.prefix}/${domainId}`);
}
export const domainService = new DomainService();
