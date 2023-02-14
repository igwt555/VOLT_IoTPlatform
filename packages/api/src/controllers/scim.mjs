import dot from 'dot-object';
import * as UserService from '../services/user.mjs';
import Organization from '../models/organization.mjs';
import Role from '../models/role.mjs';
import ScimDef from '../helpers/scimdef-v2.js';
import User from '../models/user.mjs';
import Timezone from '../models/timezone.mjs';

const isScimv2 = true;

const getMultivalueTypes = (objName, scimDef) => { // objName = 'User' or 'Group'
  if (!objName) return [];

  const obj = scimDef.Schemas.Resources.find(el => (el.name === objName));
  if (!obj) return [];

  return obj.attributes
    .filter(el => (el.multiValued === true && el.subAttributes &&
        el.subAttributes
          .find(subel => (subel.name === 'type'))
    ))
    .map(o => o.name);
};

const multiValueTypes = getMultivalueTypes('User', ScimDef); // not icluding 'Group' => 'members' are excluded
for (let i = 0; i < multiValueTypes.length; i += 1) {
  if (multiValueTypes[i] === 'groups' || multiValueTypes[i] === 'roles' || multiValueTypes[i] === 'members') {
    multiValueTypes.splice(i, 1); // delete
    i -= 1;
  }
}

const userHandlers = {
  description: 'User',
  getMethod: 'getUsers',
  modifyMethod: 'modifyUser',
  createMethod: 'createUser',
  deleteMethod: 'deleteUser',
};

const groupHandlers = {
  description: 'Group',
  getMethod: 'getGroups',
  modifyMethod: 'modifyGroup',
  createMethod: 'createGroup',
  deleteMethod: 'deleteGroup',
};

const servicePlanHandlers = { // plugin-azure using "CustomSCIM"
  description: 'ServicePlan',
  getMethod: 'getServicePlans',
  modifyMethod: 'modifyServicePlan',
  createMethod: 'createServicePlan',
  deleteMethod: 'deleteServicePlan',
};

const handler = {
  Users: userHandlers,
  users: userHandlers,
  Groups: groupHandlers,
  groups: groupHandlers,
  servicePlans: servicePlanHandlers,
  serviceplans: servicePlanHandlers,
};

