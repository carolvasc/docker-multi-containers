const keys = require("./keys");
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

const sub = redisClient.duplicate();

redisClient.on("error", (err) => {
	console.error("Redis client error:", err);
});
sub.on("error", (err) => {
	console.error("Redis subscriber error:", err);
});

(async () => {
	await redisClient.connect();
	await sub.connect();
})();

function fib(index) {
	if (index < 2) return 1;
	return fib(index - 1) + fib(index - 2);
}

sub.subscribe("insert", (message) => {
	redisClient.hSet("values", message, fib(parseInt(message)));
});
