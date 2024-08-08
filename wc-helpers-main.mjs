
import {once, chain} from "./modules/utils.mjs";
import {Anonymous} from "./modules/anonymous.mjs";
import {Attribute} from "./modules/state.mjs";
import {Shadow} from "./modules/shadow.mjs";

export const version = "2.0.0";
export const WCHelpers = once(Base => chain(Anonymous, Attribute, Shadow, Base));

export * from "./modules/utils.mjs";
export * from "./modules/anonymous.mjs";
export * from "./modules/state.mjs";
export * from "./modules/shadow.mjs";
