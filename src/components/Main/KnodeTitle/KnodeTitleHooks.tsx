import {atom, useRecoilState} from "recoil";
import {updateKnode} from "../../../service/api/KnodeApi";
import {KnodeSelector} from "../../../recoil/home/Knode";

export const TitleEditKnodeIdAtom = atom<number | undefined>({
    key: "TitleEditKnodeIdAtom",
    default: undefined
})

export const useHandleSubmit = ():(()=>void)=>{
    const [titleEditKnodeId, setTitleEditKnodeId] = useRecoilState(TitleEditKnodeIdAtom)
    const [knode, setKnode] = useRecoilState(KnodeSelector(titleEditKnodeId!))

    return async ()=>{
        if(!knode) return
        await updateKnode(knode)
        console.log("KNODE EMMM", knode)
        setKnode(knode)
        setTitleEditKnodeId(undefined)
    }
}

