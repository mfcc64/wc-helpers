
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

const TrustedHTML = globalThis.TrustedHTML || class {
    constructor(str) { this.str = str; }
    toString() { return this.str; }
};

let setHTMLInternal;
if (globalThis.trustedTypes) {
    const policy = trustedTypes.createPolicy("wc-helpers", { createHTML: s => s });
    setHTMLInternal = str => policy.createHTML(str);
} else {
    setHTMLInternal = str => new TrustedHTML(str);
}

const htmlRegexpInternal = /[&<=>'"]/g;
const htmlReplaceInternal = t => `&#${t.charCodeAt(0)};`;
export const html = (strings, ...args) => {
    for (let k = 0, len = args.length; k < len; k++) {
        if (args[k] instanceof TrustedHTML)
            continue;

        if (args[k] instanceof Array)
            args[k] = args[k].map(v => v instanceof TrustedHTML ? v : String(v).replace(htmlRegexpInternal, htmlReplaceInternal)).join("");
        else
            args[k] = String(args[k]).replace(htmlRegexpInternal, htmlReplaceInternal);
    }
    return setHTMLInternal(String.raw({raw: strings}, ...args));
};
export const htmlUnsafeString = (str) => setHTMLInternal(String(str));

class CSSLiteralInternal {
    constructor(str) { this.str = str; }
    toString() { return this.str; }
}

export const css = (strings, ...args) => new CSSLiteralInternal(String.raw({raw: strings}, ...args));

export const cssDisplayBlock        = css`:host { display: block; }`;
export const cssDisplayInline       = css`:host { display: inline; }`;
export const cssDisplayInlineBlock  = css`:host { display: inline-block; }`;
export const cssDisplayNone         = css`:host { display: none; }`;
export const cssDisplayContents     = css`:host { display: contents; }`;

const htmlCacheInternal = once((src) => {
    if (!(src instanceof TrustedHTML))
        throw Error("invalid html type");

    const dst = document.createElement("template");
    dst.innerHTML = src;
    return dst;
});

const cssCacheInternal = once((src) => {
    if (!(src instanceof CSSLiteralInternal))
        throw Error("invalid css type");

    const dst = new CSSStyleSheet;
    dst.replaceSync(src);
    return dst;
});

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
