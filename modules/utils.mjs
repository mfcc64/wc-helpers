
export const abstract = Symbol.for("wc-helpers/abstract");

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

const htmlInternalTag = Symbol.for("wc-helpers/html-tag");
let setHTMLInternal;
if (globalThis.trustedTypes) {
    const policy = trustedTypes.createPolicy("wc-helpers", { createHTML: s => s });
    setHTMLInternal = str => { const r = policy.createHTML(str); r[htmlInternalTag] = true; return r; };
} else {
    setHTMLInternal = str => ({str, toString(){ return this.str; }, [htmlInternalTag]: true });
}

const htmlRegexpInternal = /[&<=>'"]/g;
const htmlReplaceInternal = t => `&#${t.charCodeAt(0)};`;
export const html = (strings, ...args) => {
    for (let k = 0, len = args.length; k < len; k++) {
        if (args[k]?.[htmlInternalTag])
            continue;

        if (args[k] instanceof Array)
            args[k] = args[k].map(v => v?.[htmlInternalTag] ? v : String(v).replace(htmlRegexpInternal, htmlReplaceInternal)).join("");
        else
            args[k] = String(args[k]).replace(htmlRegexpInternal, htmlReplaceInternal);
    }
    return setHTMLInternal(String.raw({raw: strings}, ...args));
};
export const htmlUnsafeString = (str) => setHTMLInternal(String(str));

const cssInternalTag = Symbol.for("wc-helpers/css-tag");
class CSSLiteralInternal {
    constructor(str) { this.str = str; }
    toString() { return this.str; }
    [cssInternalTag] = true;
}

export const css = (strings, ...args) => new CSSLiteralInternal(String.raw({raw: strings}, ...args));

export const cssDisplayBlock        = css`:host { display: block; }`;
export const cssDisplayInline       = css`:host { display: inline; }`;
export const cssDisplayInlineBlock  = css`:host { display: inline-block; }`;
export const cssDisplayNone         = css`:host { display: none; }`;
export const cssDisplayContents     = css`:host { display: contents; }`;

const htmlCacheInternal = once((src) => {
    if (!src[htmlInternalTag])
        throw Error("invalid html type");

    const dst = document.createElement("template");
    dst.innerHTML = src;
    return dst;
});

const cssCacheInternal = once((src) => {
    if (!src[cssInternalTag])
        throw Error("invalid css type");

    const dst = new CSSStyleSheet;
    dst.replaceSync(src);
    return dst;
});

export const htmlCache = (src) => src instanceof HTMLTemplateElement ? src : htmlCacheInternal(src);
export const cssCache = (src) => src instanceof CSSStyleSheet ? src : cssCacheInternal(src);
export const htmlFragment = (src) => document.importNode(htmlCache(src).content, true);

const globalCSS = Symbol.for("wc-helpers/global-css");

export function getGlobalCSS() {
    return globalThis[globalCSS] ?? updateGlobalCSS();
}

export function updateGlobalCSS() {
    if (!globalThis[globalCSS])
        globalThis[globalCSS] = new CSSStyleSheet();

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

    globalThis[globalCSS].replaceSync(rules.join("\n"));
    return globalThis[globalCSS];
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
