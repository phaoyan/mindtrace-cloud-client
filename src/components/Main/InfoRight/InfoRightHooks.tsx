import {atom} from "recoil";

export type TabNames = "note" | "record" | "analysis" | "share";
export const CurrentTabAtom = atom<TabNames>({
    key: "CurrentTabAtom",
    default: "note"
})