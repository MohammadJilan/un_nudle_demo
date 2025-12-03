class Emitter {
    constructor() { this.listeners = new Map(); }
    on(name, fn) {
        if (!this.listeners.has(name)) this.listeners.set(name, new Set());
        this.listeners.get(name).add(fn);
        return () => this.off(name, fn); // unsubscribe helper
    }
    off(name, fn) { this.listeners.get(name)?.delete(fn); }
    emit(name, payload) { this.listeners.get(name)?.forEach(fn => fn(payload)); }
}


export default class FlowEngine extends Emitter {
    /**
     * @param {Object} options
     * @param {BaseState[]} options.states - list of state instances
     * @param {string} options.initial - name of the initial state
     * @param {Object} [options.context] - shared data bag for all states
     */
    constructor({ states, initial, context = {} }) {
        super();
        // Build a map: name -> state
        this.states = new Map(states.map(s => [s.name, s]));
        if (!this.states.has(initial)) {
            throw new Error(`Initial state "${initial}" not found.`);
        }
        this.initial = initial;
        this.current = null; // will hold the active state instance
        this.context = context; // shared bag for any state data
        this._transitioning = false; // guard to prevent reentrant transitions
    }

    /** Start the flow, moving to the initial state */
    async start(payload) {
        return this.goTo(this.initial, payload);
    }

    /** Force a transition to a target state by name */
    async goTo(targetStateName, payload) {
        if (!this.states.has(targetStateName)) {
            this.emit('error', { message: `State "${targetStateName}" does not exist.` });
            throw new Error(`State "${targetStateName}" does not exist.`);
        }
        if (this._transitioning) return; // prevent overlap
        this._transitioning = true;

        const prev = this.current;
        try {
            if (prev) {
                await prev.exit(this, payload);
            }
            this.current = this.states.get(targetStateName);
            this.emit('transition', { from: prev?.name ?? null, to: this.current.name, payload });
            await this.current.enter(this, payload);
        } catch (err) {
            this.emit('error', { error: err, at: 'goTo', from: prev?.name ?? null, to: targetStateName });
            throw err;
        } finally {
            this._transitioning = false;
        }
    }

    /** Dispatch an event to the active state */
    async dispatch(event, payload) {
        if (!this.current) {
            this.emit('error', { message: 'No active state. Did you call engine.start()?' });
            throw new Error('No active state. Did you call engine.start()?');
        }
        this.emit('event', { state: this.current.name, event, payload });
        try {
            await this.current.onEvent(this, event, payload);
        } catch (err) {
            this.emit('error', { error: err, at: 'dispatch', state: this.current.name, event });
            throw err;
        }
    }

    /** Reset flow back to the initial state (optionally wiping context) */
    async reset({ wipeContext = false } = {}) {
        if (wipeContext) this.context = {};
        await this.goTo(this.initial);
    }
}