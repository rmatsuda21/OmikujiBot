import {
  MongoClient,
  ServerApiVersion,
  Document,
  Collection,
  Db,
  WithId,
} from "mongodb";
import { config } from "dotenv";
import dayjs from "dayjs";
import { getRandomElementFromArray } from "./getRandomElementFromArray";

config();

const uri = `mongodb+srv://omikuji:${process.env.MONGO_PASS}@omikuji.i3vrflb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

let mainDb: Db,
  colorsCol: Collection<Document>,
  itemsCol: Collection<Document>,
  usersCol: Collection<Document>,
  textsCol: Collection<Document>,
  headerSubtextsCol: Collection<Document>;

const PAGE_LIMIT = 20;

export const connectToDB = async () => {
  try {
    await client.connect();
    mainDb = client.db("main");
    colorsCol = mainDb.collection("colors");
    itemsCol = mainDb.collection("items");
    usersCol = mainDb.collection("user");
    textsCol = mainDb.collection("texts");
    headerSubtextsCol = mainDb.collection("headerSubtexts");
    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.log(err);
  }
};

export const cleanupDB = async () => {
  console.log("Closing client");
  await client.close();
  console.log("Closed client");
};

export const seedDB = async () => {
  const { colors }: { colors: string[] } = require("../data/luckyColor.json");
  const { items }: { items: string[] } = require("../data/luckyItem.json");
  const {
    texts,
  }: {
    texts: Array<{
      name: string;
      texts: string[];
    }>;
  } = require("../data/unseiText.json");
  const {
    subtexts,
  }: { subtexts: string[] } = require("../data/headerSubtext.json");

  console.log("Starting Seeding...");

  const collectionName = (await mainDb.listCollections().toArray()).map(
    ({ name }) => name
  );

  const colorsExists = collectionName.indexOf("colors") !== -1;
  const itemsExists = collectionName.indexOf("items") !== -1;
  const textsExists = collectionName.indexOf("texts") !== -1;
  const headerSubtextsExists = collectionName.indexOf("headerSubtexts") !== -1;

  await Promise.all([
    colorsExists && colorsCol.drop(),
    itemsExists && itemsCol.drop(),
    textsExists && textsCol.drop(),
    headerSubtextsExists && headerSubtextsCol.drop(),
  ]);

  const colorsDocs = colors.map((color) => ({ color }));
  const itemsDocs = items.map((item) => ({ item }));
  const subtextDocs = subtexts.map((subtext) => ({ subtext }));

  await Promise.all([
    colorsCol.insertMany(colorsDocs),
    itemsCol.insertMany(itemsDocs),
    textsCol.insertMany(texts),
    headerSubtextsCol.insertMany(subtextDocs),
  ]);

  console.log("Finished Seeding!");
};

export const getRandomSubtext = async () => {
  try {
    return (
      await headerSubtextsCol.aggregate([{ $sample: { size: 1 } }]).next()
    ).subtext;
  } catch (err) {
    throw "Couldn't get subtext!";
  }
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

export const updateUserDrawDateAndCoins = async (
  user_id: string,
  coins: number
) => {
  try {
    const res = await usersCol.findOneAndUpdate(
      { userId: user_id },
      {
        $inc: { coins },
        $set: { last_draw: dayjs().toString() },
      },
      { upsert: true }
    );
  } catch (err) {
    console.log(err);
    throw "Error: (updateUserDrawDate)";
  }
};

export const updateUserDrawDate = async (user_id: string) => {
  try {
    const res = await usersCol.findOneAndUpdate(
      { userId: user_id },
      { $set: { last_draw: dayjs().toString() }, $setOnInsert: { coins: 0 } },
      { upsert: true }
    );
  } catch (err) {
    throw "Error: (updateUserDrawDate)";
  }
};

export const updateUserCoins = async (user_id: string, coins: number) => {
  try {
    const res = await usersCol.findOneAndUpdate(
      { userId: user_id },
      { $inc: { coins } },
      { upsert: true }
    );
  } catch (err) {
    console.log(err);
    throw "Error: (updateUserCoins)";
  }
};

export const getUser = async (user_id: string) => {
  try {
    return await usersCol.findOne({ userId: user_id });
  } catch (err) {
    console.log(err);
    throw "Error: (updateUserCoins)";
  }
};

interface IMikujiTexts {
  ganbou: string;
  rennai: string;
  gakumon: string;
  shobai: string;
  byoki: string;
}

export const getRandomTexts = async (): Promise<IMikujiTexts> => {
  try {
    const { texts: rennaiTexts } = await textsCol.findOne({
      name: "rennai",
    });
    const { texts: ganbouTexts } = await textsCol.findOne({
      name: "ganbou",
    });
    const { texts: gakumonTexts } = await textsCol.findOne({
      name: "gakumon",
    });
    const { texts: shobaiTexts } = await textsCol.findOne({
      name: "shobai",
    });
    const { texts: byokiTexts } = await textsCol.findOne({
      name: "byoki",
    });

    return {
      ganbou: getRandomElementFromArray(ganbouTexts),
      rennai: getRandomElementFromArray(rennaiTexts),
      gakumon: getRandomElementFromArray(gakumonTexts),
      shobai: getRandomElementFromArray(shobaiTexts),
      byoki: getRandomElementFromArray(byokiTexts),
    };
  } catch (err) {
    console.log(err);
    throw "Error: (getRandomTexts)";
  }
};
