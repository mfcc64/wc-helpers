
import {once, abstract, html, htmlFragment, cssCache} from "./utils.mjs";

export const shadowOptions  = Symbol("shadowOptions");
export const shadowHTML     = Symbol("shadowHTML");
export const shadowCSS      = Symbol("shadowCSS");
export const shadowElements = Symbol("shadowElements");
export const shadowRoot     = Symbol("shadowRoot");

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
