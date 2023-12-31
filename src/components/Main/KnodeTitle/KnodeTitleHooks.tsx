import {atom, useRecoilState} from "recoil";
import {getChainStyleTitle, updateKnode} from "../../../service/api/KnodeApi";
import {CurrentChainStyleTitleAtom, KnodeSelector} from "../../../recoil/home/Knode";

export const TitleEditKnodeIdAtom = atom<number | undefined>({
    key: "TitleEditKnodeIdAtom",
    default: undefined
})

export const KnodeConnectionIdTempAtom = atom<number | undefined>({
    key: "KnodeConnectionIdTempAtom",
    default: undefined
})

export const useHandleSubmit = ():(()=>void)=>{
    const [titleEditKnodeId, setTitleEditKnodeId] = useRecoilState(TitleEditKnodeIdAtom)
    const [knode, setKnode] = useRecoilState(KnodeSelector(titleEditKnodeId!))
    const [, setCurrentChainStyleTitle] = useRecoilState(CurrentChainStyleTitleAtom)

    return async ()=>{
        if(!knode) return
        await updateKnode(knode)
        setKnode(knode)
        setTitleEditKnodeId(undefined)
        setCurrentChainStyleTitle(await getChainStyleTitle(knode.id))
    }
}

