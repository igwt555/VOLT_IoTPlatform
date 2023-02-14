import msal from '@azure/msal-node';

const config = {
  auth: {
    clientId: '3545189c-e7ed-4b78-80a3-de417248a4ab',
    authority: 'https://login.microsoftonline.com/d1510999-2ba8-4f4c-9cf5-d57c245501af',
    clientSecret: 'qpR8Q~ekqR.emfHvNTL8pjYQQXzdVjMF2ylikauA', // Only for Confidential Client Applications
    knownAuthorities: ['https://login.microsoftonline.com/d1510999-2ba8-4f4c-9cf5-d57c245501af'],
    redirectUri: 'http://localhost:5000/api/redirect', // defaults to application start page
    postLogoutRedirectUri: 'https://8d75-116-72-18-108.ngrok.io/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback(_loglevel, message, _containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    },
  },
  windowHashTimeout: 60000,
  iframeHashTimeout: 6000,
  loadFrameTimeout: 0,
  asyncPopups: false,
};
const pca = new msal.ConfidentialClientApplication(config);
// const pca = new msal.PublicClientApplication(config);
const REDIRECT_URI = 'http://localhost:5000/api/redirect';

export const mainRoute = async (req, res) => {
  const authCodeUrlParameters = {
    scopes: ['user.read'],
    redirectUri: REDIRECT_URI,
  };
  // get url to sign user in and consent to scopes needed for application
  pca.getAuthCodeUrl(authCodeUrlParameters).then(response => {
    res.redirect(response);
  }).catch(error => {
    console.log('error call api', JSON.stringify(error));
  });
};

export const redirectRoute = async (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ['user.read'],
    redirectUri: REDIRECT_URI,
  };

  pca.acquireTokenByCode(tokenRequest).then(response => {
    console.log('redirect success Response: \n: -->', response);
    res.sendStatus(200);
  }).catch(error => {
    console.log('redirect error -->', error);
    res.status(500).send(error);
  });
};

export const logoutRoute = async (req, res) => {
  pca.getTokenCache().getAllAccounts().then(response => {
    // console.log('getTokenCache -->', response);
    const account = response[0];
    pca.getTokenCache().removeAccount(account).then(() => {
      // console.log('response ----->', resp);
      res.sendStatus(200);
    }).catch(error => {
      console.log('remove account -->', error);
      res.status(500).send({ error });
    });
  }).catch(error => {
    console.log('get user error -->', error);
    res.status(500).send(error);
  });
};
