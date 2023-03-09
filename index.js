import { compile, lookup } from "./compiler.js";
import { editor, save } from "./editor.js";

console.log([ ...lookup.keys()]);
setInterval(save, 250);
setInterval(() => compile(editor.getValue()), 100);