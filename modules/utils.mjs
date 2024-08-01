
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
        this.result = null;
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

const htmlCacheInternal = (src) => {
    if (src.type !== "html")
        throw Error("invalid html type");

    if (!src.result)
        src.result = document.createElement("template"), src.result.innerHTML = src;

    return src.result;
};

const cssCacheInternal = (src) => {
    if (src.type !== "css")
        throw Error("invalid css type");

    if (!src.result)
        src.result = new CSSStyleSheet, src.result.replaceSync(src);

    return src.result;
};

export const htmlCache = (src) => src instanceof HTMLTemplateElement ? src : htmlCacheInternal(src);
export const cssCache = (src) => src instanceof CSSStyleSheet ? src : cssCacheInternal(src);
export const htmlFragment = (src) => document.importNode(htmlCache(src).content, true);

let globalCSS = null;

export function getGlobalCSS() {
    return globalCSS ?? updateGlobalCSS();
}

export function updateGlobalCSS() {
    if (!globalCSS)
        globalCSS = new CSSStyleSheet();

    const rules = [];
    const css = document.styleSheets;

    for (let k = 0, len = css.length; k < len; k++) {
        try {
            if (!css[k].ownerNode?.hasAttribute("data-wc-global-css"))
                continue;

            const nested = [];
            cssAppendRules(css[k], nested);
            let str = nested.join("\n");

            if(css[k].ownerNode.media)
                str = `@media ${css[k].ownerNode.media} {\n${str}\n}`;

            rules.push(str);
        } catch (e) {
            console.error(e);
        }
    }

    globalCSS.replaceSync(rules.join("\n"));
    return globalCSS;
}

function cssAppendRules(css, rules) {
    if (!css?.cssRules)
        return;

    for (const rule of css.cssRules) {
        if (!(rule instanceof CSSImportRule)) {
            rules.push(rule.cssText);
            continue;
        }

        const nested = [];
        cssAppendRules(rule.styleSheet, nested);
        let str = nested.join("\n");

        if (rule.media.mediaText)
            str = `@media ${rule.media.mediaText} {\n${str}\n}`;

        if (rule.layerName != null)
            str = `@layer ${rule.layerName} {\n${str}\n}`;

        rules.push(str);
    }
}
