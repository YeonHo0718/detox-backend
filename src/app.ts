import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import apiList from "./routes/apiList";
import gpt from "./routes/gpt";

const app = express();

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const publicPath: string = path.join(__dirname, "../../src/public");
console.log(publicPath);
const publicFilePath: string = path.join(__dirname, "../../files");

app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));
app.use("/file", express.static(publicFilePath));

/*****************************************************************/

// API 목록
app.use("/api", apiList);

// GPT
app.use("/api/gpt", gpt);

/*****************************************************************/

app.listen(PORT, function () {
  console.log("Express server has started on port " + PORT);
});
