import { Sequelize, DataTypes } from "sequelize";

// Create database
const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  // SQLite only
  storage: "database.sqlite",
});

export const Omikuji = sequelize.define("Omikuji", {
  user_id: {
    type: DataTypes.STRING,
    unique: true,
  },
  last_pick: {
    type: DataTypes.STRING,
  },
});
