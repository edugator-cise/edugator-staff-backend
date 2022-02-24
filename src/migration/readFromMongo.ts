// import * as dotenv from "dotenv";
// import * as mongoDB from "mongodb";

// export const collections: {modules?: mongoDB.Collection} = {}

// export async function connectToDatabase () {
//     dotenv.config();

//     const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING);

//     await client.connect();

//     const db: mongoDB.Db = client.db(process.env.DB_NAME);

//     const modulesCollection: mongoDB.Collection = db.collection(process.env.GAMES_COLLECTION_NAME);

//     collections.games = gamesCollection;

//     console.log(`Successfully connected to database: ${db.databaseName} and collection: ${gamesCollection.collectionName}`);
//  }
import {
  Module,
  ModuleDocument,
  ModuleInterface
} from '../api/models/module.model';

const getModuleData = async (): Promise<void> => {
  let modules: ModuleInterface[];
  modules = await Module.find().select('-problems').sort({ number: 1 });
  for (const module of modules) {
    console.log(module.name);
  }
};
