import {atom, DefaultValue, selectorFamily} from "recoil";
import {Knode, Ktree, updateKtree} from "../../service/data/Knode";

export const defaultKnode = {
    id: -999,
    title: "default",
    labels: [],
    stemId: -1000,
    branchIds: [],
    connectionIds: [],
    index: 0,
    createTime: "2000-1-1T00:00:00",
    privacy: "private"
}


export const KtreeAtom = atom<Ktree>({
    key:"KtreeAtom",
    default: {
        knode: defaultKnode,
        branches:[]
    },
    dangerouslyAllowMutability: true
})

export const KnodeSelector = selectorFamily<Knode | undefined, number>({
    key:"KnodeSelector",
    get: (id) => ({get}) =>getKnode(get(KtreeAtom), id),
    set: (id)=>({get, set}, newValue)=>{
        console.log("update", newValue, id)
        if(newValue && !(newValue instanceof DefaultValue))
            set(KtreeAtom, updateKtree({...get(KtreeAtom)}, newValue))
    }

})

export const SelectedKnodeIdAtom = atom<number>({
    key:"SelectedKnodeAtom",
    default:0,
    dangerouslyAllowMutability: true
})


export const getKnode = (ktree: Ktree, id: number): Knode | undefined=>{
    if(ktree.knode.id === id) return ktree.knode
    for(let branch of ktree.branches){
        let knode = getKnode(branch, id);
        if(knode) return knode
    }
}