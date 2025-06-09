import TaskRegistry from "./lib/registry";
import RetryManager from "./lib/retryManager";
import QueueManager from "./lib/queue";
import Redis from "ioredis";

function createReactor(config) {
  const redis = new Redis(config.redisUrl || "redis://localhost:6379");
  const taskRegistry = new TaskRegistry();
  const queueManager = new QueueManager(config, redis, taskRegistry);
  const retryManager = new RetryManager(taskRegistry, queueManager, redis, config);

  return {
    define: (taskName, handler) => taskRegistry.register(taskName, handler),
    run: (taskName, options) => retryManager.run(taskName, options),
    schedule: (taskName, cronOptions) => queueManager.schedule(taskName, cronOptions),
    ui: () => queueManager.expressUI()
  };
}

export default { createReactor };
