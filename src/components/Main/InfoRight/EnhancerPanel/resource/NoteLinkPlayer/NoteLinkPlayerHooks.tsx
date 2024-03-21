import {atom} from "recoil";

export const NoteLinkAtom = atom<number | undefined>({
    key: "NoteLinkAtom",
    default: undefined
})

