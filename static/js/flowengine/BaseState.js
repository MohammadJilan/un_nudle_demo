export default class BaseState {
    /** @param {string} name - unique state name */
    constructor(name) { this.name = name; }

    /** Called when the engine ENTERS this state */
    async enter(engine, payload) {
        // Override in subclasses. Do lightweight setup here.
        // Example: prefill forms from engine.context, start timers, fetch data, etc.
    }

    /** Called when the engine EXITS this state */
    async exit(engine, payload) {
        // Override in subclasses. Cleanup timers, detach listeners, save draft, etc.
    }

    /** Handle events dispatched while this state is active */
    async onEvent(engine, event, payload) {
        // Override in subclasses. Decide transitions based on event+payload.
        // You can read/write shared data via engine.context.
        // Example default: ignore unknown events.
    }
}