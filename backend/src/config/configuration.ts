import { registerAs } from "@nestjs/config";
import * as Joi from "joi";

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  BCRYPT_ROUNDS: Joi.number().default(10),
});

type JwtExpiresIn = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;

export default registerAs("config", () => {
  if (process.env.NODE_ENV === "production" && process.env.DB_SYNCHRONIZE === "true") {
    throw new Error("DB_SYNCHRONIZE no puede ser true en producción");
  }
  return {
    app: {
      env: process.env.NODE_ENV || "development",
      port: parseInt(process.env.PORT || "3000", 10),
      prefix: process.env.API_PREFIX || "api",
    },
    jwt: {
      secret: (() => {
        const s = process.env.JWT_SECRET;
        if (!s || s.length < 32) throw new Error("JWT_SECRET debe tener al menos 32 chars");
        return s;
      })(),
      expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as JwtExpiresIn,
      refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as JwtExpiresIn,
    },
    bcrypt: { rounds: parseInt(process.env.BCRYPT_ROUNDS || "10", 10) },
    cache: {
      ttl: parseInt(process.env.CACHE_TTL || "120", 10),
      max: parseInt(process.env.CACHE_MAX || "1000", 10),
      authTtl: parseInt(process.env.CACHE_AUTH_TTL || "15", 10),
    },
    database: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432", 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: process.env.DB_SYNCHRONIZE,
      logging: process.env.DB_LOGGING === "true",
      autoLoadEntities: true,
      migrationsRun: false,
    },
  };
});