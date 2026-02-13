import { redisClient } from "../../entry/redis.js";

export function cachePurge(prefixes: string[]) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    const originalMethod = desc.value;
    desc.value = async function (...args: unknown[]) {
      const result = await originalMethod.apply(this, args);

      for (const prefix of prefixes) {
        let cursor = "0";
        do {
          const reply = await redisClient.scan(cursor, {
            MATCH: `${prefix}:*`,
            COUNT: 100,
          });
          cursor = reply.cursor;
          const keys = reply.keys;

          if (keys.length > 0) {
            await redisClient.del(keys);
          }
        } while (cursor !== "0");
      }

      return result;
    };
    return desc;
  };
}
