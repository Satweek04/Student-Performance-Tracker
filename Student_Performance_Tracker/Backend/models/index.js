const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// models/index.js

fs.readdirSync(__dirname)
  .filter(file => file !== basename && file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Call associate method on each model to set associations, including many-to-many
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Existing one-to-one relations can remain here or move inside models' associate if you prefer
db.User.hasOne(db.Student, { foreignKey: 'userId' });
db.User.hasOne(db.Teacher, { foreignKey: 'userId' });

db.Student.belongsTo(db.User, { foreignKey: 'userId' });
db.Teacher.belongsTo(db.User, { foreignKey: 'userId' });

db.Mark.belongsTo(db.Student, { foreignKey: 'studentId', targetKey: 'studentId' });
db.Mark.belongsTo(db.Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

db.Attendance.belongsTo(db.Student, { foreignKey: 'studentId', targetKey: 'studentId' });
db.Attendance.belongsTo(db.Teacher, { foreignKey: 'teacherId', targetKey: 'teacherId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
