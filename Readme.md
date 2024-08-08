# `wc-helpers v2`

`wc-helpers v2` help you create your custom elements.

## Install

### NPM

```
npm i wc-helpers
```

```js
// example of named imports
import { WCHelpers, anonymousBase, html } from "wc-helpers";
// example of importing all
import * as _ from "wc-helpers";
```

### CDN

```js
// jsdlivr
import * as _ from "https://cdn.jsdelivr.net/npm/wc-helpers@2/wc-helpers.mjs";
// unpkg
import * as _ from "https://unpkg.com/wc-helpers@2/wc-helpers.mjs";
// relative CDN
import * as _ from "../wc-helpers@2/wc-helpers.mjs";
```

## API

### `Anonymous`

`Anonymous` mixin creates anonymous custom element that is registered automatically when constructed or
when `toString` method is called. It won't be anonymous if manual registration is called before
construction or `toString`.

#### `anonymousBase`

An optional static field symbol for `Anonymous` mixin as basename for anonymous name.

Example:

```js
import { Anonymous, anonymousBase } from "wc-helpers";
import { LitElement } from "lit";
import { html, unsafeStatic } from "lit/static-html.js";

class ElementA extends Anonymous(HTMLElement) { }
class ElementB extends Anonymous(LitElement) {
    render() {
        return html`<${unsafeStatic(ElementA)}></${unsafeStatic(ElementA)}>`;
    }
}
class ElementC extends Anonymous(HTMLElement) { }
customElements.define("element-c", ElementC);

class ElementD extends Anonymous(HTMLElement) {
    static [anonymousBase] = "element-a";
}

const b = new ElementB;
document.body.appendChild(b);
console.log(b);
console.log(new ElementC);
console.log(`${ElementD}`);
```

### `Shadow`

`Shadow` mixin creates automatic `shadowRoot`.

#### `shadowOptions`

An optional static field symbol for `Shadow` mixin as options for `attachShadow`.
Note that the default is `{ mode: "open" }`.

#### `shadowHTML`

An optional static field symbol for `Shadow` mixin as HTML template for `shadowRoot`.
It must be `html` literal or `HTMLTemplateElement` instance.

#### `shadowCSS`

An optional static field symbol for `Shadow` mixin as array of CSS stylesheet for `shadowRoot`.
It must be an array of `css` literal or `CSSStyleSheet` instance.

#### `shadowRoot`

A symbol for `Shadow` mixin instance to access `shadowRoot`. It is useful when `mode` is closed.

#### `shadowElements`

A symbol for `Shadow` mixin instance as object to access elements that have `id` attribute.

Example:

```js
import {
    Shadow, Anonymous, chain,
    shadowOptions, shadowHTML, shadowCSS,
    shadowRoot, shadowElements,
    html, css, cssDisplayContents
} from "wc-helpers";

class ElementA extends chain(Anonymous, Shadow, HTMLElement) {
    static [shadowOptions] = { mode: "closed" };
    static [shadowHTML] = html`<p id="paragraph"><span id="span">Hello</span> <span>World</span></p>`;
    static [shadowCSS] = [ cssDisplayContents, css`p { background-color: #ffff00; }` ];

    constructor() {
        super();
        console.log(this[shadowRoot]);
        console.log(this[shadowElements]);
    }
}

document.body.appendChild(new ElementA);
```

### `State`

A simple state management class.

#### `new State(initialValue, optionalName)`

Constuctor for `State` instance.

#### `State.value instance field`

Current value of `State` instance.

#### `State.name instance field`

Optional `name` for `State` instance.

#### `State.prototype.set(value)`

Set current value of state and call listeners.

#### `State.prototype.cset(value)`

Set current value of state. It doesn't call listeners when `value` equal to `oldValue`.
It returns `true` when listeners are called, otherwise `false`.

#### `State function listener(value, oldValue) callback`

Callback for `listen` method.

#### `State.prototype.listen(listener)`

Register `listener` to listen state change and call it for initialization.

#### `State.prototype.listenNoInit(listener)`

Register `listener` to listen state change but do not call it for initialization.

#### `State.prototype.unlisten(listener)`

Unregister `listener` from state instance.

#### `State.prototype.unlistenAll()`

Unregister all listeners from state instance.

#### `State.listen(state0, ... , stateN, listener)`

Register `listener` to listen state change of `state0, ... , stateN` and call it once for initialization.

#### `State.listenNoInit(state0, ... , stateN, listener)`

Register `listener` to listen state change of `state0, ... , stateN` but do not call it for initialization.

#### `State.listenInitAll(state0, ... , stateN, listener)`

Register `listener` to listen state change of `state0, ... , stateN` and call it for initialization
for every `state0, ... , stateN`.

#### `State.unlisten(listener, state0, ... , stateN)`

Unregister `listener` from `state0, ... , stateN`.

#### `State.unlistenAll(state0, ... , stateN)`

Unregister all listeners from `state0, ... , stateN`.

Example:

```js
import { State } from "wc-helpers";

