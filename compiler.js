import { release, version } from "./version.js";

let validCompilation = true;

function identifierFormat(str = "") {
    if (str.length < 1) error(`Error: Identifier "${str}" is empty`);
    if (str.match(/^\d|\W/) != null) error(`Error: Identifier "${str}" is not alphanumeric`);
    if (str.length == 1) return str;
    return `${str[0]}_{${str.substring(1)}}`;
}

function numeric(x = 0) {
    return String(x).match(/[^0-9-.e]/g) == null;
}

function valueFormat(x = 0) {
    return numeric(x) ? x : identifierFormat(x);
}

function compileValue(v) {
    return typeof v == "string" ? valueFormat(v) : v.compiled;
}

function error(msg = "") {
    const el = document.querySelector("#error").appendChild(document.createElement("span"));
    el.innerText = msg + "\n";
    el.classList.add("error");
    validCompilation = false;
}

export const lookup = new Map([
    [
        "let",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected identifier as variable name for \"let\"");
            const n = identifierFormat(node.args[0]);
            const v = typeof node.args[1] == "string" ? (node.args.length < 2 ? 0 : valueFormat(node.args[1])) : node.args[1].compiled;
            if (n == null || v == null) return null;
            return `${n}=${v}`;
        }
    ],

    [
        "set",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected identifier as variable name for \"set\"");
            const n = identifierFormat(node.args[0]);
            const v = typeof node.args[1] == "string" ? (node.args.length < 2 ? 0 : valueFormat(node.args[1])) : node.args[1].compiled;
            if (n == null || v == null) return null;
            return `${n}\\to ${v}`;
        }
    ],

    [
        "add",
        (node = new TreeNode()) => {
            return `\\left(${node.args.map(compileValue).join("+")}\\right)`;
        }
    ],

    [
        "sub",
        (node = new TreeNode()) => {
            return `\\left(${node.args.map(compileValue).join("-")}\\right)`;
        }
    ],

    [
        "mul",
        (node = new TreeNode()) => {
            return `\\left(${node.args.map(compileValue).join("\\cdot ")}\\right)`;
        }
    ],

    [
        "pow",
        (node = new TreeNode()) => {
            return `\\left(\\left(${compileValue(node.args[0])}\\right)^{\\left(${compileValue(node.args[1])}\\right)}\\right)`;
        }
    ],

    [
        "frac",
        (node = new TreeNode()) => {
            if (node.args.length < 2) error("Error: Expected numerator and denominator for \"frac\"");
            return `\\frac{${compileValue(node.args[0])}}{${compileValue(node.args[1])}}`;
        }
    ],

    [
        "action",
        (node = new TreeNode()) => {
            for (const i of node.args) if ((typeof i == "string" && numeric(i)) || i.cmd == "pi" || i.cmd == "tau") error("Error: Unexpected number in \"action\"");
            return node.args.map(compileValue).join(",");
        }
    ],

    [
        "point",
        (node = new TreeNode()) => {
            if (node.args.length < 2) error("Error: \"point\" requires 2 inputs");
            return `\\left(${valueFormat(node.args[0])},${valueFormat(node.args[1])}\\right)`;
        }
    ],

    [
        "poly",
        (node = new TreeNode()) => {
            for (const i of node.args) if ((typeof i == "string" && numeric(i)) || i.cmd == "pi" || i.cmd == "tau") error("Error: Unexpected number in \"poly\"");
            return `\\operatorname{polygon}\\left(${node.args.map(compileValue).join(",")}\\right)`;
        }
    ],

    [
        "list",
        (node = new TreeNode()) => {
            return `\\left[${node.args.map(compileValue).join(",")}\\right]`;
        }
    ],

    [
        "params",
        (node = new TreeNode()) => {
            return node.args.map(compileValue).join(",");
        }
    ],

    [
        "func",
        (node = new TreeNode()) => {
            if (node.args.length < 3) error("Error: \"func\" requires a name, inputs, and an expression");
            if (node.args[1].cmd != "params") error("Error: Expected params as function inputs for \"func\"");
            return `${identifierFormat(node.args[0])}\\left(${node.args[1].compiled}\\right)=${node.args[2].compiled}`;
        }
    ],

    [
        "subst",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected identifier as function name for \"subst\"");
            return `${identifierFormat(node.args[0])}\\left(${node.args.slice(1).map(compileValue).join(",")}\\right)`;
        }
    ],

    [
        "alpha",
        () => "\\alpha"
    ],

    [
        "beta",
        () => "\\beta"
    ],

    [
        "theta",
        () => "\\theta"
    ],

    [
        "pi",
        () => "\\pi"
    ],

    [
        "tau",
        () => "\\tau"
    ],

    [
        "phi",
        () => "\\phi"
    ],

    [
        "xcoord",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected an identifier or point for \"xcoord\"");
            return `${compileValue(node.args[0])}.x`;
        }
    ],

    [
        "ycoord",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected an identifier or point for \"ycoord\"");
            return `${compileValue(node.args[0])}.y`;
        }
    ],

    [
        "sin",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"sin\"");
            return `\\sin\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "asin",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"asin\"");
            return `\\arcsin\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "sinh",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"sinh\"");
            return `\\sinh\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "asinh",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"asinh\"");
            return `\\arcsinh\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "cos",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"cos\"");
            return `\\cos\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "acos",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"acos\"");
            return `\\arccos\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "cosh",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"cosh\"");
            return `\\cosh\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "acosh",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"acosh\"");
            return `\\arccosh\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "tan",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"tan\"");
            return `\\tan\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "atan",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"atan\"");
            return `\\arctan\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "atan2",
        (node = new TreeNode()) => {
            if (node.args.length < 2) error("Error: Expected 2 values for \"atan2\"");
            return `\\arctan\\left(${compileValue(node.args[0])},${compileValue(node.args[1])}\\right)`;
        }
    ],

    [
        "tanh",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"tanh\"");
            return `\\tanh\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "atanh",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"atanh\"");
            return `\\arctanh\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "sqrt",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"sqrt\"");
            return `\\sqrt{${compileValue(node.args[0])}}`;
        }
    ],

    [
        "root",
        (node = new TreeNode()) => {
            if (node.args.length < 2) error("Error: Expected 2 values for \"root\"");
            return `\\sqrt[${compileValue(node.args[1])}]{${compileValue(node.args[0])}}`;
        }
    ],

    [
        "floor",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"floor\"");
            return `\\operatorname{floor}\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "ceil",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"ceil\"");
            return `\\operatorname{ceil}\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "round",
        (node = new TreeNode()) => {
            if (node.args.length < 1) error("Error: Expected a value for \"round\"");
            return `\\operatorname{round}\\left(${compileValue(node.args[0])}\\right)`;
        }
    ],

    [
        "eq",
        (node = new TreeNode()) => {
            if (node.args.length < 2) error("Error: Expected 2 values for \"eq\"");
            return `${compileValue(node.args[0])}=${compileValue(node.args[1])}`;
        }
    ],

    [
        "gt",
        (node = new TreeNode()) => {
            if (node.args.length < 2) error("Error: Expected 2 values for \"gt\"");
            return `${compileValue(node.args[0])}>${compileValue(node.args[1])}`;
        }
    ],

    [
        "lt",
        (node = new TreeNode()) => {
            if (node.args.length < 2) error("Error: Expected 2 values for \"lt\"");
            return `${compileValue(node.args[0])}<${compileValue(node.args[1])}`;
        }
    ],

    [
        "geq",
        (node = new TreeNode()) => {
            if (node.args.length < 2) error("Error: Expected 2 values for \"geq\"");
            return `${compileValue(node.args[0])}\\ge${compileValue(node.args[1])}`;
        }
    ],

    [
        "leq",
        (node = new TreeNode()) => {
            if (node.args.length < 2) error("Error: Expected 2 values for \"leq\"");
            return `${compileValue(node.args[0])}\\le${compileValue(node.args[1])}`;
        }
    ],

    [
        "if",
        (node = new TreeNode()) => {
            if (node.args.length < 2) error("Error: Expected conditional and expression for \"if\"");
            return `${compileValue(node.args[1])}\\left\\{${compileValue(node.args[0])}\\right\\}`;
        }
    ],

    [
        "piecewise",
        (node = new TreeNode()) => {
            if (node.args.length < 3) error("Error: Expected conditional, true expression, and false expression for \"piecewise\"");
            return `\\left\\{${compileValue(node.args[0])}:${compileValue(node.args[1])},${compileValue(node.args[2])}\\right\\}`;
        }
    ],

    [
        "listcomp",
        (node = new TreeNode()) => {
            if (node.args.length < 3) error("Error: Expected list, variable name, and function for \"listcomp\"");
            return `\\left[${compileValue(node.args[2])}\\operatorname{for}${compileValue(node.args[1])}=${compileValue(node.args[0])}\\right]`;
        }
    ]
]);

