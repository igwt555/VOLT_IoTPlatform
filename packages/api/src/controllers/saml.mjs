import jwt from 'jsonwebtoken';
import libxmljs from 'libxmljs2';
import pako from 'pako';
import Organization from '../models/organization.mjs';
import SamlProvider from '../models/saml_provider.mjs';
import User from '../models/user.mjs';
import Role from '../models/role.mjs';

const { JWT_SECRET_KEY } = process.env;
const generateSAMLRequest = config => {
  const SAMLReq =
        `<samlp:AuthnRequest
      xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
      ID="${config.domain}"
      Version="2.0"
      IssueInstant="${new Date().toISOString()}"
      IsPassive="false"
      AssertionConsumerServiceURL="${config.entityReplyUrl}" 
      xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
      ForceAuthn="false">
        <Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion">${config.entityURI}</Issuer>
        <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"></samlp:NameIDPolicy>
    </samlp:AuthnRequest>`;

  const deflatedSAMLReq = pako.deflateRaw(SAMLReq);
  const deflatedBase64SAMLReq = Buffer.from(deflatedSAMLReq).toString('base64');
  const encodedDeflatedBase64SAMLReq = encodeURIComponent(deflatedBase64SAMLReq);

  return config.entryPoint?.includes('?')
    ? `${config.entryPoint}&SAMLRequest=${encodedDeflatedBase64SAMLReq}`
    : `${config.entryPoint}?SAMLRequest=${encodedDeflatedBase64SAMLReq}`;
};

const toBase64 = val => {
  const res = Buffer.from(val).toString('base64');
  return encodeURIComponent(res);
};

export const consume = async (req, res) => {
  // Get SAML response
  const appURL = process.env.NODE_ENV === 'production' ? `https://${req.host}` : `${process.env.VITE_FRONTEND_URL}`;
  const samlResponse = req?.body?.SAMLResponse;

  // Decode response
  const xml = Buffer.from(samlResponse, 'base64').toString('ascii');

  // Parse IDvar xmlDoc = libxmljs.parseXml(xml);
  const xmlDoc = libxmljs.parseXmlString(xml);
  const idNode = xmlDoc.get('/samlp:Response/saml:Assertion/saml:Subject/saml:NameID', {
    samlp: 'urn:oasis:names:tc:SAML:2.0:protocol',
    saml: 'urn:oasis:names:tc:SAML:2.0:assertion',
  });

  const X509CertificateNode = xmlDoc.get('/samlp:Response/saml:Assertion/xmlns:Signature/xmlns:KeyInfo/xmlns:X509Data/xmlns:X509Certificate', {
    samlp: 'urn:oasis:names:tc:SAML:2.0:protocol',
    saml: 'urn:oasis:names:tc:SAML:2.0:assertion',
    xmlns: 'http://www.w3.org/2000/09/xmldsig#',
  });

  const email = idNode.text();
  const certificate = X509CertificateNode.text();

  const samlFound = await SamlProvider.findOne({ where: { cert: certificate.replaceAll('\n', '') } });
  if (samlFound) {
    const userFound = await User.findOne({
      where: { email, organization_id: samlFound.organization_id },
      include: [{ model: Organization }, { model: Role }],
      plain: true,
    });
    if (userFound) {
      if (!userFound.is_active) {
        res.redirect(`${appURL}/login/${toBase64('Suspended User')}`);
      }

      const token = jwt.sign({ email: userFound.email }, JWT_SECRET_KEY);
      res.redirect(`${appURL}/redirect-sso/${encodeURIComponent(token.replaceAll('.', '$'))}`);
    } else {
      res.redirect(`${appURL}/login/${toBase64('Email does not exists')}`);
    }
  } else {
    res.redirect(`${appURL}/login/${toBase64('Your account is not configured to use single sign-on. Please contact your administrator.')}`);
  }
};

export const getSamlProvider = async (req, res) => {
  const { id } = req.params;
  const samlData = await SamlProvider.findByPk(id);
  return res.json({ SAMLProvider: samlData, success: true });
};

