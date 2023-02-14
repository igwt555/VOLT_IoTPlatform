export const googleAuth = (function () {
  const installClient = function () {
    const apiUrl = 'https://apis.google.com/js/api.js';
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = apiUrl;
      script.onreadystatechange = script.onload = function () {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
          setTimeout(() => {
            resolve();
          }, 500);
        }
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  };
  const initClient = function (config) {
    return new Promise((resolve, reject) => {
      window.gapi.load('auth2', () => {
        window.gapi.auth2
          .init(config)
          .then(() => {
            resolve(window.gapi);
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  };
  const Auth = function () {
    const _this = this;
    this.GoogleAuth = null; /* window.gapi.auth2.getAuthInstance() */
    this.isAuthorized = false;
    this.isInit = false;
    this.prompt = null;
    this.isLoaded = function () {
      // tslint:disable-next-line
      console.warn(
        'isLoaded() will be deprecated. You can use "this.$gAuth.isInit"',
      );
      return !!_this.GoogleAuth;
    };
    this.load = function (config, prompt) {
      installClient()
        .then(() => initClient(config))
        .then(gapi => {
          _this.GoogleAuth = gapi.auth2.getAuthInstance();
          _this.isInit = true;
          _this.prompt = prompt;
          _this.isAuthorized = _this.GoogleAuth.isSignedIn.get();
        })
        .catch(error => {
          console.error(error);
        });
    };
    this.signIn = function (successCallback, errorCallback) {
      return new Promise((resolve, reject) => {
        if (!_this.GoogleAuth) {
          if (typeof errorCallback === 'function') {
            errorCallback(false);
          }
          reject(false);
          return;
        }
        _this.GoogleAuth.signIn()
          .then(googleUser => {
            if (typeof successCallback === 'function') {
              successCallback(googleUser);
            }
            _this.isAuthorized = _this.GoogleAuth.isSignedIn.get();
            resolve(googleUser);
          })
          .catch(error => {
            if (typeof errorCallback === 'function') {
              errorCallback(error);
            }
            reject(error);
          });
      });
    };
    this.getAuthCode = function (successCallback, errorCallback) {
      return new Promise((resolve, reject) => {
        if (!_this.GoogleAuth) {
          if (typeof errorCallback === 'function') {
            errorCallback(false);
          }
          reject(false);
          return;
        }
        _this.GoogleAuth.grantOfflineAccess({ prompt: _this.prompt })
          .then(resp => {
            if (typeof successCallback === 'function') {
              successCallback(resp.code);
            }
            resolve(resp.code);
          })
          .catch(error => {
            if (typeof errorCallback === 'function') {
              errorCallback(error);
            }
            reject(error);
          });
      });
    };
    this.signOut = function (successCallback, errorCallback) {
      return new Promise((resolve, reject) => {
        if (!_this.GoogleAuth) {
          if (typeof errorCallback === 'function') {
            errorCallback(false);
          }
          reject(false);
          return;
        }
        _this.GoogleAuth.signOut()
          .then(() => {
            if (typeof successCallback === 'function') {
              successCallback();
            }
            _this.isAuthorized = false;
            resolve(true);
          })
          .catch(error => {
            if (typeof errorCallback === 'function') {
              errorCallback(error);
            }
            reject(error);
          });
      });
    };
  };
  return new Auth();
}());

export const installGoogleAuth = async options => {
  // set config
  let GoogleAuthConfig = null;
  const GoogleAuthDefaultConfig = {
    scope: 'profile email',
  };
  let prompt = 'select_account';
  if (typeof options === 'object') {
    GoogleAuthConfig = Object.assign(GoogleAuthDefaultConfig, options);
    if (options.scope) {
      GoogleAuthConfig.scope = options.scope;
    }
    if (options.prompt) {
      prompt = options.prompt;
    }
    if (!options.clientId) {
      console.warn('clientId is required');
    }
  } else {
    console.warn('invalid option type. Object type accepted only');
  }
  await googleAuth.load(GoogleAuthConfig, prompt);
  return googleAuth;
};
