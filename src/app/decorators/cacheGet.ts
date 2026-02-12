import { redisClient } from "../../entry/redis.js";

export function cacheGet(ttl: number) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    const originalMethod = desc.value;
    desc.value = async function (...args: unknown[]) {
      const cacheKey = `${key}:${JSON.stringify(args)}`;

      const cached = await redisClient.get(cacheKey);

      if (cached) {
        console.log(`\n"CACHE HIT" ${cacheKey}\n`);
        return JSON.parse(cached);
      }

      console.log(`\n"CACHE MISS" ${cacheKey}\n`);

      const result = await originalMethod.apply(this, args);

      if (result) {
        await redisClient.set(cacheKey, JSON.stringify(result), {
          expiration: {
            type: "EX",
            value: ttl,
          },
        });
      }

      return result;
    };

    return desc;
  };
}
