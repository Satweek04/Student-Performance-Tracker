module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'teacher', 'student'),
      allowNull: false
    },
    password: DataTypes.STRING
  }, {
    timestamps: true,
    tableName: 'users'  // <-- Add this line to match your database
  });
  return User;
};
