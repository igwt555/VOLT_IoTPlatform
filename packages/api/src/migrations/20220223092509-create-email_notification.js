module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_notifications', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      recipient: {
        type: Sequelize.STRING,
      },
      sender_email: {
        type: Sequelize.STRING,
      },
      email_body: {
        type: Sequelize.STRING,
      },
      message_id: {
        type: Sequelize.STRING,
      },
      sent: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      received: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      undelivered: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      opened: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      subject: {
        type: Sequelize.STRING,
      },
      user_id: {
        type: Sequelize.UUID,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  // recipient, the sender email address, the email body, any email unique id

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('email_notifications');
  },
};
