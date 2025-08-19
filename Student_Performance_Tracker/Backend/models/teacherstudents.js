module.exports = (sequelize, DataTypes) => {
  const TeacherStudents = sequelize.define('TeacherStudents', {
    teacherId: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: 'Teachers',
        key: 'teacherId'
      }
    },
    studentId: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: 'Students',
        key: 'studentId'
      }
    },
    subjects: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    }
  }, {
    timestamps: false,
    tableName: 'TeacherStudents'
  });

  return TeacherStudents;
};
