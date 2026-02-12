export function performanceTracker() {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    const originalMethod = desc.value;

    desc.value = async function (...args: unknown[]) {
      const start = process.hrtime.bigint();
      try {
        const result = await originalMethod.apply(this, args);
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        console.log(
          `\n"PERFORMANCE": ${key} executed in ${durationMs.toFixed(2)}ms\n`,
        );
        return result;
      } catch (err) {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        console.log(
          `\n"PERFORMANCE" "ERROR": ${key} failed in ${durationMs.toFixed(2)}ms\n`,
        );
        throw err;
      }
    };
    return desc;
  };
}
