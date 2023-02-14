import { HttpService } from './base';

class DirectoryService extends HttpService {
  prefix = 'directory';

  create = data => this.post(this.prefix, data);

  findAll = () => this.get(this.prefix);

  findByDirectoryId = directoryId => this.get(`${this.prefix}/${directoryId}`);

  updateDirectory = (id, body) => this.put(`${this.prefix}/update/${id}`, body);

  deleteDirectory = data => this.delete(`${this.prefix}/deleteDir`, data);
}
export const directoryService = new DirectoryService();
