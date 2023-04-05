import {KnodeTitle} from "../../components/home/KnodeInfo";

export interface Knode {
    id: number,
    title: string,
    labels: any[],
    stemId: number | null,
    branchIds: number[],
    connectionIds: number[],
    createTime: string,
    privacy: string
}

export const defaultKnode = {
    id: -999,
    title: "default",
    labels: [],
    stemId: -1000,
    branchIds: [],
    connectionIds: [],
    createTime: "2000-1-1T00:00:00",
    privacy: "private"
}

export interface Ktree {
    knode: Knode,
    branches: Array<Ktree>
}

export interface KtreeAntd {
    key: number,
    title: any,
    children: KtreeAntd[]
}


export const constructKtree = (repo: Array<Knode>): Ktree => {
    console.log("before",repo)
    let ktreeMap: Map<number, Ktree> = new Map<number, Ktree>();
    for (let knode of repo)
        ktreeMap.set(knode.id, {knode: knode, branches: []});
    for (let [, ktree] of ktreeMap) {
        let stemId = ktree.knode.stemId;
        if (!stemId) continue;
        let stem = ktreeMap.get(stemId)
        if (!stem) continue;
        stem.branches.push(ktree)
    }
    console.log("ktree map", ktreeMap)
    for (let [, ktree] of ktreeMap)
        if (!ktree.knode.stemId) {
            console.log("ktree return", ktree)
            return ktree
        }
    console.log("after",repo)
    throw new Error("Ktree construction failed")
}

export const appendToKtree = (ktree: Ktree, newBranch: Ktree)=>{
    if(newBranch.knode.stemId === ktree.knode.id)
        ktree.branches.push(newBranch)
    for(let branch of ktree.branches)
        appendToKtree(branch, newBranch)
    console.log("appended",ktree)
    return ktree
}

export const removeFromKtree = (ktree: Ktree, knodeId: number)=>{
    ktree.branches = ktree.branches.filter(br=>br.knode.id!==knodeId)
    ktree.branches = ktree.branches.map(br=>removeFromKtree(br, knodeId))
    return ktree;
}

export const convertKtree = (ori: Array<Ktree | null>): KtreeAntd[] => {
    if (ori[0] == null) return []
    return ori.map(ktree => ({
        // @ts-ignore
        key: ktree.knode.id,
        // @ts-ignore
        title: <KnodeTitle ori={ktree?.knode}/>,
        // @ts-ignore
        children: convertKtree(ktree.branches)
    }))
}