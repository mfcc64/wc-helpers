
import {once, abstract} from "./utils.mjs";

export class State {
    constructor(value, name) {
        this.value = value;
        this.name = name ?? "";
    }

    set(value) {
        const listeners = this.#listeners;
        const old = this.value;
        this.value = value;
        for (let k = 0, len = listeners.length; k < len; k++)
            listeners[k].call(this, value, old);
    }

    cset(value) {
        return (value !== this.value) ? (this.set(value), true) : false;
    }

    listen(func) {
        this.#listeners.push(func);
        func.call(this, this.value);
    }

    listenNoInit(func) {
        this.#listeners.push(func);
    }

    unlisten(func) {
        this.#listeners = this.#listeners.filter(v => func !== v);
    }

    unlistenAll() {
        this.#listeners = [];
    }

    static listen(...args) {
        const len = args.length - 1;
        const func = args[len];
        args[0].listen(func);
        for (let k = 1; k < len; k++)
            args[k].listenNoInit(func);
    }

    static listenNoInit(...args) {
        const len = args.length - 1;
        const func = args[len];
        for (let k = 0; k < len; k++)
            args[k].listenNoInit(func);
    }

    static listenInitAll(...args) {
        const len = args.length - 1;
        const func = args[len];
        for (let k = 0; k < len; k++)
            args[k].listen(func);
    }

    static unlisten(func, ...args) {
        for (let k = 0; k < args.length; k++)
            args[k].unlisten(func);
    }

    static unlistenAll(...args) {
        for (let k = 0; k < args.length; k++)
            args[k].unlistenAll();
    }

    #listeners = [];
}

export const attributeState = Symbol.for("wc-helpers/attribute-state");

export const Attribute = once(Base => class _Attribute extends Base {
    static [abstract];

    [attributeState] = Object.create(null);

    constructor(...args) {
        super(...args);
        for (const name of new.target.observedAttributes || []) {
            const state = this[attributeState][name] = new State(null, name);
        }
    }

    attributeChangedCallback(name, old, value) {
        const state = this[attributeState][name];
        if (state.value !== old)
            console.warn(`mismatched old value of '${name}' on attributeChangedCallback`);
        state.set(value);
    }
});
