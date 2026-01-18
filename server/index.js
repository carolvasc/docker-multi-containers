const keys = require("./keys");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});

const redis = require("redis");
const redisHost = keys.redisHost || "127.0.0.1";
const redisPort = Number(keys.redisPort) || 6379;

const redisClient = redis.createClient({
  socket: {
    host: redisHost,
    port: redisPort,
    reconnectStrategy: () => 1000,
  },
});
const redisPublisher = redisClient.duplicate();

(async () => {
  await redisClient.connect();
  await redisPublisher.connect();
})();

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});
redisPublisher.on("error", (err) => {
  console.error("Redis publisher error:", err);
});


app.get("/", (req, res) => {
  res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");

  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  const values = await redisClient.hGetAll("values");
  res.send(values);
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }

  await redisClient.hSet("values", index, "Nothing yet!");
  await redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

const port = process.env.PORT || 5000;

app.listen(port, (err) => {
  console.log(`Listening on port ${port}`);
});
