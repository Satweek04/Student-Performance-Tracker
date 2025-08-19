module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    studentId: DataTypes.STRING,
    subject: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    status: DataTypes.ENUM('present', 'absent', 'late'),
    teacherId: DataTypes.STRING
  }, {
    tableName: 'attendances',   // explicitly specify table name lowercase plural
    timestamps: true
  });
  return Attendance;
};
