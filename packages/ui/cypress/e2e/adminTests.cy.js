/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// https://docs.cypress.io/api/table-of-contents

const randInt = size => Math.floor(Math.random() * size);

describe('SuperAdmin', () => {
  before(() => {
    cy.visit('/register');

    // TODO: try to submit and verify UI rejects submission with warning to fill in email
    cy.get('#full_name').type('Test User');
    //  cy.get('input[type=email]').type('test.user${randInt(4000)}@sunalgo.com');
    cy.get('#email1').type('test.user12@sunalgo.com');
    // TODO: try to submit and verify UI rejects submission with warning to fill in password
    cy.get('#password1').type('password123#');
    // TODO: try to submit and verify UI rejects submission with warning to confirm password
    cy.get('#password2').type('password123#');
    cy.get('.e2e-register').click();
    cy.wait(3000);
    //  logout user after successfull registration
    cy.get('.e2e-profile').click();
    cy.get('.e2e-logout').click();
    // TODO: fix, when the backend gives an error, there is no user feedback "A temporary error occured. Please try again later"
  });

  beforeEach(() => {
    cy.session('user', () => {
      cy.visit('/login');
      cy.get('#email1').type('test.user12@sunalgo.com');
      cy.get('.e2e-next').click();
      cy.get('#password1').type('password123#');
      cy.get('.e2e-signin').click();
      cy.wait(2000);
    });
  });

  describe('Role Management: roles#index', () => {
    it('Can view a page of roles', () => {
      cy.visit('/roles');
      cy.get('table').contains('td', 'No roles found.');
      cy.wait(2000);
    });

    it('Can add a role', () => {
      cy.visit('/roles');
      cy.get('.flex > div > :nth-child(2)').click();
      cy.get('.e2e-rolename').type('user');
      cy.get('.e2e-description').type('add new role');
      cy.get('.e2e-add-role').click();
      cy.wait(2000);
      cy.get('div').contains('Role successfully added');
    });

    it('Can filter roles by their Role', () => {
      cy.visit('/roles');
      cy.get('.e2e-role-filter > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
      cy.get('.p-column-filter-constraint > .p-column-filter').type('user');
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it('Can filter alerts by their Description', () => {
      cy.visit('/roles');
      cy.get('.e2e-description-filter > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
      cy.get('.p-column-filter-constraint > .p-column-filter').type('add new role');
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    // it('Can update a role', () => {
    //   cy.visit('/roles');
    //   cy.get(':nth-child(2) > :nth-child(4) > .p-splitbutton > .p-button-icon-only > .pi').click();
    //   cy.get(':nth-child(1) > .p-menuitem-link').click();
    //   cy.get('.p-dialog-content > .p-inputtext').clear().type('role');
    //   cy.get('[autofocus=""]').click();
    //   cy.wait(2000);
    //   cy.get('div').contains('Role Updated successfully');
    // });

    // it('Can delete a role', () => {
    //   cy.visit('/roles');
    //   cy.get(':nth-child(2) > :nth-child(4) > .p-splitbutton > .p-button-icon-only > .pi').click();
    //   cy.get(':nth-child(2) > .p-menuitem-link').click();
    //   cy.get('[autofocus=""]').click();
    //   cy.wait(2000);
    //   cy.get('div').contains('Role deleted successfully!');
    // });
  });

  // describe('AccountSetting Management: accountSetting#index', () => {
  //   it('AccountSetting Management: accountSetting#index', () => {
  //     cy.visit('/accountSetting');
  //     cy.get('.e2e-profile').click();
  //     cy.get('.e2e-accountsetting').click();
  //     cy.get('#name').clear().type('Test User');
  //     cy.get('#email1').clear().type('test.user12@sunalgo.com');
  //     cy.get('#timezone').type('(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi').click();
  //     cy.get('#phone').type('8565254587');
  //     cy.get('.e2e-add-accountsetting').click();
  //     cy.wait(2000);
  //     cy.get('div').contains('Account Detail Updated SuccessFully');
  //   });
  // });

  describe('Location Management: locations#index', () => {
    it('Location Management: locations#index', () => {
      cy.visit('/locations');
      cy.get('table').contains('td', 'No locations found.');
      cy.wait(2000);
    });

    it('Can add a location', () => {
      cy.visit('/locations');
      cy.get(':nth-child(2) > .p-button-label').click();
      cy.get('.p-inputtext.p-component').type('testlocation');
      cy.get('.e2e-Org > .p-dropdown-label').click();
      cy.get('.p-dropdown-item').click();
      cy.get('.e2e-add-location').click();
      cy.wait(2000);
      cy.get('div').contains('Location created successfully');
    });

    it.skip('Can add a location to a subaccount');

    it('Can filter locations by their location', () => {
      cy.visit('/locations');
      cy.get('.e2e-col-location > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
      cy.get('.p-column-filter-constraint > .p-column-filter').type('volt');
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it('Can filter locations by a date', () => {
      cy.visit('/locations');
      cy.get('.e2e-col-date-added > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Date is').click();
      cy.get('.p-calendar').click();
      cy.get('.p-datepicker-today > [draggable="false"]').click();
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it('Can update a location', () => {
      cy.visit('/locations');
      cy.get('.p-datatable-tbody > tr > :nth-child(3) > :nth-child(1)').click();
      cy.get('.p-inputtext').clear().type('new test location');
      cy.get('.e2e-add-location').click();
      cy.wait(2000);
      cy.get('div').contains('Location updated successfully');
    });

    it('Can delete a location', () => {
      cy.visit('/locations');
      cy.get('.p-button-danger').click();
      cy.get('.p-confirm-dialog-accept').click();
      cy.wait(2000);
      cy.get('div').contains('Location deleted successfully');
    });
  });

  // describe('Fleet Management units#index', () => {
  //   it('Can view a table of units', () => {
  //     cy.visit('/units');
  //     cy.get('table').contains('td', 'No units found.');
  //     cy.wait(2000);
  //   });

  //   it('Can search for a unit serial number', () => {
  //     cy.visit('/units');
  //     cy.get('.e2e-col-serialnum > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
  //     cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
  //     cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
  //     cy.get('.p-column-filter-constraint > .p-column-filter').type('1010');
  //     cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
  //     cy.wait(2000);
  //   });

  //   it('Can filter units by the date it was initialized', () => {
  //     cy.visit('/units');
  //     cy.get('.e2e-col-initialized > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
  //     cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
  //     cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
  //     cy.get('.p-calendar').click();
  //     cy.get('.p-datepicker-today > [draggable="false"]').click();
  //     cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
  //     cy.wait(2000);
  //   });

  //   it('Can filter units by the unit status', () => {
  //     cy.visit('/units');
  //     cy.get('.e2e-col-status > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
  //     cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
  //     cy.get('.p-column-filter-constraint > .p-inputwrapper-filled > .p-dropdown-label').type('Contains').click(); // cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click()
  //     cy.get('.p-column-filter-constraint > .p-column-filter').type('READY').click();
  //     cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
  //     cy.wait(2000);
  //   });

  //   it('Can filter units by their current level of activity', () => {
  //     cy.visit('/units');
  //     cy.get('.e2e-col-activity > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
  //     cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
  //     cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
  //     cy.wait(2000);
  //   });

  //   it('Can filter units by their connectivity', () => {
  //     cy.visit('/units');
  //     cy.get('.e2e-col-connection > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
  //     cy.get('.p-checkbox-box').click();
  //     cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
  //     cy.wait(2000);
  //   });

  //   it.skip('Can paginate through units');

  //   it.skip('Can search units by a serial number');
  // });

  describe('Team Management user#index', () => {
    it('Can view a table of users', () => {
      cy.visit('/users');
      cy.get('table').contains('td', 'Test User');
      cy.wait(2000);
    });

    it('Can add a new user', () => {
      cy.visit('/users');
      cy.get('h5').contains('Users');
      cy.get('.ml-3 > .p-button-label').click();
      cy.get(':nth-child(1) > label > .p-inputtext').type('testnewuser');
      cy.get(':nth-child(2) > label > .p-inputtext').type('test@gmail.com');
      cy.get(':nth-child(3) > label > .p-inputtext').type('password123#');
      cy.get(':nth-child(4) > label > .p-inputtext').type('password123#');
      cy.get(':nth-child(5) > label').type('user').click();
      cy.get(':nth-child(6) > label > .p-dropdown').type('Apple t').click();
      cy.get('.e2e-add-user').click();
      cy.wait(3000);
      cy.get('div').contains('User Created Successfully');
    });

    it.skip('Can add a user to a subaccount');

    it('Can filter users by their name', () => {
      cy.visit('/users');
      cy.get('.e2e-col-user > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
      cy.get('.p-column-filter-constraint > .p-column-filter').type('volt');
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it('Can filter users by their email address', () => {
      cy.visit('/users');
      cy.get('.e2e-col-email > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
      cy.get('.p-column-filter-constraint > .p-column-filter').type('testuser');
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it('Can filter users by their role', () => {
      cy.visit('/users');
      cy.get('.e2e-col-role > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label').type('Match All').click();
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('SUPER ADMIN').click();
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it.skip('Can import users from a CSV');

    it('Can export users to a CSV', () => {
      cy.visit('/users');
      cy.get('h5').contains('Users');
      cy.get('.flex > div > :nth-child(2)').click();
      cy.get('.p-confirm-dialog-reject').click();
    });
  });

  describe('User Management user#show', () => {
    it('Can change a users password', () => {
      cy.visit('/users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get('.e2e-changepassword').click();
      cy.get('.e2e-password').type('password123#');
      cy.get('.e2e-conf-password').type('password123#');
      cy.get('.e2e-proceed-button').click();
      cy.wait(3000);
      cy.get('div').contains('Password successfully updated');
    });

    it('Can reset a users password', () => {
      cy.visit('/users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get('.justify-content-evenly > :nth-child(3)').click();
      cy.wait(3000);
      cy.get('div').contains('Password reset instructions have been sent to test.user12@sunalgo.com');
    });

    it('Can update a users email address', () => {
      cy.visit('/users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get(':nth-child(1) > .flex > .pi').click();
      cy.get('.e2e-update-user').clear().type('test.user12@sunalgo.com');
      cy.get('.e2e-update-email').click();
      cy.wait(3000);
      cy.get('div').contains('User email successfully updated');
    });

    it('Can update a users role', () => {
      cy.visit('/users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get(':nth-child(2) > .flex > .pi').click();
      cy.get('.e2e-edit-role').type('Super Admin').click();
      cy.get('.e2e-update-role').click();
      cy.wait(3000);
      cy.get('div').contains('User role successfully updated');
    });

    it('Can filter email notifications table by message', () => {
      cy.visit('/users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get('.e2e-message-filter > .p-column-header-content > .p-column-filter').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label').type('Match Any').click();
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
      cy.get('.p-column-filter-constraint > .p-column-filter').type('password reset');
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it('Can filter email notifications table by sent on', () => {
      cy.visit('/users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get('.e2e-senton-filter > .p-column-header-content > .p-column-filter').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Date is').click();
      cy.get('.p-calendar').click();
      cy.get('.p-datepicker-today > [draggable="false"]').click();
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it('Can filter email notifications table by recipient', () => {
      cy.visit('/users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get('.e2e-recipient-filter > .p-column-header-content > .p-column-filter').click().click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-trigger').type('Match Any').click();
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
      cy.get('.p-column-filter-constraint > .p-column-filter').type('test.user');
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it.skip('KwikIQ subdomain only: Can assign a users to a device bay');

    it('KwikIQ subdomain only: Can assign a pin code to a user', () => {
      cy.visit('/users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get('.e2e-addaccess-method').click();
      cy.get('.e2e-access-method-type').type('Pin Code').click();
      cy.get(':nth-child(2) > .p-inputtext').type(344600);
      cy.get(':nth-child(3) > .p-inputtext').type('08/25/2022');
      cy.get(':nth-child(4) > .p-inputtext').type('09/01/2022');
      cy.get('.e2e-submit-proceed').click();
      cy.wait(2000);
    });

    it('KwikIQ subdomain only: Can assign a rfid tag to a user', () => {
      cy.visit('/users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get('.e2e-addaccess-method').click();
      cy.get('.e2e-access-method-type').type('RFID Code').click();
      cy.get(':nth-child(2) > .p-inputtext').type(345300);
      cy.get(':nth-child(3) > .p-inputtext').type('08/25/2022');
      cy.get(':nth-child(4) > .p-inputtext').type('09/01/2022');
      cy.get('.e2e-submit-proceed').click();
      cy.wait(2000);
    });

    it('Can filter currently assigned access methods table by type', () => {
      cy.visit('/users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get('.e2e-type > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label').type('Match All').click();
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
      cy.get('.p-column-filter-constraint > .p-column-filter').type('Pin');
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it('Can filter currently assigned access methods table by Data', () => {
      cy.visit('/users');
      cy.get('h5').contains('Users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get('.e2e-data > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label').type('Match All').click();
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
      cy.get('.p-column-filter-constraint > .p-column-filter').type('600');
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it('Can filter currently assigned access methods table by Date', () => {
      cy.visit('/users');
      cy.get('h5').contains('Users');
      cy.get('.p-datatable-tbody > :nth-child(1) > .e2e-col-user').click();
      cy.get('.e2e-date > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click().click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label');
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Date is').click();
      cy.get('.p-calendar').click();
      cy.get('.p-datepicker-today > [draggable="false"]').click();
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });
  });

  describe('KwikIQ Reporting reports#index', () => {
    it('Can view a list of kb_device_events', () => {
      cy.visit('/reports');
      cy.wait(2000);
    });

    it.skip('Can filter the reporting feed by status');

    it.skip('Can filter the reporting feed by unit id');

    it.skip('Can filter the reporting feed by user');

    it.skip('Can filter the reporting feed by location');

    it.skip('Can filter the reporting feed by chamber');

    it.skip('Can filter the reporting feed by date & time before X');

    it.skip('Can filter the reporting feed by date & time after X');

    it.skip('Can filter the reporting feed by date & time between X and Y');

    it.skip('Can see the correct description for "access rejected" events');

    it.skip('Can see the correct description for "deposit" events');

    it.skip('Can see the correct description for "retrival" events');
  });

  describe('KwikIQ Alerts alerts#index', () => {
    it('Can view a table of alerts', () => {
      cy.visit('/alerts');
      cy.get('table').contains('td', 'No recent alerts.');
      cy.wait(2000);
    });

    it('Can filter alerts by their Occured At', () => {
      cy.visit('/alerts');
      cy.get('.e2e-col-occured > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
      cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label').type('Match Any').click();
      cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Date is').click();
      cy.get('.p-calendar').click();
      cy.get('.p-datepicker-today > [draggable="false"]').click();
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });

    it('Can filter alerts by their Description', () => {
      cy.visit('/alerts');
      cy.get('.e2e-col-description > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
      cy.get('.p-dropdown-label').type('Match Any').click();
      cy.get('.p-column-filter-constraint > .p-inputtext').type('device');
      cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
      cy.wait(2000);
    });
  });

  // describe('KwikIQ Devices devices#index', () => {
  //   it('Can view a table of devices', () => {
  //     cy.visit('/devices');
  //     cy.get('table').contains('td', 'No devices found.');
  //     cy.wait(2000);
  //   });

  //   it('Can filter the Devices by their make', () => {
  //     cy.visit('/devices');
  //     cy.get('.e2e-make-filter > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
  //     cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label').type('Match All').click();
  //     cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
  //     cy.get('.p-column-filter-constraint > .p-column-filter').type('phone');
  //     cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
  //     cy.wait(2000);
  //   });

  //   it('Can filter the Devices by their model', () => {
  //     cy.visit('/devices');
  //     cy.get('.e2e-model-filter > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
  //     cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label').type('Match All').click();
  //     cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
  //     cy.get('.p-column-filter-constraint > .p-column-filter').type('Apple');
  //     cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
  //     cy.wait(2000);
  //   });

  //   it('Can filter the Devices by their serial number', () => {
  //     cy.visit('/devices');
  //     cy.get('.e2e-serialnumber-filter > .p-column-header-content > .p-column-filter > .p-column-filter-menu-button > .pi').click();
  //     cy.get('.p-column-filter-operator > .p-dropdown > .p-dropdown-label').type('Match All').click();
  //     cy.get('.p-column-filter-constraint > .p-dropdown > .p-dropdown-label').type('Contains').click();
  //     cy.get('.p-column-filter-constraint > .p-column-filter').type('112');
  //     cy.get('.p-column-filter-buttonbar > :nth-child(2)').click();
  //     cy.wait(2000);
  //   });

  //   it('Can assign device to user by Resevation Type One Off', () => {
  //     cy.visit('/devices');
  //     cy.get('.e2e-action > .p-button').click();
  //     cy.get('#select-user > .p-dropdown-label').type('Test User').click();
  //     cy.get('#type > .p-dropdown-label').type('One Off').click();
  //     cy.get('.e2e-submit-proceed').click();
  //     cy.wait(2000);
  //     cy.get('div').contains('Device assign to user successfully');
  //   });

  //   it('Can assign device to user by Resevation Type Persistent', () => {
  //     cy.visit('/devices');
  //     cy.get('.e2e-action > .p-button').click();
  //     cy.get('#select-user > .p-dropdown-label').type('Test User').click();
  //     cy.get('#type > .p-dropdown-label').type('Persistent').click();
  //     cy.get('.e2e-submit-proceed').click();
  //     cy.wait(2000);
  //     cy.get('div').contains('Device assign to user successfully');
  //   });
  // });

  describe('Configuration configuration#index', () => {
    it('Can view a page of configuration', () => {
      cy.visit('/configuration');
      cy.wait(2000);
    });

    it('Can update the name for the organization', () => {
      cy.visit('/configuration');
      cy.get('#companyName').clear().type('Apple t');
      cy.get('.e2e-update-companyname').click();
      cy.wait(2000);
      cy.get('div').contains('Account updated successfully.');
      cy.get('div').contains('Company name updated');
    });
  });

  describe('Organization Management organization#index', () => {
    it('Can view a page of organization', () => {
      cy.visit('/organizations');
      cy.wait(2000);
    });

    it('Can create new subaccounts', () => {
      cy.visit('/organizations');
      cy.get('.e2e-new-sub-account').click();
      cy.get('.e2e-select-parent-account').type('Apple t').click();
      cy.get('.e2e-account-name').type('i phone 13');
      cy.get('.e2e-submit-proceed').click();
      cy.wait(2000);
      cy.get('div').contains('Account successfully added');
    });

    it('Can edit the name of sub-accounts/orgs', () => {
      cy.visit('/organizations');
      cy.get('.p-tree-toggler').click();
      cy.get('.p-treenode-children > .p-treenode > .p-treenode-content > .p-treenode-label > .w-full > .ml-auto > :nth-child(1)').click();
      cy.get('.e2e-edit-account').clear().type('i phone 14');
      cy.get('.e2e-update').click();
      cy.wait(2000);
      cy.get('div').contains('Account updated successfully');
    });

    it('Can delete subaccounts', () => {
      cy.visit('/organizations');
      cy.get('.p-tree-toggler').click();
      cy.get('.ml-auto > :nth-child(2)').click();
      cy.get('.e2e-deleteorg').click();
      cy.wait(2000);
      cy.get('div').contains('Organization deleted successfully!');
    });

    it.skip('Can update the product manual for accounts');
  });
});
