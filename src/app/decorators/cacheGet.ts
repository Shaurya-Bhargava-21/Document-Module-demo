import { redisClient } from "../../entry/redis.js";

export function cacheGet(ttl: number) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    const originalMethod = desc.value;
    desc.value = async function (...args: unknown[]) {
      const cacheKey = `${target.constructor.name}:${key}:${JSON.stringify(args)}`;

      // The redisClient.get is wrapped in try/catch — if Redis is down, it logs the error and falls through to the real method instead of crashing the request
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`\n"CACHE HIT" ${cacheKey}\n`);
          return JSON.parse(cached);
        }
      } catch (err) {
        console.error(`\nCache read failed for ${cacheKey}:`, err, "\n");
      }

      console.log(`\n"CACHE MISS" ${cacheKey}\n`);

      const result = await originalMethod.apply(this, args);

      //The redisClient.set is wrapped in try/catch — if writing to cache fails, it logs but still returns the result to the user
      if (result) {
        try {
          await redisClient.set(cacheKey, JSON.stringify(result), {
            expiration: {
              type: "EX",
              value: ttl,
            },
          });
        } catch (err) {
          console.error(`\nCache write failed for ${cacheKey}:`, err, "\n");
        }
      }

      return result;
    };

    return desc;
  };
}