class TreeNode {
    cmd;
    args = [];

    constructor(cmd, args = []) {
        this.cmd = cmd;
        this.args = args;
    }

    static fromExpression(str = "") {
        str = str.trim();
        if (str.length < 1) error("Error: Command expected after parentheses");
        let depth = 0;
        const splits = [];
        for (let i = 0; i < str.length; i++) {
            if (str[i] == " " && depth == 0) splits.push(i);
            if (str[i] == "(") depth++;
            if (str[i] == ")") depth--;
        }
        if (depth != 0) error("Error: Mismatched parentheses");
        let split = [str.substring(0, splits.length > 0 ? splits[0] : str.length)];
        for (let i = 0; i < splits.length; i++) {
            split.push(str.substring(splits[i], i != splits.length - 1 ? splits[i + 1] : str.length));
        }
        split = split.map((v) => v.trim()).filter((v) => v.length > 0);
        if (split.length < 1) error("Error: Command expected after parentheses");
        const cmd = split[0];
        const args = split.slice(1, split.length).map((v) => v.startsWith("(") ? TreeNode.fromExpression(v.substring(1, v.length - 1).trim()) : v);
        console.log(split, cmd, args);
        return new TreeNode(cmd, args);
    }

    get compiled() {
        const f = lookup.get(this.cmd);
        if (!f) error(`Error: Command "${this.cmd}" not found`);
        return f?.(this);
    }
}

