import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import guestRoutes from "./routes/guest.routes";
import galleryRoutes from "./routes/gallery.routes";
import authRoutes from "./routes/auth.routes";
import { generalLimiter } from "./middleware/rate-limit.middleware";

const app = express();

// Seguridad: Headers HTTP seguros
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permitir Cloudinary
}));

// Seguridad: CORS configurado solo para tu dominio
const allowedOrigins = [
  "https://www.bodapocasangreportillo.com",
  "https://bodapocasangreportillo.com",
  "http://localhost:5173", // Vite dev
  "http://localhost:3000", // Next/React dev
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(bodyParser.json());

// Seguridad: Rate limiting general
app.use(generalLimiter);

app.use("/admin", authRoutes);
app.use("/guests", guestRoutes);
app.use("/gallery", galleryRoutes);

export default app;
