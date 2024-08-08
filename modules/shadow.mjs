
import {once, abstract, html, htmlFragment, cssCache} from "./utils.mjs";

export const shadowOptions  = Symbol.for("wc-helpers/shadow-options");
export const shadowHTML     = Symbol.for("wc-helpers/shadow-html");
export const shadowCSS      = Symbol.for("wc-helpers/shadow-css");
export const shadowElements = Symbol.for("wc-helpers/shadow-elements");
export const shadowRoot     = Symbol.for("wc-helpers/shadow-root");

export const Shadow = once(Base => class _Shadow extends Base {
    static [abstract];
    static [shadowHTML] = html``;
    static [shadowCSS] = [];

    constructor(...args) {
        super(...args);
        const shadow = this[shadowRoot] = this.attachShadow({ mode: "open", ...new.target[shadowOptions] });
        shadow.appendChild(htmlFragment(new.target[shadowHTML]));

        for (const css of new.target[shadowCSS])
            shadow.adoptedStyleSheets.push(cssCache(css));

        for (const elem of shadow.querySelectorAll('[id]'))
            this[shadowElements][elem.id] = elem;
    }

    [shadowElements] = Object.create(null);
});
