const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const YAML = require("yaml");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const file = fs.readFileSync(path.resolve("./swagger.yaml"), "utf8");
const swaggerDocument = YAML.parse(file);
const firebase = require("firebase-admin");
const serviceAccount = require("../firebaseConfig.json");
const socketModule = require("./socket");
const http = require("http");
const app = express();
const server = http.createServer(app);

socketModule.initialize(server);

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

dotenv.config();

const port = process.env.PORT || 3001;

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }))

app.use(cookieParser());

routes(app);

mongoose.set("strictQuery", true);
console.log('env', process.env.MONGO_DB);
mongoose
  .connect(`${process.env.MONGO_DB}`)
  .then(() => {
    console.log("Connect Db success!");
  })
  .catch((err) => {
    console.log('connect error', err);
  });

server.listen(port, () => {
  console.log("Server is running in port: ", +port);
});
