module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('devices', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      serial_num: {
        type: Sequelize.INTEGER,
      },
      mac_addr_eth: {
        type: Sequelize.STRING,
      },
      mac_addr_wifi: {
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      device_data: {
        type: Sequelize.STRING,
      },
      app_id: {
        type: Sequelize.STRING,
      },
      current_release_id: {
        type: Sequelize.STRING,
      },
      target_release_id: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      is_online: {
        type: Sequelize.STRING,
      },
      last_connectivity_event: {
        type: Sequelize.DATE,
      },
      is_connected_to_vpn: {
        type: Sequelize.STRING,
      },
      last_vpn_event: {
        type: Sequelize.STRING,
      },
      ip_address: {
        type: Sequelize.STRING,
      },
      vpn_address: {
        type: Sequelize.STRING,
      },
      public_address: {
        type: Sequelize.STRING,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
      },
      organization_id: {
        type: Sequelize.UUID,
      },
      bay_id: {
        type: Sequelize.UUID,
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('devices');
  },
};
