require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
const authRouter = require('./routes/auth');
const fileRoutes = require("./routes/file");
// Routes
app.use("/api/v1", authRouter,fileRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT, () => console.log("Server running on port 3000"));
});
