# Reactor ⚡ – Resilient Task Orchestrator for Node.js

### Simple auto-retry & fallback task runner

const reactor = createReactor({ storage: 'redis' })

reactor.define('myTask', async ({ value }) => {
if (!value) throw new Error('Missing value')
})

await reactor.run('myTask', {
payload: { value: null },
retry: { attempts: 5, delay: 'exponential', fallback: 'alertFallback' },
})
