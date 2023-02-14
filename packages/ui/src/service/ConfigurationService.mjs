export default class ConfigurationService {
  getLocalStorageData(key) {
    return localStorage.getItem(key);
  }

  updateCompanyName(companyName) {
    localStorage.setItem('companyName', companyName);
  }

  async uploadLogo(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('companyLogo', reader.result);
        resolve(true);
      };
      reader.onerror = e => reject(e);
      reader.readAsDataURL(file);
    });
  }
}
