import { MongoClient, ServerApiVersion, Document, Collection } from "mongodb";
import { config } from "dotenv";

config();

const uri = `mongodb+srv://omikuji:${process.env.MONGO_PASS}@omikuji.i3vrflb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

let colorsCol: Collection<Document>, itemsCol: Collection<Document>;
const PAGE_LIMIT = 20;

export const connectToDB = async () => {
  try {
    await client.connect();
    colorsCol = client.db("main").collection("colors");
    itemsCol = client.db("main").collection("items");
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

export const getAllColors = async (page_num = 1) => {
  try {
    return await await (
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

export const getAllItems = async () => {
  try {
    return await await (
      await itemsCol.find().toArray()
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
