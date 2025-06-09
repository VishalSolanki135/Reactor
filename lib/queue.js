import { schedule as _schedule } from "node-cron";

class QueueManager {
  constructor(config, redis, taskRegistry) {
    this.config = config;
    this.redis = redis;
    this.taskRegistry = taskRegistry;
  }

  async enqueue(taskKey, metadata) {
    setTimeout(async () => {
      const raw = await this.redis.get(taskKey);
      if (!raw) return;

      const data = JSON.parse(raw);
      const { taskName, payload, attemptsLeft, delay, strategy, fallback } = data;

      const handler = this.taskRegistry.get(taskName);

      try {
        await handler(payload);
        await this.redis.del(taskKey);
      } catch (err) {
        if (attemptsLeft > 1) {
          const nextDelay = strategy === "exponential" ? delay * 2 : delay;
          const updated = {
            ...data,
            attemptsLeft: attemptsLeft - 1,
            delay: nextDelay
          };
          await this.redis.set(taskKey, JSON.stringify(updated));
          this.enqueue(taskKey, updated);
        } else if (fallback) {
          const fallbackHandler = this.taskRegistry.get(fallback);
          if (fallbackHandler) await fallbackHandler(payload);
          await this.redis.del(taskKey);
        }
      }
    }, metadata.delay);
  }

  schedule(taskName, { cron: cronExpr }) {
    _schedule(cronExpr, async () => {
      const handler = this.taskRegistry.get(taskName);
      if (handler) await handler();
    });
  }

  expressUI() {
    return (req, res) => res.send("UI Coming Soon!");
  }
}

export default QueueManager;
