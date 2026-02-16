import { redisClient } from "../../entry/redis.js";

export function cachePurge(prefixes: string[]) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    const originalMethod = desc.value;
    desc.value = async function (...args: unknown[]) {
      const result = await originalMethod.apply(this, args);

      for (const prefix of prefixes) {
        let cursor = "0";
        try {
          do {
            const reply = await redisClient.scan(cursor, {
              MATCH: `${target.constructor.name}:${prefix}:*`,
              COUNT: 100,
            });
            cursor = reply.cursor;
            const keys = reply.keys;
  
            if (keys.length > 0) {
              await redisClient.del(keys);
            }
          } while (cursor !== "0");
        } catch (err) {
          console.error(`\nCache purge failed for prefix ${prefix}:`,err,"\n");
        }
      }

      return result;
    };
    return desc;
  };
}
