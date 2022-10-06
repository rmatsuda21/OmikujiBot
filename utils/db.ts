import { Sequelize, DataTypes, QueryTypes } from "sequelize";

interface IItems {
  item: string;
  createdAt: string;
  updatedAt: string;
}

interface IColors {
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Create database
const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  // SQLite only
  storage: "database.sqlite",
});

// DB to store user data
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

// DB to store Lucky Colors
const LuckyColor = sequelize.define("luckycolors", {
  color: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
});

// DB to store Lucky Items
const LuckyItem = sequelize.define("luckyitems", {
  item: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
});

// Get random color from db
const getRandomColor = async () => {
  const results = (await sequelize.query(
    "SELECT * FROM luckycolors ORDER BY RANDOM() LIMIT 1;",
    { type: QueryTypes.SELECT }
  )) as IColors[];
  return results[0].color;
};

// Get random item from db
const getRandomItem = async () => {
  const results = (await sequelize.query(
    "SELECT * FROM luckyitems ORDER BY RANDOM() LIMIT 1;",
    { type: QueryTypes.SELECT }
  )) as IItems[];
  return results[0].item;
};

// Add color to db
const addLuckyColor = async (color: string, interaction) => {
  try {
    const newColor = await LuckyColor.create({ color });
    console.log("New Color:", newColor);
    interaction.reply("Made!");
  } catch (error) {
    console.log(error.original);
    interaction.reply("Error!");
  }
};

// Add color to db
const addLuckyItem = async (item: string, interaction) => {
  try {
    const newItem = await LuckyItem.create({ item });
    console.log("New Item:", newItem);
    interaction.reply("Made!");
  } catch (error) {
    console.log(error.original);
    interaction.reply("Error!");
  }
};

const getAllLuckyItems = async () => {
  const items = await LuckyItem.findAll();
  return items.map((item) => item.getDataValue("item"));
};

const getAllLuckyColors = async () => {
  const colors = await LuckyColor.findAll();
  return colors.map((color) => color.getDataValue("color"));
};

export {
  Omikuji,
  LuckyColor,
  LuckyItem,
  getRandomItem,
  getRandomColor,
  addLuckyColor,
  addLuckyItem,
  getAllLuckyItems,
  getAllLuckyColors,
};
