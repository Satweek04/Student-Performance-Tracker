module.exports = (sequelize, DataTypes) => {
  const ChatGroupMembers = sequelize.define('ChatGroupMembers', {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    chatGroupId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'chatgroups',
        key: 'id'
      }
    },
    memberId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    memberRole: {
      type: DataTypes.ENUM('teacher', 'student'),
      allowNull: false
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: false, // <-- CHANGE THIS FROM true TO false
    tableName: 'chatgroupmembers'
  });

  ChatGroupMembers.associate = (models) => {
    ChatGroupMembers.belongsTo(models.ChatGroup, { 
      foreignKey: 'chatGroupId',
      as: 'group'
    });
    
    ChatGroupMembers.belongsTo(models.User, { 
      foreignKey: 'memberId',
      as: 'member'
    });
  };

  return ChatGroupMembers;
};
