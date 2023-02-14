// import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';
import Organization from '../models/organization.mjs';

// const awsConfig = {
//   accessKeyId: process.env.KWIKIQ_EMAIL_ACCESS_KEY_ID,
//   secretAccessKey: process.env.KWIKIQ_EMAIL_SECRET_ACCESS_KEY,
//   region: 'us-east-1',
// };

// const params = {
//   Protocol: 'https',
//   TopicArn: 'arn:aws:sns:us-east-1:973347292524:kb_email_bounced',
//   Endpoint: 'arn:aws:sns:us-east-1:973347292524:kb_email_bounced',
// };
// const sns = new AWS.SNS(awsConfig);
// const notification = await sns.subscribe(params).promise();
// console.log('notification -->', notification);

export const getSmtpSettingsForOrg = async orgId => {
  let organization;
  let config;

  if (orgId) {
    organization = await Organization.findAll({ where: { id: orgId } });
    config = organization[0].config;
  }

  let SMTPSettings;
  if (config) {
    SMTPSettings = {
      host: config.MAIL_HOST,
      port: config.MAIL_PORT,
      secure: false,
      // service: "gmail",
      auth: {
        user: config.MAIL_USERNAME,
        pass: config.MAIL_PASSWORD,
      },
    };
  } else {
    SMTPSettings = {
      host: 'email-smtp.us-east-1.amazonaws.com',
      port: 587,
      secure: false,
      // service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    };
  }
  return SMTPSettings;
};

export const createTransporter = async SMTPSettings => nodemailer.createTransport(SMTPSettings);

export const userEmail = async (user, mailSubject, htmlData) => {
  const mailOptions = {
    from: 'no-reply@kwikboost.net',
    to: user.email,
    subject: mailSubject,
    html: htmlData,
  };

  const SMTPSettings = await getSmtpSettingsForOrg(user.organization_id);
  const transporter = await createTransporter(SMTPSettings);

  return transporter.sendMail(mailOptions);
};

// const ses = new AWS.SES(awsConfig);

export const sendForgetPassEmail = async (targetEmail, mailSubject, emailBody) => {
  const mailOptions = {
    from: 'no-reply@kwikboost.net',
    to: targetEmail,
    subject: mailSubject,
    html: emailBody,
  };

  const SMTPSettings = await getSmtpSettingsForOrg();
  const transporter = await createTransporter(SMTPSettings);

  const res = await transporter.sendMail(mailOptions);
  return res;
};

export const changePasswordEmail = async (targetEmail, orgId) => {
  const mailOptions = {
    from: 'no-reply@kwikboost.net',
    to: targetEmail,
    subject: 'KwikIQ - Your password updated',
    html: `
      <div>
        <h1>Change Password</h1>
        <p>We've processed a request to change your password. If you believe this to be in error, please contact your account administrator</p>
      </div>
      `,
  };

  const SMTPSettings = await getSmtpSettingsForOrg(orgId);
  const transporter = await createTransporter(SMTPSettings);

  return transporter.sendMail(mailOptions);
};

export const sendPinCodeEmail = async (user, location) => {
  const pinCode = Math.floor(1000 + Math.random() * 9000);

  const mailOptions = {
    from: 'no-reply@kwikboost.net',
    to: user.email,
    subject: 'KwikIQ - Bay Assignment: Your locker pin code',
    html: `
    <div>
      <h1>Device Return Request</h1>
      <div>You have been assigned a request to return your device to the <b>${location}</b> locker.</div>
      <div>Your Pin for the return is: ${pinCode}</div>
    </div>
    `,
  };

  const SMTPSettings = await getSmtpSettingsForOrg(user.organization_id);
  const transporter = await createTransporter(SMTPSettings);

  return transporter.sendMail(mailOptions);
};

// export const assignDeviceToUserEmail = async (email, location) => {
//   const pinCode = Math.floor(1000 + Math.random() * 9000);
//   let params = {
//     Source: 'no-reply@kwikboost.net',
//     Destination: {
//       ToAddresses: [email],
//     },
//     ReplyToAddresses: [],
//     Message: {
//       Body: {
//         Html: {
//           Charset: 'UTF-8',
//           Data: `
//             <div>
//               <h1>Assign Device To User</h1>
//               <div>You have been assigned a device for pickup. You can retrieve it from Location <b>${location}</b> using pin code ${pinCode}</div>
//             </div>
//           `,
//         },
//       },
//       Subject: {
//         Charset: 'UTF-8',
//         Data: 'KwikIQ - Device Assign',
//       },
//     },
//   };

//   await ses.sendEmail(params).promise().then((res) => {
//     console.log('assign user mail send res -->', res);
//     return res;
//   }).catch((error) => {
//     console.log('assign user mail send error -->', error);
//     return error;
//   });
// };
export const sendPinCode = async (targetEmail, orgId, pinCode) => {
  const mailOptions = {
    from: 'no-reply@kwikboost.net',
    to: targetEmail,
    subject: 'KwikIQ - Pincode',
    html: `
      <div>
        <h1>You've been assigned a new pin code:${pinCode}</h1>
      </div>
      `,
  };

  const SMTPSettings = await getSmtpSettingsForOrg(orgId);
  const transporter = await createTransporter(SMTPSettings);

  return transporter.sendMail(mailOptions);
};
