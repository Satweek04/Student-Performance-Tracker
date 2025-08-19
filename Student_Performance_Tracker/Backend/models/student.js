module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    studentId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    grade: DataTypes.STRING,
    subjects: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    userId: DataTypes.STRING
  }, {
    timestamps: true
  });

  Student.associate = (models) => {
    Student.belongsTo(models.User, { foreignKey: 'userId' });

    // Use the actual model instead of string
    Student.belongsToMany(models.Teacher, {
      through: models.TeacherStudents,
      foreignKey: 'studentId',
      otherKey: 'teacherId'
    });
  };

  return Student;
};
