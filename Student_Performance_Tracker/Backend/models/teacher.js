module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
    teacherId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    userId: DataTypes.STRING,
    subjects: {
      type: DataTypes.JSON
    }
  }, {
    timestamps: true
  });

  Teacher.associate = (models) => {
    Teacher.belongsTo(models.User, { foreignKey: 'userId' });

    // Use the actual model instead of string
    Teacher.belongsToMany(models.Student, {
      through: models.TeacherStudents,
      foreignKey: 'teacherId',
      otherKey: 'studentId'
    });
  };

  return Teacher;
};
