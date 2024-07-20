
import {once, abstract} from "./utils.mjs";

export const anonymousBase = Symbol("anonymousBase");

export const Anonymous = once(Base => class _Anonymous extends Base {
    static [abstract];
    static [anonymousBase] = "anonymous-element";

    constructor(...args) {
        _Anonymous.#define(new.target);
        super(...args);
    }

    static toString() {
        return _Anonymous.#define(this);
    }

    static #define(Target) {
        if (Object.hasOwn(Target, abstract))
            return "anonymous-element---what-are-you-doing";

        let name = customElements.getName(Target);
        if (name)
            return name;

        let suffix = "---";
        for (;;) {
            do {
                suffix += Math.floor(Math.random() * 36).toString(36);
            } while (suffix.length < 6);

            name = Target[anonymousBase] + suffix;
            if (customElements.get(name))
                continue;

            customElements.define(name, Target);
            return name;
        }

        return defineRandom(Target[anonymousBase], Target);
    }
});
