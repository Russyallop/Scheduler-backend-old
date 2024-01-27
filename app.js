require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require('path');
const { multerError, urlNotFound } = require("./routes/middlewares/errorHandler");

const app = express();
const connectDB = require("./config/database");

const API_BASE_NAME = "/api";
const port = process.env.PORT | 5000;
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.static(path.join(__dirname, "public")));
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

app.use((req, res, next) => {
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
  bodyParser.json({ limit: "50mb", "Content-Type": "application/json" })(req, res, next) 
});

// role routes
app.use(`${API_BASE_NAME}/role`, require("./routes/role"));
// user routes
app.use(`${API_BASE_NAME}/user`, require("./routes/user"));

app.use(multerError);
app.use(urlNotFound);

if (cluster.isMaster) {
  console.log(`Number of CPUs: ${totalCPUs} Master Cluster having ProcessId ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    console.log("Fork new child worker!");
    cluster.fork();
  });
} else {
  connectDB();  // Database connection
  app.listen(port, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on http://localhost:${port}`);
  });
}