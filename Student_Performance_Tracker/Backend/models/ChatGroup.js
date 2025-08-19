module.exports = (sequelize, DataTypes) => {
  const ChatGroup = sequelize.define('ChatGroup', {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'chatgroups'  // <-- Changed from 'chat_groups' to 'chatgroups'
  });

ChatGroup.associate = (models) => {
  // Created by Teacher or User
  ChatGroup.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });

  // HasMany relationship with ChatGroupMembers
  ChatGroup.hasMany(models.ChatGroupMembers, { 
    foreignKey: 'chatGroupId',
    as: 'members' // This alias is important!
  });

  // One-to-many: Group has many Messages
  ChatGroup.hasMany(models.Message, { foreignKey: 'chatGroupId' });
};


  return ChatGroup;
};
