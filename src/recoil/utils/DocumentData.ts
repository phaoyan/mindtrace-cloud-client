import {atom} from "recoil";
import {MessageInstance} from "antd/es/message/interface";

export const MainPageHeightAtom = atom({
    key:"MainPageHeightAtom",
    default: 720
})

export const MainPageWidthAtom = atom({
    key:"MainPageWidthAtom",
    default: window.innerWidth
})

export const CurrentPageAtom = atom({
    key: "CurrentPageAtom",
    default: "login"
})

export const EnhancerPanelKeyAtom = atom<number>({
    key: "EnhancerPanelKeyAtom",
    default: 0
})

export const MessageApiAtom = atom<MessageInstance>({
    key: "MessageApiAtom"
})