import { Redis } from "ioredis";

import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

redis.on("connect", async () => {
  try {
    await redis.ping();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Redis connection error:", error);
  }
});

export default redis;
