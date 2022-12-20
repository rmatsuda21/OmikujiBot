import { connectToDB, seedDB } from "./utils/mongodb";

const seed = async () => {
  await connectToDB();

  await seedDB();
  console.log("Finished Seeding!");
};

console.log("Starting Seeding!");
seed();
