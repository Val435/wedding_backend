import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import guestRoutes from "./routes/guest.routes";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/guests", guestRoutes);

export default app;
