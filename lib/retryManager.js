/** IT IS LIKE A COORDINATOR --> PLANS HOW A TASK SHOULD BE ATTEMPTED, RETRIED, OR HANDLED IF IT FAILS */

class RetryManager {
    constructor(taskRegistry, queueManager, redis, config) {
        this.taskRegistry = taskRegistry;
        this.queueManager = queueManager;
        this.redis = redis;
        this.config = config;
    }

    async run(taskName, options) {
        const task = this.taskRegistry.get(taskName);
        if(!task) throw new Error(`Task ${taskName} not found`);

        const {
            payload = {},
            retry: {
                attempts = 1,
                delay = 1000,
                strategy = 'fixed',
                fallback = null
            } = {}
        } = options;

        const taskKey = `reactor:task:${taskName}:${Date.now()}`;

        const metadata = {
            taskName,
            payload,
            attemptsLeft: attempts,
            delay,
            strategy,
            fallback
        };

        await this.redis.set(taskKey, JSON.stringify(metadata));
        this.queueManager.enqueue(taskKey, metadata);
    }
}

export default RetryManager;