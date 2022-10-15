import { MongoClient, ServerApiVersion, Document, Collection } from "mongodb";
import { config } from "dotenv";
import dayjs from "dayjs";

config();

const uri = `mongodb+srv://omikuji:${process.env.MONGO_PASS}@omikuji.i3vrflb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

let colorsCol: Collection<Document>,
  itemsCol: Collection<Document>,
  usersCol: Collection<Document>,
  shobaiCol: Collection<Document>,
  rennaiCol: Collection<Document>,
  gannbouCol: Collection<Document>;
const PAGE_LIMIT = 20;

export const connectToDB = async () => {
  try {
    await client.connect();
    colorsCol = client.db("main").collection("colors");
    itemsCol = client.db("main").collection("items");
    usersCol = client.db("main").collection("user");
    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.log(err);
  }
};

export const seedDB = async () => {
  const { colors }: { colors: string[] } = require("../data/luckyColor.json");
  const { items }: { items: string[] } = require("../data/luckyItem.json");

  console.log("Starting Seeding...");

  const collectionName = (
    await client.db("main").listCollections().toArray()
  ).map(({ name }) => name);

  const colorsExists = collectionName.indexOf("colors") !== -1;
  const itemsExists = collectionName.indexOf("items") !== -1;
  await Promise.all([
    colorsExists && colorsCol.drop(),
    itemsExists && itemsCol.drop(),
  ]);

  const colorsDoc = colors.map((color) => ({ color }));
  const itemsDoc = items.map((item) => ({ item }));

  await Promise.all([
    colorsCol.insertMany(colorsDoc),
    itemsCol.insertMany(itemsDoc),
  ]);

  console.log("Finished Seeding!");
};

export const getRandomColor = async () => {
  try {
    return (await colorsCol.aggregate([{ $sample: { size: 1 } }]).next()).color;
  } catch (err) {
    throw "Couldn't get color!";
  }
};

export const getRandomItem = async () => {
  try {
    return (await itemsCol.aggregate([{ $sample: { size: 1 } }]).next()).item;
  } catch (err) {
    throw "Couldn't get item!";
  }
};

export const getAllColors = async () => {
  try {
    return (await colorsCol.find().toArray()).map(({ color }) => color);
  } catch (err) {
    throw "Error while getting all colors";
  }
};

export const getColorPaginated = async (page_num = 1) => {
  try {
    return (
      await colorsCol
        .find()
        .skip(page_num > 0 ? PAGE_LIMIT * (page_num - 1) : 0)
        .limit(PAGE_LIMIT)
        .toArray()
    ).map(({ color }) => color);
  } catch (err) {
    throw "Error while getting all colors";
  }
};

export const getColorsCount = async () => {
  try {
    return await colorsCol.estimatedDocumentCount();
  } catch (err) {
    throw "Error: (getColorsCount)";
  }
};

export const getMaxColorsPageNum = async () => {
  try {
    return Math.ceil((await colorsCol.estimatedDocumentCount()) / PAGE_LIMIT);
  } catch (err) {
    throw "Error: (getMaxColorsPageNum)";
  }
};

export const getItemsCount = async () => {
  try {
    return await itemsCol.estimatedDocumentCount();
  } catch (err) {
    throw "Error: (getItemsCount)";
  }
};

export const getMaxItemsPageNum = async () => {
  try {
    return Math.ceil((await itemsCol.estimatedDocumentCount()) / PAGE_LIMIT);
  } catch (err) {
    throw "Error: (getMaxItemsPageNum)";
  }
};

export const getAllItems = async () => {
  try {
    return (await itemsCol.find().toArray()).map(({ item }) => item);
  } catch (err) {
    throw "Error while getting all colors";
  }
};

export const getItemsPaginated = async (page_num = 1) => {
  try {
    return (
      await itemsCol
        .find()
        .skip(page_num > 0 ? PAGE_LIMIT * (page_num - 1) : 0)
        .limit(PAGE_LIMIT)
        .toArray()
    ).map(({ item }) => item);
  } catch (err) {
    throw "Error while getting all colors";
  }
};

export const addColor = async (color: string) => {
  try {
    await colorsCol.insertOne({ color });
  } catch (err) {
    throw "Couldn't insert";
  }
};

export const addItem = async (item: string) => {
  try {
    await itemsCol.insertOne({ item });
  } catch (err) {
    throw "Couldn't insert";
  }
};

export const removeItem = async (item: string) => {
  try {
    const res = await itemsCol.deleteOne({ item });
    if (res.deletedCount === 1) return true;
    return false;
  } catch (err) {
    throw "Error: (removeItem)";
  }
};

export const removeColor = async (color: string) => {
  try {
    const res = await colorsCol.deleteOne({ color });
    if (res.deletedCount === 1) return true;
    return false;
  } catch (err) {
    throw "Error: (removeColor)";
  }
};

export const updateUserDrawDate = async (user_id) => {
  try {
    const res = await usersCol.findOneAndUpdate(
      { userId: user_id },
      { $set: { last_draw: dayjs().toString() } },
      { upsert: true }
    );
  } catch (err) {
    throw "Error: (updateUserDrawDate)";
  }
};