export const getUsers = async (ctx, res) => {
  const org = await Organization.findAll({ where: { id: ctx?.user?.organization_id } });
  const bearerTokenInDB = org[0]?.azure_ad_secret;
  
  if (bearerTokenInDB && bearerTokenInDB === ctx.headers.authorization.split(' ')[1]) {
    if (ctx.query.attributes) ctx.query.attributes = ctx.query.attributes.split(',').map(item => item.trim()).join();
    if (ctx.query.excludedAttributes) ctx.query.excludedAttributes = ctx.query.excludedAttributes.split(',').map(item => item.trim()).join();
    let u = ctx.originalUrl.substr(ctx.originalUrl.lastIndexOf('/') + 1); // u = Users, Groups, servicePlans, ...
    const ui = u.indexOf('?');
    if (ui > 0) u = u.substr(0, ui);
    const handle = handler[u];

    const getObj = {
      attribute: undefined,
      operator: undefined,
      value: undefined,
      rawFilter: ctx.query.filter, // included for advanced filtering
      startIndex: undefined,
      count: undefined,
    };

    if (ctx.query.filter) {
      ctx.query.filter = ctx.query.filter.trim();
      const arrFilter = ctx.query.filter.split(' ');
      if (arrFilter.length === 3 || (arrFilter.length > 2 && arrFilter[2].startsWith('"') && arrFilter[arrFilter.length - 1].endsWith('"'))) {
        getObj.attribute = arrFilter[0]; // userName
        getObj.operator = arrFilter[1].toLowerCase(); // eq
        getObj.value = decodeURIComponent(arrFilter.slice(2).join(' ').replace(/"/g, '')); // bjensen
      }
    }
    
    let err;
    if (getObj.attribute) {
      if (getObj.attribute.includes('[')) { // e.g. rawFilter = emails[type eq "work"]
        const rePattern = /^(.*)\[(.*) (.*) (.*)\]$/;
        const arrMatches = ctx.query.filter.match(rePattern);
        if (Array.isArray(arrMatches) && arrMatches.length === 5) {
          getObj.attribute = `${arrMatches[1]}.${arrMatches[2]}`; // emails.type
          getObj.operator = arrMatches[3];
          getObj.value = arrMatches[4].replace(/"/g, '');
        } else {
          getObj.attribute = undefined;
          getObj.operator = undefined;
          getObj.value = undefined;
        }
      }

      if (getObj.attribute === 'password') {
        err = new Error(`Not accepting password filtering: ${getObj.rawFilter}`);
        err.name = 'invalidFilter';
      }
    } else if (getObj.rawFilter && ![' and ', ' or ', ' not '].some(el => getObj.rawFilter.includes(el))) { // advanced filtering
      // err = new Error(`Invalid filter: ${getObj.rawFilter}`)
      // err.name = 'invalidFilter'
    }

    let info = '';
    if (getObj.operator === 'eq' && ['id', 'userName', 'externalId', 'displayName', 'members.value'].includes(getObj.attribute)) info = ` ${getObj.attribute}=${getObj.value}`;

    try {
      getObj.startIndex = ctx.query.startIndex ? parseInt(ctx.query.startIndex, 10) : undefined;
      getObj.count = ctx.query.count ? parseInt(ctx.query.count, 10) : undefined;
      if (getObj.startIndex && !getObj.count) getObj.count = 200; // defaults to 200 (plugin may override)
      if (getObj.count && !getObj.startIndex) getObj.startIndex = 1;

      if (getObj.value === undefined) {
        if (ctx.params.id !== undefined) {
          getObj.value = ctx.params.id;
        }
      }
      
      /// HEre Get Data From Db
      let Users = [];
      if (getObj.value === undefined) {
        Users = await User.findAll({
          where: { organization_id: ctx?.user?.organization_id },
          include: [{ model: Role }],
        });
      } else if (checkIfValidUUID(getObj.value)) {
        Users = await User.findOne({
          where: { id: getObj.value, organization_id: ctx?.user?.organization_id },
          include: [{ model: Role }, { model: Timezone }],
          plain: true,
        });
      } else {
        Users = await User.findOne({
          where: { email:getObj.value },
          plain: true,
        });
      }

      if (Users == null) {
        Users = [];
      }

      const ret = { // itemsPerPage will be set by scimgateway
        Resources: [],
        totalResults: null,
      };

      try {
        if (Array.isArray(Users) == false) {
          const retObj = { // scimgateway strips attributes according to attributes list and will also auto include groups if needed
            id: Users.id ? Users.id : undefined, // id and userName is mandatory and most often set to the same value
            userName: Users.email ? Users.email : undefined,
            active: Users.is_active ? Users.is_active : false,
            name: {
              givenName: Users.full_name ? Users.full_name : undefined,
              familyName: Users.full_name ? Users.full_name : undefined,
              formatted: Users.full_name ? Users.full_name : undefined,
            },
            emails: {
              work: Users.email ? Users.email : undefined,
            },
          };

          ret.Resources.push(retObj);
        } else {
          for (let i = 0; i < Users.length; ++i) {
            const userObj = Users[i];
            if (!userObj || Object.keys(userObj).length < 1) continue;

            const retObj = { // scimgateway strips attributes according to attributes list and will also auto include groups if needed
              id: userObj.id ? userObj.id : undefined, // id and userName is mandatory and most often set to the same value
              userName: userObj.email ? userObj.email : undefined,
              active: userObj.is_active ? userObj.is_active : false,
              name: {
                givenName: userObj.full_name ? userObj.full_name : undefined,
                familyName: userObj.full_name ? userObj.full_name : undefined,
                formatted: userObj.full_name ? userObj.full_name : undefined,
              },
              emails: {
                work: userObj.email ? userObj.email : undefined,
              },
            };

            ret.Resources.push(retObj);
          }
        }

        ret.totalResults = (Array.isArray(Users) == false ? 1 : Users.length); // not needed if client or endpoint do not support paging
        // return ret
      } catch (err) {
        throw new Error(`${action} error: ${err.message}`);
      }

      /// Get Data From DB.

      let scimdata = {
        Resources: [],
        totalResults: null,
      };
      if (ret) {
        if (ret.Resources && Array.isArray(ret.Resources)) {
          scimdata.Resources = ret.Resources;
          scimdata.totalResults = ret.totalResults;
        } else if (Array.isArray(ret)) scimdata.Resources = ret;
        else if (typeof (ret) === 'object' && Object.keys(ret).length > 0) scimdata.Resources[0] = ret;
      }

      let location = '';
      if (ctx.params.id == undefined) {
        location = ctx.path;
      } else {
        location = ctx.path.replace(`/${ctx.params.id}`, '');
      }

      if (ctx.query.attributes || (ctx.query.excludedAttributes && ctx.query.excludedAttributes.includes('meta'))) location = null;

      scimdata.Resources = stripObj(scimdata.Resources, ctx.query.attributes, ctx.query.excludedAttributes);
      scimdata = addResources(scimdata, ctx.query.startIndex, ctx.query.sortBy, ctx.query.sortOrder);
      scimdata = addSchemas(scimdata, 'User', isScimv2, location);

      ctx.status = 200;
      ctx.body = scimdata;
      // return scimdata
      return res.json(scimdata);
    } catch (err) {
      throw { status: 500, message: err };
    }
  } else {
    throw { status: 401, message: 'Unauthorized' };
  }
};

export const getUser = async (ctx, res) => {
  const org = await Organization.findAll({ where: { id: ctx?.user?.organization_id } }); 
  const bearerTokenInDB = org[0]?.azure_ad_secret;

  if (bearerTokenInDB && bearerTokenInDB == ctx.headers.authorization.split(' ')[1]) {
    if (ctx.query.attributes) ctx.query.attributes = ctx.query.attributes.split(',').map(item => item.trim()).join();
    if (ctx.query.excludedAttributes) ctx.query.excludedAttributes = ctx.query.excludedAttributes.split(',').map(item => item.trim()).join();
    let u = ctx.originalUrl.substr(0, ctx.originalUrl.lastIndexOf('/'));
    u = u.substr(u.lastIndexOf('/') + 1); // u = Users, Groups
    const handle = handler[u];
    const id = decodeURIComponent(ctx.params.id);
    
    try {
      let Users;
      if (checkIfValidUUID(id)) {
        Users = await User.findOne({
          where: { id: id, organization_id: ctx?.user?.organization_id },
          include: [{ model: Role }, { model: Timezone }],
          plain: true,
        });
      } else {
        Users = await User.findOne({
          where: { email:id },
          plain: true,
        });
      }

      const ret = { // itemsPerPage will be set by scimgateway
        Resources: [],
      };
      if (Users == null) {
        Users = [];
      } else {
        try {
          const retObj = { // scimgateway strips attributes according to attributes list and will also auto include groups if needed
            id: Users.id ? Users.id : undefined, // id and userName is mandatory and most often set to the same value
            userName: Users.email ? Users.email : undefined,
            active: Users.is_active ? Users.is_active : false,
            name: {
              givenName: Users.full_name ? Users.full_name : undefined,
              familyName: Users.full_name ? Users.full_name : undefined,
              formatted: Users.full_name ? Users.full_name : undefined,
            },
            emails: {
              work: Users.email ? Users.email : undefined,
            },
          };

          ret.Resources.push(retObj);
          // return ret
        } catch (err) {
          throw new Error(`${action} error: ${err.message}`);
        }
      }

      let scimdata = {
        Resources: [],
      };
      if (ret) {
        if (ret.Resources && Array.isArray(ret.Resources)) {
          scimdata.Resources = ret.Resources;
        } else if (Array.isArray(ret)) scimdata.Resources = ret;
        else if (typeof (ret) === 'object' && Object.keys(ret).length > 0) scimdata.Resources[0] = ret;
      }

      if (scimdata.Resources.length !== 1) {
        ctx.status = 404;
        return res.json({

          id,
          userName: '',
          schemas: [
            'urn:ietf:params:scim:messages:2.0:NotFound',
          ],
          message: `${id} not found` });
      }

      // check for user attribute groups and include if needed
      const userObj = scimdata.Resources[0];

      const location = ctx.path;
      scimdata = stripObj(userObj, ctx.query.attributes, ctx.query.excludedAttributes);
      scimdata = addSchemas(scimdata, handle.description, isScimv2);
      if (scimdata.meta) scimdata.meta.location = location;
      else {
        scimdata.meta = {};
        scimdata.meta.location = location;
      }

      return res.json(scimdata);
    } catch (err) {
      throw { status: 500, message: err };
    }
  } else {
    throw { status: 401, message: 'Unauthorized' };
  }
};

export const createUser = async (req, res) => {
  const org = await Organization.findAll({ where: { id: req?.user?.organization_id } });

  const bearerTokenInDB = org[0]?.azure_ad_secret;

  if (bearerTokenInDB && bearerTokenInDB == req.headers.authorization.split(' ')[1]) {
    let u = req.originalUrl.substr(req.originalUrl.lastIndexOf('/') + 1); // u = Users<.json|.xml>, Groups<.json|.xml>
    u = u.split('?')[0]; // Users?AzureAdScimPatch062020
    const handle = handler[u.split('.')[0]];

    let jsonBody = isJsonString(req.body) ? JSON.parse(req.body) : req.body;

    const strBody = isJsonString(req.body) ? req.body : JSON.stringify(req.body);
    if (strBody === '{}') {
      throw { status: 500, message: 'Not accepting empty or none JSON formatted POST requests' };
    } else if (handle.createMethod === 'createUser' && !jsonBody.userName && !jsonBody.externalId) {
      throw { status: 500, message: 'userName or externalId is mandatory' };
    }

    jsonBody = JSON.parse(strBody); // using a copy
    delete jsonBody.id; // in case included in request

    try {
      const data = {
        is_active: jsonBody.isactive || true,
        password: jsonBody.password || null,
        full_name: jsonBody.name.formatted || null,
        email: (jsonBody.emails.work == undefined ? jsonBody.emails[0].value : jsonBody.emails.work.value),
        organization_id: req?.user?.organization_id || null,
        role_id: Role.genralRoles.basicAccess.id,
      };
      const result = await UserService.create(data);
      for (const key in result) { // merge any result e.g: {'id': 'xxxx'}
        jsonBody[key] = result[key];
      }

      delete jsonBody._previousDataValues;
      delete jsonBody.uniqno;
      delete jsonBody._changed;
      delete jsonBody._options;
      delete jsonBody.isNewRecord;
      delete jsonBody._customGetters;
      delete jsonBody._customSetters;
      delete jsonBody.validators;
      delete jsonBody._hasCustomGetters;
      delete jsonBody._hasCustomSetters;
      delete jsonBody.rawAttributes;
      delete jsonBody.dataValues;
      delete jsonBody.password;

      jsonBody.id = result.id;

      const location = `${req.origin}${req.path}/${result.id}`;
      if (!jsonBody.meta) jsonBody.meta = {};
      jsonBody.meta.location = location;

      req.status = 201;
      req.body = jsonBody;

      return res.json(jsonBody);
    } catch (err) {
      throw { status: 500, message: err };
    }
  } else {
    throw { status: 401, message: 'Unauthorized' };
  }
};

export const modifyUser = async (ctx, res) => {
  const org = await Organization.findAll({ where: { id: ctx?.user?.organization_id } });

  const bearerTokenInDB = org[0].azure_ad_secret;

  if (bearerTokenInDB && bearerTokenInDB == ctx.headers.authorization.split(' ')[1]) {
    if (ctx.query.attributes) ctx.query.attributes = ctx.query.attributes.split(',').map(item => item.trim()).join();
    if (ctx.query.excludedAttributes) ctx.query.excludedAttributes = ctx.query.excludedAttributes.split(',').map(item => item.trim()).join();
    let u = ctx.originalUrl.substr(0, ctx.originalUrl.lastIndexOf('/'));
    u = u.substr(u.lastIndexOf('/') + 1); // u = Users, Groups
    const handle = handler[u];
    let id = decodeURIComponent(ctx.params.id);

    const jsonBody = isJsonString(ctx.body) ? JSON.parse(ctx.body) : ctx.body;
    const strBody = isJsonString(ctx.body) ? ctx.body : JSON.stringify(ctx.body);

    if (strBody === '{}') {
      throw { status: 500, message: 'Not accepting empty or none JSON formatted PATCH request' };
    } else {
      let scimdata; let
        err;
      if (jsonBody.Operations) [scimdata, err] = convertedScim20(jsonBody); // v2.0
      else [scimdata, err] = convertedScim(jsonBody); // v1.1

      if (err) {
        throw { status: 500, message: err };
      }

      try {
        let userEmail = scimdata.emails.work == undefined ? scimdata.emails[0].value : scimdata.emails.work.value
        const user = await User.findOne({
          where: { email:scimdata.userName || userEmail},
          plain: true,
        });

        if(user === null){ 
            const data = {
              is_active: scimdata.active || false,
              password: null,
              full_name: scimdata.name.formatted || null,
              email: userEmail,
              organization_id: ctx?.user?.organization_id || null,
              role_id: Role.genralRoles.basicAccess.id,
            };
            const result = await UserService.create(data);
            id = result.id;
        } else { 
          if(user) id= user.id; 
          const body = {}; // { userName: id }
          if (scimdata.active === true) body.is_active = true;
          else if (scimdata.active === false) body.is_active = false;

          if (scimdata.password) body.password = scimdata.password;

          if (scimdata.name != undefined) {
            if (scimdata.name.formatted || scimdata.name.formatted === '') {
              body.full_name = scimdata.name.formatted;
            }
          }
          body.email = scimdata.emails.work.value;

          await User.update(body, {
            where: { id },
            include: [{ model: Role }],
            returning: true,
            plain: true,
          });
        }
        if (ctx.query.attributes || ctx.query.excludedAttributes) {
          const Users = await User.findOne({
            where: { id: id, organization_id: ctx?.user?.organization_id },
            include: [{ model: Role }, { model: Timezone }],
            plain: true,
          });

          const ret = {
            Resources: [],
            totalResults: null,
          };

          try {
            const retObj = { // scimgateway strips attributes according to attributes list and will also auto include groups if needed
              id: Users.id ? Users.id : undefined, // id and userName is mandatory and most often set to the same value
              userName: Users.email ? Users.email : undefined,
              active: Users.is_active ? Users.is_active : false,
              name: {
                givenName: Users.full_name ? Users.full_name : undefined,
                familyName: Users.full_name ? Users.full_name : undefined,
                formatted: Users.full_name ? Users.full_name : undefined,
              },
              emails: {
                work: Users.email ? Users.email : undefined,
              },
            };

            scimdata.Resources.push(retObj);

            scimdata.totalResults = (Array.isArray(Users) == false ? 1 : Users.length); // not needed if client or endpoint do not support paging
            // return ret
          } catch (err) {
            throw new Error(`${action} error: ${err.message}`);
          }

          let scimdata = {
            Resources: [],
            totalResults: null,
          };
          if (ret) {
            if (ret.Resources && Array.isArray(ret.Resources)) {
              scimdata.Resources = ret.Resources;
              scimdata.totalResults = ret.totalResults;
            } else if (Array.isArray(ret)) scimdata.Resources = ret;
            else if (typeof (ret) === 'object' && Object.keys(ret).length > 0) scimdata.Resources[0] = ret;
          }

          if (scimdata.Resources.length !== 1) throw new Error(`using ${handle.getMethod} to retrive user ${id} after ${handle.modifyMethod} but response did not include user object`);
          scimdata = stripObj(scimdata.Resources[0], ctx.query.attributes, ctx.query.excludedAttributes);
          scimdata = addSchemas(scimdata, 'User', isScimv2);
          ctx.status = 200;
          ctx.body = scimdata;
          return res.json(jsonBody);
        }

        ctx.status = 204;
        return res.json({ status: 204, message: 'User was successfully provisioned' });
      } catch (err) {
        throw { status: 500, message: err };
      }
    }
  } else {
    throw { status: 401, message: 'Unauthorized' };
  }
};

const checkIfValidUUID = str => {
  // Regular expression to check if string is a valid UUID
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(str);
};

const isJsonString = str => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const convertedScim = obj => {
  let err = null;
  const scimdata = copyObj(obj);
  if (scimdata.schemas) delete scimdata.schemas;
  const newMulti = {};
  for (const key in scimdata) {
    if (Array.isArray(scimdata[key]) && (scimdata[key].length > 0)) {
      if (key === 'groups' || key === 'members' || key === 'roles') {
        scimdata[key].forEach((element, index) => {
          if (element.value) {
            scimdata[key][index].value = decodeURIComponent(element.value);
          }
        });
      } else if (multiValueTypes.includes(key)) { // "type converted object" // groups, roles, member and scim.excludeTypeConvert are not included
        const tmpAddr = [];
        scimdata[key].forEach((element, index) => {
          if (!element.type) element.type = 'undefined'; // "none-type"
          if (element.operation && element.operation === 'delete') { // add as delete if same type not included as none delete
            const arr = scimdata[key].filter(obj => obj.type && obj.type === element.type && !obj.operation);
            if (arr.length < 1) {
              if (!newMulti[key]) newMulti[key] = {};
              if (newMulti[key][element.type]) {
                if (['addresses'].includes(key)) { // not checking type, but the others have to be unique
                  for (const i in element) {
                    if (i !== 'type') {
                      if (tmpAddr.includes(i)) {
                        err = new Error(`'type converted object' ${key} - includes more than one element having same ${i}, or ${i} is blank on more than one element - note, setting configuration scim.skipTypeConvert=true will disable this logic/check`);
                      }
                      tmpAddr.push(i);
                    }
                  }
                } else {
                  err = new Error(`'type converted object' ${key} - includes more than one element having same type, or type is blank on more than one element - note, setting configuration scim.skipTypeConvert=true will disable this logic/check`);
                }
              }
              newMulti[key][element.type] = {};
              for (const i in element) {
                newMulti[key][element.type][i] = element[i];
              }
              newMulti[key][element.type].value = ''; // delete
            }
          } else {
            if (!newMulti[key]) newMulti[key] = {};
            if (newMulti[key][element.type]) {
              if (['addresses'].includes(key)) { // not checking type, but the others have to be unique
                for (const i in element) {
                  if (i !== 'type') {
                    if (tmpAddr.includes(i)) {
                      err = new Error(`'type converted object' ${key} - includes more than one element having same ${i}, or ${i} is blank on more than one element - note, setting configuration scim.skipTypeConvert=true will disable this logic/check`);
                    }
                    tmpAddr.push(i);
                  }
                }
              } else {
                err = new Error(`'type converted object' ${key} - includes more than one element having same type, or type is blank on more than one element - note, setting configuration scim.skipTypeConvert=true will disable this logic/check`);
              }
            }
            newMulti[key][element.type] = {};
            for (const i in element) {
              newMulti[key][element.type][i] = element[i];
            }
          }
        });
        delete scimdata[key];
      }
    }
  }
  if (scimdata.active && typeof scimdata.active === 'string') {
    const lcase = scimdata.active.toLowerCase();
    if (lcase === 'true') scimdata.active = true;
    else if (lcase === 'false') scimdata.active = false;
  }
  if (scimdata.meta) { // cleared attributes e.g { meta: { attributes: [ 'name.givenName', 'title' ] } }
    if (Array.isArray(scimdata.meta.attributes)) {
      scimdata.meta.attributes.forEach(el => {
        let rootKey;
        let subKey;
        if (el.startsWith('urn:')) { // can't use dot.str on key having dot e.g. urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:department
          const i = el.lastIndexOf(':');
          subKey = el.substring(i + 1);
          if (subKey === 'User' || subKey === 'Group') rootKey = el;
          else rootKey = el.substring(0, i);
        }
        if (rootKey) {
          if (!scimdata[rootKey]) scimdata[rootKey] = {};
          dot.str(subKey, '', scimdata[rootKey]);
        } else {
          dot.str(el, '', scimdata);
        }
      });
    }
    delete scimdata.meta;
  }
  for (const key in newMulti) {
    dot.copy(key, key, newMulti, scimdata);
  }
  return [scimdata, err];
};

const convertedScim20 = obj => {
  let scimdata = {};
  if (!obj.Operations || !Array.isArray(obj.Operations)) return scimdata;
  const o = copyObj(obj);

  for (let i = 0; i < o.Operations.length; i += 1) {
    const element = o.Operations[i];
    let type = null;
    let typeElement = null;
    let path = null;
    let pathRoot = null;
    let rePattern = /^.*(\[type eq .*\]).*$/;
    let arrMatches = null;

    if (element.op) element.op = element.op.toLowerCase();

    if (element.path) {
      arrMatches = element.path.match(rePattern);
      if (Array.isArray(arrMatches) && arrMatches.length === 2) { // [type eq "work"]
        rePattern = /^\[type eq (.*)\]$/;
        arrMatches = arrMatches[1].match(rePattern);
        if (Array.isArray(arrMatches) && arrMatches.length === 2) { // "work"
          type = arrMatches[1].replace(/"/g, ''); // work
        }
      }

      rePattern = /^(.*)\[type eq .*\]\.(.*)$/; // "path":"addresses[type eq \"work\"].streetAddress"
      arrMatches = element.path.match(rePattern);
      if (Array.isArray(arrMatches)) {
        if (arrMatches.length === 2) {
          if (type) path = `${arrMatches[1]}.${type}`;
          else path = arrMatches[1];
          pathRoot = arrMatches[1];
        } else if (arrMatches.length === 3) {
          if (type) {
            path = `${arrMatches[1]}.${type}.${arrMatches[2]}`;
            typeElement = arrMatches[2]; // streetAddress
          } else path = `${arrMatches[1]}.${arrMatches[2]}`; // NA
          pathRoot = arrMatches[1];
        }
      } else {
        rePattern = /^(.*)\[type eq .*\]$/; // "path":"addresses[type eq \"work\"]"
        arrMatches = element.path.match(rePattern);
        if (Array.isArray(arrMatches) && arrMatches.length === 2) {
          if (type) path = `${arrMatches[1]}.${type}`;
          else path = arrMatches[1];
          pathRoot = arrMatches[1];
        }
      }

      rePattern = /^(.*)\[value eq (.*)\]$/; // "path":"members[value eq \"bjensen\"]"
      arrMatches = element.path.match(rePattern);
      if (Array.isArray(arrMatches) && arrMatches.length === 3) {
        // eslint-disable-next-line no-unused-vars
        path = arrMatches[1];
        pathRoot = arrMatches[1];
        const val = arrMatches[2].replace(/"/g, ''); // "bjensen" => bjensen
        element.value = val;
        typeElement = 'value';
      }

      if (element.value && Array.isArray(element.value)) {
        element.value.forEach((el, i) => { // {"value": [{ "value": "jsmith" }]}
          if (el.value) {
            if (typeof el.value === 'object') { // "value": [{"value": {"id":"c20e145e-5459-4a6c-a074-b942bbd4cfe1","value":"admin","displayName":"Administrator"}}]
              element.value[i] = el.value;
            } else if (typeof el.value === 'string' && el.value.substring(0, 1) === '{') { // "value": [{"value":"{\"id\":\"c20e145e-5459-4a6c-a074-b942bbd4cfe1\",\"value\":\"admin\",\"displayName\":\"Administrator\"}"}}]
              try {
                element.value[i] = JSON.parse(el.value);
              } catch (err) { }
            }
          }
        });
      }

      if (element.value && element.value.value && typeof element.value.value === 'string') { // "value": { "value": "new_email@testing.org" }
        const el = {};
        el.value = element.value.value;
        if (element.op && element.op === 'remove') el.operation = 'delete';
        element.value = [];
        element.value.push(el);
      }

      if (pathRoot) { // pathRoot = emails and path = emails.work.value (we may also have path = pathRoot)
        if (!scimdata[pathRoot]) scimdata[pathRoot] = [];
        const index = scimdata[pathRoot].findIndex(el => el.type === type);
        if (index < 0) {
          if (typeof element.value === 'object') { // e.g. addresses with no typeElement - value includes object having all attributes
            if (element.op && element.op === 'remove') element.value.operation = 'delete';
            scimdata[pathRoot].push(element.value);
          } else {
            const el = {};
            if (element.op && element.op === 'remove') el.operation = 'delete';
            if (type) el.type = type; // members no type
            if (element.value) el[typeElement] = element.value; // {"value": "some-value"} or {"steetAddress": "some-address"}
            scimdata[pathRoot].push(el);
          }
        } else if (typeElement === 'value' && scimdata[pathRoot][index].value) { // type exist for value index => duplicate type => push new - duplicates handled by last step confertedScim() if needed
          const el = {};
          if (element.op && element.op === 'remove') el.operation = 'delete';
          if (type) el.type = type;
          el[typeElement] = element.value;
          scimdata[pathRoot].push(el);
        } else {
          scimdata[pathRoot][index][typeElement] = element.value;
          if (element.op && element.op === 'remove') scimdata[pathRoot][index].operation = 'delete';
        }
      } else { // use element.path e.g name.familyName and members
        if (Array.isArray(element.value)) {
          for (let i = 0; i < element.value.length; i += 1) {
            if (!scimdata[element.path]) scimdata[element.path] = [];
            if (element.op && element.op === 'remove') {
              if (typeof element.value[i] === 'object') element.value[i].operation = 'delete';
            }
            scimdata[element.path].push(element.value[i]);
          }
        } else { // add to operations loop without path => handled by "no path"
          const obj = {};
          obj.op = element.op;
          obj.value = {};
          obj.value[element.path] = element.value;
          o.Operations.push(obj);
        }
      }
    } else { // no path
      for (const key in element.value) {
        if (Array.isArray(element.value[key])) {
          element.value[key].forEach((el, i) => {
            if (element.op && element.op === 'remove') el.operation = 'delete';
            if (!scimdata[key]) scimdata[key] = [];
            scimdata[key].push(el);
          });
        } else {
          let value = element.value[key];
          if (element.op && element.op === 'remove') {
            if (!scimdata.meta) scimdata.meta = {};
            if (!scimdata.meta.attributes) scimdata.meta.attributes = [];
            scimdata.meta.attributes.push(key);
          }
          if (key.startsWith('urn:')) { // can't use dot.str on key having dot e.g. urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:department
            const i = key.lastIndexOf(':');
            let k = key.substring(i + 1); // User, Group or <parentAttribute>.<childAttribute> - <URN>:<parentAttribute>.<childAttribute> e.g. :User:manager.value
            let rootKey;
            if (k === 'User' || k === 'Group') rootKey = key;
            else rootKey = key.substring(0, i); // urn:ietf:params:scim:schemas:extension:enterprise:2.0:User
            if (k === 'User' || k === 'Group') { // value is object
              const o = {};
              o[rootKey] = value;
              scimdata = extendObj(scimdata, o);
            } else {
              if (!scimdata[rootKey]) scimdata[rootKey] = {};
              if (k === 'manager' && typeof value !== 'object') { // fix Azure bug sending manager instead of manager.value
                k = 'manager.value';
              }
              if (!element.op || element.op !== 'remove') { // remove handled by general logic above
                dot.str(k, value, scimdata[rootKey]);
              }
            }
          } else if (typeof value === 'object') {
            for (const k in element.value[key]) {
              if (element.op && element.op === 'remove') {
                if (!scimdata.meta) scimdata.meta = {};
                if (!scimdata.meta.attributes) scimdata.meta.attributes = [];
                scimdata.meta.attributes.push(`${key}.${k}`);
              } else {
                value = element.value[key][k];
                dot.str(`${key}.${k}`, value, scimdata);
              }
            }
          } else dot.str(key, value, scimdata);
        }
      }
    }
  }

  // scimdata now SCIM 1.1 formatted, using convertedScim to get "type converted Object" and blank deleted values
  return convertedScim(scimdata);
};

const addResources = (data, startIndex, sortBy, sortOrder) => {
  if (!data || JSON.stringify(data) === '{}') data = []; // no user/group found
  const res = { Resources: [] };
  if (Array.isArray(data)) res.Resources = data;
  else if (data.Resources) {
    res.Resources = data.Resources;
    res.totalResults = data.totalResults;
  } else res.Resources.push(data);

  // pagination
  if (!res.totalResults) res.totalResults = res.Resources.length; // Specifies the total number of results matching the Consumer query
  res.itemsPerPage = res.Resources.length; // Specifies the number of search results returned in a query response page
  res.startIndex = parseInt(startIndex); // The 1-based index of the first result in the current set of search results
  if (!res.startIndex) res.startIndex = 1;
  if (res.startIndex > res.totalResults) { // invalid paging request
    res.Resources = [];
    res.itemsPerPage = 0;
  }

  if (sortBy) res.Resources.sort(sortByKey(sortBy, sortOrder));
  return res;
};

const addSchemas = (data, type, isScimv2, location) => {
  if (!type) {
    if (isScimv2) data.schemas = ['urn:ietf:params:scim:api:messages:2.0:ListResponse'];
    else data.schemas = ['urn:scim:schemas:core:1.0'];
    return data;
  }

  if (data.Resources) {
    if (isScimv2) data.schemas = ['urn:ietf:params:scim:api:messages:2.0:ListResponse'];
    else data.schemas = ['urn:scim:schemas:core:1.0'];
    for (let i = 0; i < data.Resources.length; i += 1) {
      if (isScimv2) { // scim v2 add schemas/resourceType on each element
        if (type === 'User') {
          const val = 'urn:ietf:params:scim:schemas:core:2.0:User';
          if (!data.Resources[i].schemas) data.Resources[i].schemas = [val];
          else if (!data.Resources[i].schemas.includes(val)) data.Resources[i].schemas.push(val);
          if (!data.Resources[i].meta) data.Resources[i].meta = {};
          data.Resources[i].meta.resourceType = type;
          if (location && data.Resources[i].id) data.Resources[i].meta.location = `${location}/${data.Resources[i].id}`;
        } else if (type === 'Group') {
          const val = 'urn:ietf:params:scim:schemas:core:2.0:Group';
          if (!data.Resources[i].schemas) data.Resources[i].schemas = [val];
          else if (!data.Resources[i].schemas.includes(val)) data.Resources[i].schemas.push(val);
          if (!data.Resources[i].meta) data.Resources[i].meta = {};
          data.Resources[i].meta.resourceType = 'Group';
        }
      }
      if (location && data.Resources[i].id) {
        if (!data.Resources[i].meta) data.Resources[i].meta = {};
        data.Resources[i].meta.location = `${location}/${data.Resources[i].id}`;
      }
      for (const key in data.Resources[i]) {
        if (key.startsWith('urn:')) {
          if (key.includes(':1.0')) {
            if (!data.schemas) data.schemas = [];
            if (!data.schemas.includes(key)) data.schemas.push(key);
          } else { // scim v2 add none core schemas on each element
            if (!data.Resources[i].schemas) data.Resources[i].schemas = [];
            if (!data.Resources[i].schemas.includes(key)) data.Resources[i].schemas.push(key);
          }
        } else if (key === 'password') delete data.Resources[i].password; // exclude password, null and empty object/array
        else if (data.Resources[i][key] === null) delete data.Resources[i][key];
        else if (JSON.stringify(data.Resources[i][key]) === '{}') delete data.Resources[i][key];
        else if (Array.isArray(data.Resources[i][key]) && data.Resources[i][key].length < 1) delete data.Resources[i][key];
      }
      if (Object.keys(data.Resources[i]).length === 0) {
        data.Resources.splice(i, 1); // delete
        i -= 1;
      }
    }
  } else {
    if (isScimv2) {
      if (type === 'User') {
        const val = 'urn:ietf:params:scim:schemas:core:2.0:User';
        if (!data.schemas) data.schemas = [val];
        else if (!data.schemas.includes(val)) data.schemas.push(val);
        if (!data.meta) data.meta = {};
        data.meta.resourceType = type;
      } else if (type === 'Group') {
        const val = 'urn:ietf:params:scim:schemas:core:2.0:Group';
        if (!data.schemas) data.schemas = [val];
        else if (!data.schemas.includes(val)) data.schemas.push(val);
        if (!data.meta) data.meta = {};
        data.meta.resourceType = type;
      }
    } else {
      const val = 'urn:scim:schemas:core:1.0';
      if (!data.schemas) data.schemas = [val];
      else if (!data.schemas.includes(val)) data.schemas.push(val);
    }
    for (const key in data) {
      if (key.startsWith('urn:')) { // add none core schema e.g. urn:ietf:params:scim:schemas:extension:enterprise:2.0:User
        if (!data.schemas) data.schemas = [key];
        else if (!data.schemas.includes(key)) data.schemas.push(key);
      } else if (key === 'password') delete data.password; // exclude password, null and empty object/array
      else if (data[key] === null) delete data[key];
      else if (JSON.stringify(data[key]) === '{}') delete data[key];
      else if (Array.isArray(data[key]) && data[key].length < 1) delete data[key];
    }
  }

  return data;
};

const sortByKey = (key, order = 'ascending') => (a, b) => { // inner sort
  const val = [undefined, undefined];
  const arrIter = [a, b];
  const levels = key.split('.');
  if (!Object.prototype.hasOwnProperty.call(a, levels[0]) || !Object.prototype.hasOwnProperty.call(b, levels[0])) return 0;
  arrIter.forEach((el, index) => {
    let parent = el;
    for (let i = 0; i < levels.length; i += 1) {
      if (Array.isArray(parent[levels[i]])) {
        if (i === levels.length - 1) {
          parent = undefined;
          break;
        }
        parent = parent[levels[i]][0][levels[i + 1]]; // using first array element istead of primary attribute e.g key=emails.value
        break;
      } else parent = parent[levels[i]];
    }
    val[index] = parent;
  });
  if (typeof val[0] !== 'string') return 0;
  const comparison = val[0].localeCompare(val[1]);
  return (
    (order === 'descending') ? (comparison * -1) : comparison
  );
};

const extendObj = (obj, src) => { // copy src content into obj
  Object.keys(src).forEach(key => {
    if (typeof src[key] === 'object' && src[key] != null) {
      if (typeof obj[key] === 'undefined') obj[key] = src[key];
      else if (Array.isArray(src[key])) {
        if (!Array.isArray(obj[key])) obj[key] = src[key];
        else {
          for (let i = 0; i < src[key].length; i += 1) {
            const val = src[key][i];
            if (typeof val === 'object') {
              if (Object.prototype.hasOwnProperty.call(val, 'value')) {
                const arr = obj[key].filter((el, index) => {
                  if (el.value && el.value === val.value & el.type === val.type) {
                    if (el.operation === 'delete' && !val.operation) obj[key].splice(index, 1); // delete
                    return true;
                  } if (el.value === '' && el.operation === 'delete' && el.type && el.type === val.type) {
                    obj[key].splice(index, 1); // delete
                    return false;
                  }
                  return false;
                });
                if (arr.length < 1) obj[key].push(val);
              } else obj[key].push(val);
            } else if (!obj[key].includes(val)) obj[key].push(val);
          }
        }
      } else obj[key] = extendObj(obj[key], src[key]);
    } else obj[key] = src[key];
  });
  return obj;
};

const copyObj = o => { // deep copy/clone faster than JSON.parse(JSON.stringify(o))
  let v; let
    key;
  const output = Array.isArray(o) ? [] : {};
  for (key in o) {
    v = o[key];
    if (typeof v === 'object' && v !== null) {
      const objProp = Object.getPrototypeOf(v); // e.g. HttpsProxyAgent {}
      if (objProp !== null && objProp !== Object.getPrototypeOf({}) && objProp !== Object.getPrototypeOf([])) {
        output[key] = Object.assign(Object.create(v), v); // e.g. { HttpsProxyAgent {...} }
      } else output[key] = copyObj(v);
    } else output[key] = v;
  }
  return output;
};

const stripObj = (obj, attributes, excludedAttributes) => { // strip and return a new object according to attributes or excludedAttributes - comma separated dot object list
  if (!attributes && !excludedAttributes) return obj;
  if (!obj || typeof obj !== 'object') return obj;
  let arrObj;
  if (!Array.isArray(obj)) arrObj = [obj];
  else {
    if (obj.length < 1) return obj;
    arrObj = obj;
  }
  let arrRet = [];
  const arrCheckEmpty = [];
  if (attributes) {
    const arrAttr = attributes.split(',').map(item => item.trim());
    arrRet = arrObj.map(obj => {
      const ret = {};
      for (let i = 0; i < arrAttr.length; i += 1) {
        const attr = arrAttr[i].split('.'); // title / name.familyName / emails.value
        if (Object.prototype.hasOwnProperty.call(obj, attr[0])) {
          if (attr.length === 1) ret[attr[0]] = obj[attr[0]];
          else if (Object.prototype.hasOwnProperty.call(obj[attr[0]], attr[1])) { // name.familyName
            if (!ret[attr[0]]) ret[attr[0]] = {};
            ret[attr[0]][attr[1]] = obj[attr[0]][attr[1]];
          } else if (Array.isArray(obj[attr[0]])) { // emails.value / phoneNumbers.type
            if (!ret[attr[0]]) ret[attr[0]] = [];
            const arr = obj[attr[0]];
            for (let j = 0; j < arr.length; j++) {
              if (typeof arr[j] !== 'object') {
                ret[attr[0]].push(arr[j]);
              } else if (Object.prototype.hasOwnProperty.call(arr[j], attr[1])) {
                if (ret[attr[0]].length !== arr.length) { // initiate
                  for (let i = 0; i < arr.length; i += 1) ret[attr[0]].push({}); // need arrCheckEmpty
                }
                ret[attr[0]][j][attr[1]] = arr[j][attr[1]];
                if (!arrCheckEmpty.includes(attr[0])) arrCheckEmpty.push(attr[0]);
              }
            }
          }
        }
      }
      if (arrCheckEmpty.length > 0) {
        for (let i = 0; i < arrCheckEmpty.length; i += 1) {
          const arr = ret[arrCheckEmpty[i]];
          for (let j = 0; j < arr.length; j++) {
            try {
              if (JSON.stringify(arr[j]) === '{}') arr.splice(j, 1);
            } catch (err) { }
          }
        }
      }
      return ret;
    });
  } else if (excludedAttributes) {
    const arrAttr = excludedAttributes.split(',').map(item => item.trim());
    arrRet = arrObj.map(obj => {
      const ret = copyObj(obj);
      for (let i = 0; i < arrAttr.length; i += 1) {
        const attr = arrAttr[i].split('.'); // title / name.familyName / emails.value
        if (Object.prototype.hasOwnProperty.call(ret, attr[0])) {
          if (attr.length === 1) delete ret[attr[0]];
          else if (Object.prototype.hasOwnProperty.call(ret[attr[0]], attr[1])) delete ret[attr[0]][attr[1]]; // name.familyName
          else if (Array.isArray(ret[attr[0]])) { // emails.value / phoneNumbers.type
            const arr = ret[attr[0]];
            for (let j = 0; j < arr.length; j++) {
              if (Object.prototype.hasOwnProperty.call(arr[j], attr[1])) {
                const index = arr.findIndex(el => ((Object.prototype.hasOwnProperty.call(el, attr[1]))));
                if (index > -1) {
                  delete arr[index][attr[1]];
                  try {
                    if (JSON.stringify(arr[index]) === '{}') arr.splice(index, 1);
                  } catch (err) { }
                }
              }
            }
          }
        }
      }
      return ret;
    });
  } else { // should not be here
    arrRet = [{}];
  }
  if (!Array.isArray(obj)) return arrRet[0];
  return arrRet;
};

const jsonErr = (htmlErrCode, err, scimType) => {
  let errJson = {};
  let msg = 'scimgateway';
  err.constructor === Error ? msg += err.message : msg += err;

  errJson =
  {
    schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
    scimType,
    detail: msg,
    status: htmlErrCode,
  };

  return errJson;
};
