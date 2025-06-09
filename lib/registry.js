/** It is like a taskbook where all the tasks are written along with the logic to handle it. */

class TaskRegistry {
    constructor() {
        this.tasks = new Map();
    }

    register(name, handler) {
        this.tasks.set(name, handler);
    }

    get(name) {
        return this.tasks.get(name);
    }
}

export default TaskRegistry;