import { Sequelize, DataTypes } from "sequelize";
const { colors }: { colors: string[] } = require("../data/luckyColor.json");
const { items }: { items: string[] } = require("../data/luckyItem.json");

// Create database
const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  // SQLite only
  storage: "database.sqlite",
});

const Omikuji = sequelize.define("omikuji", {
  user_id: {
    type: DataTypes.STRING,
    unique: true,
    primaryKey: true,
  },
  last_pick: {
    type: DataTypes.STRING,
  },
});

const LuckyColor = sequelize.define("luckycolor", {
  color: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
});

const LuckyItem = sequelize.define("luckyitem", {
  item_name: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
});

// const getRandomColor = () => [
//   LuckyColor.findAll({ order: Sequelize.literal("rand()"), limit: 5 }).then(
//     (colors) => {
//       console.log(colors);
//     }
//   ),
// ];

// const getRandomItem = () => [
//   LuckyItem.findAll({ order: Sequelize.literal("rand()"), limit: 5 }).then(
//     (items) => {
//       console.log(items);
//     }
//   ),
// ];

// Seed
const setSeed = async () => {
  const tables = await sequelize.getQueryInterface().showAllTables();
  console.log(tables);
  // await LuckyColor.bulkCreate(
  //   colors.map((color) => {
  //     return { color };
  //   })
  // );
  // await LuckyItem.bulkCreate(
  //   items.map((item) => {
  //     return { item_name: item };
  //   })
  // );
  // const item = await LuckyItem.findOne({
  //   where: { item_name: "やっすいリップ" },
  // });
  // console.log(item instanceof LuckyItem);
  // console.log(item.item_name);
};

setSeed();

export { Omikuji, LuckyColor, LuckyItem };
