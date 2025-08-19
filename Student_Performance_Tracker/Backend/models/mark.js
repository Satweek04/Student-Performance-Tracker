module.exports = (sequelize, DataTypes) => {
  const Mark = sequelize.define('Mark', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    studentId: DataTypes.STRING,
    subject: DataTypes.STRING,
    marks: DataTypes.FLOAT,
    totalMarks: DataTypes.FLOAT,
    examType: DataTypes.ENUM('quiz', 'midterm', 'final', 'assignment'),
    date: DataTypes.DATEONLY,
    teacherId: DataTypes.STRING
  }, {
    tableName: 'marks', // explicitly specify table name lowercase plural
    timestamps: true
  });
  return Mark;
};
