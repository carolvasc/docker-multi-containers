const keys = require("./keys");
const redis = require("redis");

const redisHost = keys.redisHost || "127.0.0.1";
const redisPort = Number(keys.redisPort) || 6379;

const redisConfig = {
	socket: {
		reconnectStrategy: () => 1000,
	},
};

if (keys.redisUrl) {
	redisConfig.url = keys.redisUrl;
} else {
	redisConfig.socket.host = redisHost;
	redisConfig.socket.port = redisPort;
	if (keys.redisPassword) {
		redisConfig.password = keys.redisPassword;
	}
}

const redisClient = redis.createClient(redisConfig);

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
