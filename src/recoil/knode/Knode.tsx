import {atom, atomFamily, selector, selectorFamily, snapshot_UNSTABLE} from "recoil";
import {snapshot_UNSTABLE as snapshot} from "recoil";
import KnodeTitle from "../../components/home/KnodeTitle";
import axios from "axios";
import {CORE_HOST, RESULT} from "../../constants";
import {User} from "../user/User";

const CORE_USER_KNODE_PREFIX = (userId: number)=>CORE_HOST + "user/" + userId + "/knode/"


export interface Knode {
    id: number,
    title: string,
    labels: [any],
    stemId: number | null,
    branchIds: [number],
    connectionIds: [number],
    createTime: string,
    privacy: string
}

export interface Ktree {
    knode: Knode,
    branches: Array<Ktree>
}

export const KnodeRepository = atom<Array<Knode>>({
    key: "KnodeRepository",
    default: []
})

const knodeRepo: Map<number, Knode> = new Map<number, Knode>();
export const KnodeAtomFamily = atomFamily<Knode | undefined, number>({
    key:"KnodeAtomFamily",
    default: (knodeId)=>knodeRepo.get(knodeId)
})

export const KnodeSelectorFamily = selectorFamily<Knode, number>({
    key:"KnodeSelectorFamily",
    get: knodeId => ({get})=>get(KnodeRepository).filter(knode=>knode.id===knodeId)[0]

})

export const KtreeSelector = selector({
    key: "KtreeSelector",
    get: ({get}) => constructKtree(get(KnodeRepository))
})

export const KtreeAntdTreeSelector = selector({
    key:"KtreeAntdTreeSelector",
    get: ({get}) => convertKtree([get(KtreeSelector)])
})

export const constructKtree = (repo: Array<Knode>): Ktree | null => {
    let ktreeMap: Map<number, Ktree> = new Map<number, Ktree>();
    for (let knode of repo)
        ktreeMap.set(knode.id, {knode: knode, branches: []});
    for (let [, ktree] of ktreeMap) {
        let stemId = ktree.knode.stemId;
        if(!stemId) continue;
        let stem = ktreeMap.get(stemId)
        if(!stem) continue;
        stem.branches.push(ktree)
    }
    for (let [, ktree] of ktreeMap)
        if(!ktree.knode.stemId)
            return ktree
    return null
}

export const convertKtree = (ori: Array<Ktree | null>): Array<any>=>{
    if(ori[0] == null) return []
    return ori.map(ktree=>({
        // @ts-ignore
        key: ktree.knode.id,
        // @ts-ignore
        title: <KnodeTitle knodeId={ktree?.knode.id}/>,
        // @ts-ignore
        children: convertKtree(ktree.branches)
    }))
}
