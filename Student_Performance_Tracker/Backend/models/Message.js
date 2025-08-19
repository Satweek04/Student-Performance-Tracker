// models/Message.js - Make sure it looks like this:
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    senderId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    receiverId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    chatGroupId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'chatgroups',
        key: 'id'
      }
    },
    messageText: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    tableName: 'messages'
  });

  Message.associate = (models) => {
    // Sender association
    Message.belongsTo(models.User, { 
      foreignKey: 'senderId', 
      as: 'sender' 
    });
    
    // Receiver association
    Message.belongsTo(models.User, { 
      foreignKey: 'receiverId', 
      as: 'receiver' 
    });
    
    // Group association
    Message.belongsTo(models.ChatGroup, { 
      foreignKey: 'chatGroupId', 
      as: 'group' 
    });
  };

  return Message;
};