export const getSamlProviders = async (req, res) => {
  const samlData = await SamlProvider.findAll({ where: { organization_id: req?.user?.organization_id } });

  if (samlData.filter(x => x.type === 'microsoft').length === 0) {
    samlData.push({
      id: null,
      organization_id: req?.user?.organization_id,
      name: 'Microsoft Azure Active Directory',
      type: 'microsoft',
      logo_filename: '/images/Microsoft_Azure-Logo.png',
      entry_point: null,
      cert: null,
    });
  }

  if (samlData.filter(x => x.type === 'google').length === 0) {
    samlData.push({
      id: null,
      organization_id: req?.user?.organization_id,
      name: 'Google Workspace',
      type: 'google',
      logo_filename: '/images/Google-Logo.png',
      entry_point: null,
      cert: null,
    });
  }

  if (samlData.filter(x => x.type === 'okta').length === 0) {
    samlData.push({
      id: null,
      organization_id: req?.user?.organization_id,
      name: 'Okta',
      type: 'okta',
      logo_filename: '/images/Okta-Logo.png',
      entry_point: null,
      cert: null,
    });
  }

  if (samlData.filter(x => x.type === 'saml').length === 0) {
    samlData.push({
      id: null,
      organization_id: req?.user?.organization_id,
      name: 'Custom SAML Connector',
      type: 'saml',
      logo_filename: '/images/saml-logo.png',
      entry_point: null,
      cert: null,
    });
  }

  return res.json({ SAMLProvider: samlData, success: true });
};

export const updateSamlProvider = async (req, res) => {
  // check saml cert.
  if (req?.params?.id === 'null') {
    const create = await SamlProvider.create({
      organization_id: req?.user?.organization_id,
      name: req?.body?.name,
      type: req?.body?.type,
      logo_filename: req?.body?.logo_filename,
      entry_point: req?.body?.entry_point,
      cert: req?.body?.cert,
    });
    return res.json({ SAMLProvider: create, success: true });
  }
  const updated = await SamlProvider.update(req?.body, {
    where: req?.params,
    returning: true,
    plain: true,
  });

  return res.json({ SAMLProvider: updated, success: true });
};

export const deleteSamlProvider = async (req, res) => {
  const { id } = req.params;
  const deleted = await SamlProvider.destroy({
    where: { id },
    returning: true,
    plain: true,
  });
  return res.json({ SAMLProvider: deleted, success: true });
};

export const samlLogin = async (req, res) => {
  const userFound = await User.findOne({
    where: { email: req.body.email },
    include: [{ model: Organization }, { model: Role }],
    plain: true,
  });
  if (userFound) {
    if (req.body.provider === 'none') {
      const providers = await SamlProvider.findAll({ where: { organization_id: userFound.organization_id } });
      return res.json({ message: '', redirect: false, providers, success: false });
    }

    const samlFound = await SamlProvider.findOne({
      where: { organization_id: userFound.organization_id, type: req.body.provider },
      include: [{ model: Organization }],
      plain: true,
    });

    if (samlFound) {
      if (samlFound.cert == null || samlFound.cert === '' || samlFound.entry_point == null || samlFound.entry_point === '') {
        return res.json({ message: 'Your account is not configured to use single sign-on. Please contact your administrator.', redirect: false, providers: [], success: false });
      }

      const config = {
        // domain of email address for identifying on client side if SAML is enable for same or not
        domain: `Orgid-${samlFound.organization_id}`,
        // unique entityId while setting up SAML server
        entityURI: `${req?.body?.apiURL.replace('api/', '')}${samlFound.organization_id}`,
        // `${req.body.APIURL.replace("api", "")}`
        // SAML server login url, can be found in SAML XML file
        entryPoint: samlFound.entry_point,
        // X 509 signing certificate, can be found in SAML XML file
        certificate: samlFound.cert,
        // callback url after successfully authentication
        entityReplyUrl: `${req?.body?.apiURL}saml/consume`,
      };
      const samlURL = generateSAMLRequest(config);
      return res.json({ SAMLURL: `${samlURL}&login_hint=${req?.body?.email}`, redirect: true, success: true });
    }
    return res.json({ message: 'Your account is not configured to use single sign-on. Please contact your administrator.', redirect: false, providers: [], success: false });
  }
  return res.json({ message: '', redirect: false, providers: [], success: false });
};
