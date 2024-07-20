
export const abstract = Symbol("abstract");

export const once = (def) => {
    const map = new WeakMap();
    return (key) => {
        let val = map.get(key);
        if (!val && !map.has(key))
            map.set(key, val = def(key));
        return val;
    };
};

export const chain = (...args) => {
    const len = args.length;
    let val = args[len - 1];
    for (let k = len - 2; k >= 0; k--)
        val = args[k](val);
    return val;
};

class DelayLiteral {
    constructor(type, ...args) {
        this.type = type;
        this.args = args;
    }

    toString() {
        return String.raw(...this.args);
    }
}

export const html   = (strings, ...args) => new DelayLiteral("html", {raw: strings}, ...args);
export const css    = (strings, ...args) => new DelayLiteral("css", {raw: strings}, ...args);

export const cssDisplayBlock        = css`:host { display: block; }`;
export const cssDisplayInline       = css`:host { display: inline; }`;
export const cssDisplayInlineBlock  = css`:host { display: inline-block; }`;
export const cssDisplayNone         = css`:host { display: none; }`;
export const cssDisplayContents     = css`:host { display: contents; }`;

export const htmlCache = once(src => {
    if (src instanceof HTMLTemplateElement)
        return src;

    if (src.type !== "html")
        throw Error("invalid html type");

    const template = document.createElement("template");
    template.innerHTML = src;
    return template;
});

export const cssCache = once(src => {
    if (src instanceof CSSStyleSheet)
        return src;

    if (src.type !== "css")
        throw Error("invalid css type");

    const css = new CSSStyleSheet();
    css.replaceSync(src);
    return css;
});

export const htmlFragment = (src) => document.importNode(htmlCache(src).content, true);
