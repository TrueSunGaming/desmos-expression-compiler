import { compileAndShow, lookup } from "./compiler.js";

const monaco = window.monaco;

monaco.languages.register({
    id: "dec"
});

monaco.languages.setMonarchTokensProvider("dec", {
    keywords: [ ...lookup.keys() ],
    
    tokenizer: {
        root: [
            [/[a-z_$][\w$]*/, { 
                cases: {
                    "@keywords": "keyword",
                    "@default": "identifier" 
                }
            }],

            [/[()]/, "@brackets"],

            [/\d+/, "number"],
        ]
    }
});

monaco.languages.setLanguageConfiguration("dec", {
    surroundingPairs: [
        {
            open: "(",
            close: ")"
        }
    ],

    autoClosingPairs: [
        {
            open: "(",
            close: ")"
        }
    ],

    brackets: [
        ["(", ")"]
    ]
});

const basecode = `(let m 0)
(let b 0)

(let y
    (add
        (mul m x)
        b
    )
)`;

export const editor = monaco.editor.create(document.querySelector("#editor"), {
    value: new URL(location.href).searchParams.get("code") ?? (localStorage.DEC_CODE ?? basecode),
    language: "dec",
    theme: "vs-dark"
});

export function save() {
    localStorage.DEC_CODE = editor.getValue();
}

async function share() {
    const url = new URL(location.href);
    url.searchParams.set("code", editor.getValue());
    await navigator.clipboard.writeText(url.toString());
    alert("URL copied to clipboard");
}

editor.addAction({
    id: "compile",
    label: "Compile",
    run: () => {
        compileAndShow(editor.getValue());
    },
    keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_R
    ],
    contextMenuOrder: 0,
    contextMenuGroupId: "operation"
});

editor.addAction({
    id: "share",
    label: "Share",
    run: () => {
        share();
    },
    keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S
    ],
    contextMenuOrder: 1,
    contextMenuGroupId: "operation"
});