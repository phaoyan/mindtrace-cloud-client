import {atom} from "recoil";

let boundHandler: ((event: KeyboardEvent)=>any) | undefined = undefined
export const changeHotkeyHandler = (handler : (event: KeyboardEvent)=>any)=>{
    boundHandler &&
    window.removeEventListener("keydown", boundHandler)
    boundHandler = handler
    window.addEventListener("keydown", boundHandler)
    console.log("handler", boundHandler)
}
export const SelectedHotkeyHandlerAtom = atom<string>({
    key:"SelectedHotkeyHandlerAtom",
    default:""
})