function parseExpression(str = "") {
    const tn = TreeNode.fromExpression(str);
    return tn.compiled;
}

export function compile(str = "") {
    validCompilation = true;
    document.querySelector("#error").innerHTML = `Desmos Expression Compiler v${version}<br>Created by <a class="good" href="https://github.com/TrueSunGaming">TrueSunGaming</a><br>Released ${release}<br><br>`;
    const s = str.split(/\n+/g).map((v) => v.trim()).filter((v) => v.length > 0).join(" ");

    const groups = [];
    let gs = [];
    for (let i = 0; i < s.length; i++) {
        if (s[i] == "(") gs.push(i);
        if (s[i] == ")") {
            if (gs.length == 0) error("Error: Mismatched parentheses");
            const start = gs.pop();
            if (gs.length == 0) groups.push({
                start,
                end: i,
                content: s.substring(start + 1, i)
            });
        }
    }
    if (gs.length != 0) error("Error: Mismatched parentheses");

    let res = "";
    for (const i of groups) {
        const r = parseExpression(i.content);
        res += r + "\n";
    }

    if (!validCompilation) return;
    document.querySelector("#error").innerHTML += "<span class='good'>No errors found.</span>";
    
    return res;
}

export function compileAndShow(str = "") {
    const res = compile(str);
    const win = open("about:blank");
    win.document.title = "DEC Compiled Output";
    win.document.body.appendChild((() => {
        const b = document.createElement("button");
        b.innerHTML = "Copy";
        b.style.userSelect = "none";
        b.onclick = () => win.navigator.clipboard.writeText(res);
        return b;
    })());
    win.document.body.appendChild(document.createElement("pre")).innerHTML = res;
    addEventListener("beforeunload", () => win.close());
}