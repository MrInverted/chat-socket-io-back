import express from "express";
import cors from "cors";
import { createServer } from "http";

import { sequelize } from "./database.js";
import { router } from "./express-router.js";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173" }));
app.use(router);

sequelize.sync({ alter: true })
  .then(() => httpServer.listen(3000))
  .then(() => console.log('Connection has been established successfully.'))
  .catch((error) => console.error('Unable to connect to the database:', error));

export { httpServer }