const stateA = new State("hello");
const stateB = new State(10);
const stateC = new State(null, "stateC");

stateA.listen((value, oldValue) => console.log(value, oldValue));
stateB.listenNoInit(() => console.log(stateB.value));
stateC.listen(function(value) { console.log(this.name, this.value); });

State.listen(stateA, stateB, stateC, () => console.log(stateA.value, stateB.value, stateC.value));
State.listenInitAll(stateA, stateB, stateC, (value) => console.log(value));

stateA.set("world");
stateB.cset(10);
stateC.set("stateC");

State.unlistenAll(stateA, stateB, stateC);
```

### `Attribute`

`Attribute` mixin automatically creates `State` instances from
`observedAttributes` that can be listened.

#### `attributeState`

A symbol to access attribute `State` instances.

Example:

```js
import { State, Attribute, attributeState, Anonymous } from "wc-helpers";

class ElementA extends Anonymous(Attribute(HTMLElement)) {
    static observedAttributes = [ "data-src", "data-active", "data-message" ];

    constructor() {
        super();
        const at = this[attributeState];
        State.listen(...Object.values(at), function() { console.log(this.name, this.value); });
        at["data-src"].listen(src => console.log(src));
    }
}

const a = new ElementA;
a.setAttribute("data-src", "/home/");
a.setAttribute("data-active", "");
a.setAttribute("data-message", "Hello World");
a.removeAttribute("data-active"); // send null
```

### Utility

#### `abstract`

An optional static field symbol for `Anonymous` mixin to prevent registration.

```js
import { abstract, Anonymous } from "wc-helpers";

class ElementA extends Anonymous(HTMLElement) {
    static [abstract];
}

console.log(`${ElementA}`); // do not throw
new ElementA; // throw
```

#### `once`

Run function once when argument is equal. Only support single object parameter.

#### `chain`

Flatten mixin.

```js
import { chain, Anonymous, Attribute, Shadow } from "wc-helpers";

console.log(Anonymous(Attribute(Shadow(HTMLElement))) == chain(Anonymous, Attribute, Shadow, HTMLElement));
```

#### `html`

`html` tag wraps string literals into object. It escape `&<>'"=` characters from literals' arguments
unless that argument is also another `html` tag or result of `htmlUnsafeString` function. When an
argument is `Array`, its item will be evaluated according to the escape rules and they will be concancenated.

#### `htmlUnsafeString`
`htmlUnsafeString` allows string to be included in `html` tag argument without escaping.

#### `css`

`css` tag wraps string literals into object. No escaping performed.

#### `htmlCache`

Get `HTMLTemplateElement` instance from `html` tag.

#### `cssCache`

Get `CSSStyleSheet` instance from `css` tag.

#### `cssDisplayBlock`

#### `cssDisplayInline`

#### `cssDisplayInlineBlock`

#### `cssDisplayNone`

#### `cssDisplayContents`

Default `css` tag for `:host` element `display` set to `block`, `inline`,
`inline-block`, `none`, or `contents` respectively.

#### `htmlFragment`

Create `DocumentFragment` instance from `html` tag or `HTMLTemplateElement` instance.

Example:

```js
import * as _ from "wc-helpers";

class ElementA extends _.chain(_.Anonymous, _.Shadow, HTMLElement) {
    static [_.shadowHTML] = _.html`<slot></slot>`;
    static [_.shadowCSS] = [ _.cssDisplayBlock, _.css`:host { color: #00ff00; }` ];
}

