import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


app.use(cors());

app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    message: "CRUD API is running",
  });
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/products",
  productRoutes
);


app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
