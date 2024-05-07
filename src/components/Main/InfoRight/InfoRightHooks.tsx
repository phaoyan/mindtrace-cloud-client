import {atom, selector, useRecoilState} from "recoil";
import {useEffect} from "react";
import {KnodeSelector, SelectedKnodeIdAtom} from "../../../recoil/home/Knode";
import {ItemType} from "antd/es/menu/hooks/useItems";

export type TabNames = "note" | "record" | "analysis" | "share";
export const CurrentTabAtom = atom<TabNames>({
    key: "CurrentTabAtom",
    default: "note"
})

export const KnodeSelectionHistoryAtom = atom<number[]>({
    key: "KnodeSelectionHistoryAtom",
    default: []
})

export const KnodeSelectionHistoryItemsSelector = selector<ItemType[]>({
    key: "KnodeSelectionHistoryItemsSelector",
    get: ({get})=>{
        const history = get(KnodeSelectionHistoryAtom)
        const selectedKnodeId = get(SelectedKnodeIdAtom)
        return history
            .map((knodeId)=>get(KnodeSelector(knodeId)))
            .filter(knode=>!!knode && knode.id !== selectedKnodeId)
            .map(knode=>({
                key: knode!.id,
                label: knode!.title
        }))
    }
})

export const useUpdateKnodeSelectionHistory = ()=>{
    const [selectedKnodeId, ] = useRecoilState(SelectedKnodeIdAtom)
    const [history, setHistory] = useRecoilState(KnodeSelectionHistoryAtom);
    useEffect(()=>{
        setHistory([...new Set([selectedKnodeId, ...history])].slice(0, 5))
        //eslint-disable-next-line
    }, [selectedKnodeId])
}
