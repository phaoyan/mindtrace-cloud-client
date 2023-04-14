import {atom, selectorFamily} from "recoil";
import React from "react";

export const MarkdownInlineEditListAtom = atom<{ [key: number | string]: boolean }>({
    key: "MarkdownInlineEditListAtom",
    default: {}
})

export const MarkdownEditSelector = selectorFamily<boolean, number | string>({
    key: "MarkdownEditSelector",
    get: (key)=>({get})=>get(MarkdownInlineEditListAtom)[key],
    set: (key)=>({get, set}, edit)=>
        // @ts-ignore
        set(MarkdownInlineEditListAtom, {...get(MarkdownInlineEditListAtom), [key]: edit})
})

export const MarkdownInlineContext = React.createContext(0)
export const MarkdownInlinePossessorContext = React.createContext(document.createElement("div"))