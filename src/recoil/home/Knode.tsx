import {atom, selector, selectorFamily} from "recoil";
import {Knode, Ktree, KtreeAntd} from "../../service/data/Knode";
import KnodeTitle from "../../components/Main/KnodeTitle/KnodeTitle";
import React from "react";

export const defaultKnode = {
    id: -1,
    title: "default",
    labels: [],
    stemId: -1,
    branchIds: [],
    connectionIds: [],
    index: 0,
    createTime: "2000-1-1T00:00:00",
    createBy: -1,
    privacy: "private"
}

export const KtreeFlatAtom = atom<Knode[]>({
    key: "KtreeFlatAtom",
    default: []
})

export const KtreeSelector = selector<Ktree>({
    key: "KtreeSelector",
    get: ({get})=>{
        let ktreeMap: Map<number, Ktree> = new Map<number, Ktree>();
        for (let knode of get(KtreeFlatAtom))
            ktreeMap.set(knode.id, {knode: knode, branches: []});
        for (let [, ktree] of ktreeMap) {
            let stemId = ktree.knode.stemId;
            if (!stemId) continue;
            let stem = ktreeMap.get(stemId)
            if (!stem) continue;
            stem.branches.push(ktree)
        }
        for (let [, ktree] of ktreeMap)
            if (!ktree.knode.stemId) {
                sortKtree(ktree)
                return ktree
            }
        return {knode: defaultKnode, branches: []}
    }
})
export const SelectedKtreeSelector = selector<Ktree | undefined>({
    key: "SelectedKtreeSelector",
    get: ({get})=> {
        let temp = [get(KtreeSelector)]
        while (temp.length !== 0) {
            let cur = temp.pop()!
            if (cur.knode.id === get(SelectedKnodeIdAtom)) return cur
            else temp = [...temp, ...cur.branches]
        }
    },
})
export const KtreeAntdSelector = selector<KtreeAntd[]>({
    key: "KtreeAntd",
    get: ({get})=> convertKtreeAntd([get(KtreeSelector)])
})

const convertKtreeAntd = (ori: Ktree[]): KtreeAntd[] => {
    if (ori[0] == null) return []
    return ori.map(ktree => ({
        key: ktree.knode.id,
        title: (<KnodeTitle id={ktree?.knode.id!}/>),
        children: convertKtreeAntd(ktree.branches)
    }))
}

export const KnodeSelector = selectorFamily<Knode | undefined, number>({
    key:"KnodeSelector",
    get: (id) => ({get}) =>getKnode(get(KtreeSelector), id),
    set: (id)=>({get, set}, newValue)=>{
        set(KtreeFlatAtom, get(KtreeFlatAtom).map(knode => knode.id === id ? newValue : knode) as Knode[])
    }
})

export const SelectedKnodeIdAtom = atom<number>({
    key:"SelectedKnodeAtom",
    default:-1,
    dangerouslyAllowMutability: true
})

export const DelayedSelectedKnodeIdAtom = atom<number>({
    key: "DelayedSelectedKnodeIdAtom",
    default: -1
})

export const DelayedKnodeIdQueueAtom = atom<number[]>({
    key: "DelayedKnodeIdQueueAtom",
    default: []
})

export const CurrentChainStyleTitleAtom = atom<string[]>({
    key: "CurrentChainStyleTitleAtom",
    default:[]
})

export const SelectedKnodeSelector = selector<Knode | undefined>({
    key: "SelectedKnodeSelector",
    get: ({get})=>get(KtreeFlatAtom).find(knode=>knode.id === get(SelectedKnodeIdAtom)),
    set: ({get, set}, newValue)=>{
        const knodeId = get(SelectedKnodeSelector)?.id
        if(!knodeId) return
        set(KnodeSelector(knodeId), newValue)
    }
})

export const SelectedKnodeStemSelector = selector<Knode | undefined>({
    key: "SelectedKnodeStemSelector",
    get: ({get})=>get(KtreeFlatAtom).find(knode=>knode.id === get(SelectedKnodeSelector)?.stemId),
    set: ({get, set}, newValue)=>{
        const stemId = get(SelectedKnodeSelector)?.stemId
        if(!stemId) return
        console.log("EMMM", get(KnodeSelector(stemId)))
        set(KnodeSelector(stemId), newValue)
    }
})

export const SelectedKnodeAncestorsSelector = selector<Knode[]>({
    key: "SelectedKnodeAncestorsSelector",
    get: ({get})=>{
        const ktreeFlat = get(KtreeFlatAtom)
        let selectedId: number | null = get(SelectedKnodeIdAtom)
        let res: Knode[] = []
        while (selectedId){
            // eslint-disable-next-line no-loop-func
            let cur = ktreeFlat.find(knode=>knode.id === selectedId)
            if(!cur) return res
            res.push(cur)
            selectedId = cur.stemId
        }
        return res
    }
})

export const getKnode = (ktree: Ktree, id: number): Knode | undefined=>{
    if(ktree.knode.id === id) return ktree.knode
    for(let branch of ktree.branches){
        let knode = getKnode(branch, id);
        if(knode) return knode
    }
}

export const sortKtree = (ktree: Ktree)=>{
    ktree.branches = ktree.branches.sort((a,b)=>a.knode.index - b.knode.index)
    for(let branch of ktree.branches) sortKtree(branch)
}

export const ScissoredKnodeIdAtom = atom<number | undefined>({
    key: "ScissoredKnodeIdAtom",
    default: undefined
})