const message = "<Hello World> 'Hello World' \"Hello World\" &=";
const htmlA = _.html `<${ElementA}>${message}</${ElementA}>`;
const templateA = _.htmlCache(htmlA);
document.body.appendChild(_.htmlFragment(htmlA));
document.body.appendChild(_.htmlFragment(templateA));
document.body.insertAdjacentHTML("beforeend", htmlA);
```

#### `getGlobalCSS`

`getGlobalCSS` gets constructed `CSSStyleSheet` from `link` and `style` elements which have
`data-wc-global-css` attribute.

#### `updateGlobalCSS`

`updateGlobalCSS` update the constructed `CSSStyleSheet` for `getGlobalCSS` dynamically.

Example:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Global CSS</title>
        <script type="importmap">{
            "imports": {
                "wc-helpers": "https://cdn.jsdelivr.net/npm/wc-helpers@2/wc-helpers.mjs"
            }
        }</script>
        <script type="module">
            import { getGlobalCSS, updateGlobalCSS, WCHelpers, shadowCSS, shadowHTML, html, css } from "wc-helpers";

            class MyElement extends WCHelpers(HTMLElement) {
                static [shadowCSS] = [ getGlobalCSS() ];
                static [shadowHTML] = html`<p>Inside shadow DOM</p>`;
            }
            customElements.define("my-element", MyElement);

            setTimeout(() => {
                const style = document.createElement("style");
                style.textContent = css`p { color: green; }`;
                style.setAttribute("data-wc-global-css", "");
                style.addEventListener("load", () => updateGlobalCSS());
                document.head.appendChild(style);
            }, 3000);

        </script>
        <style data-wc-global-css>
            p { color: red; }
        </style>
    </head>
    <body>
        <p>Outside shadow DOM</p>
        <my-element></my-element>
    </body>
</html>
```

### `WCHelpers`

`Anonymous`, `Attribute`, and `Shadow` mixin chained together.

Here is an example adopted from [react.dev](https://react.dev/learn/scaling-up-with-reducer-and-context),
with approximately 50% reduction of lines.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>WCHelpers</title>
        <script type="importmap">{
            "imports": {
                "wc-helpers": "https://cdn.jsdelivr.net/npm/wc-helpers@2/wc-helpers.mjs"
            }
        }</script>
        <script type="module">
// start
// example using importmap
import * as _ from "wc-helpers";

const { html, css } = _;

class TaskItem extends _.WCHelpers(HTMLElement) {
    static observedAttributes = [ "data-done" ];
    static [_.shadowCSS] = [ css`:host { display: list-item; }`, _.getGlobalCSS() ];
    static [_.shadowHTML] = html`
<input type="checkbox" id="checkbox"/>
<span id="mode">
    <span id="editor">
        <input type="text" id="input"/>
        <button id="save">Save</button>
    </span>
    <span id="viewer">
        <span part="content"><slot></slot></span>
        <button id="edit">Edit</button>
    </span>
</span>
<button id="delete">Delete</button>`;

    constructor() {
        super();
        const internals = this.attachInternals();
        internals.role = "listitem";

        const id = this[_.shadowElements], at = this[_.attributeState];

        at["data-done"].listen((value) => id.checkbox.checked = value != null);
        id.checkbox.addEventListener("change", () => void(this.toggleAttribute("data-done", id.checkbox.checked)));

        const _edited = new _.State(false);

        _edited.listen((edited) => {
            id.mode.textContent = "";
            id.mode.appendChild(edited ? id.editor : id.viewer);
        });

        _edited.listenNoInit((edited) => edited ? (id.input.value = this.textContent) : (this.textContent = id.input.value));

        id.edit.addEventListener("click", () => void (_edited.cset(true)));
        id.save.addEventListener("click", () => void (_edited.cset(false)));
        id.delete.addEventListener("click", () => void (this.parentNode?.removeChild(this)));
    }
}
customElements.define("task-item", TaskItem);

class MyTask extends _.WCHelpers(HTMLElement) {
    static observedAttributes = [ "data-title" ];
    static [_.shadowCSS] = [ _.cssDisplayBlock, _.getGlobalCSS() ];
    static [_.shadowHTML] = html`
<h3 id="title"></h3>
<input type="text" placeholder="Add task" id="input"/>
<button id="add">Add</button>
<ul><slot></slot></ul>`;

    constructor() {
        super();
        const id = this[_.shadowElements];
        const at = this[_.attributeState];
        at["data-title"].listen((value) => id.title.textContent = value ?? "");
        id.add.addEventListener("click", () => {
            this.insertAdjacentHTML("beforeend", html`<task-item>${id.input.value}</task-item>`);
            id.input.value = "";
        });
    }
}
customElements.define("my-task", MyTask);

// end
        </script>
        <style>
            task-item[data-done]::part(content) {
                text-decoration: line-through;
            }
        </style>
        <style data-wc-global-css>
            ul, ol { padding-inline-start: 25px; }
        </style>
    <head>
    <body>
        <my-task data-title="Day off in Kyoto">
            <task-item data-done>Philosopher's Path</task-item>
            <task-item>Visit the temple</task-item>
            <task-item>Drink matcha</task-item>
        </my-task>
    </body>
</html>
```
