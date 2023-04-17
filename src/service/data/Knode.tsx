import {getKnode} from "../../recoil/home/Knode";


export interface Knode {
    id: number,
    index: number,
    title: string,
    labels: any[],
    stemId: number | null,
    branchIds: number[],
    connectionIds: number[],
    createTime: string,
    privacy: string
}



export interface Ktree {
    knode: Knode,
    branches: Ktree[]
}

export interface KtreeAntd {
    key: number,
    title: any,
    children: KtreeAntd[]
}


export const sortKtree = (ktree: Ktree)=>{
    ktree.branches = ktree.branches.sort((a,b)=>a.knode.index - b.knode.index)
    for(let branch of ktree.branches)
        sortKtree(branch)
}

export const constructKtree = (repo: Array<Knode>): Ktree => {
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
    for (let [, ktree] of ktreeMap)
        if (!ktree.knode.stemId) {
            sortKtree(ktree)
            return ktree
        }
    throw new Error("Ktree construction failed")
}

export const appendToKtree = (ktree: Ktree, newBranch: Ktree)=>{
    // console.log("append to ktree", ktree, newBranch)
    if(newBranch.knode.stemId === ktree.knode.id)
        ktree.branches.push(newBranch)
    else for(let branch of ktree.branches)
        appendToKtree(branch, newBranch)
    // console.log("appended",ktree)
    return ktree
}

export const updateKtree = (ktree: Ktree, updatedKnode: Knode)=>{
    if(updatedKnode.id === ktree.knode.id) {
        ktree.knode = updatedKnode
        return ktree
    }
    else for (let branch of ktree.branches)
        updateKtree(branch, updatedKnode)
    return ktree
}

export const removeFromKtree = (ktree: Ktree, knodeId: number)=>{

    ktree.branches = ktree.branches.filter(br=>br.knode.id!==knodeId)
    ktree.branches = ktree.branches.map(br=>removeFromKtree(br, knodeId))
    return ktree;
}

export const getBrotherBranchIds = (ktree: Ktree, knodeId: number): number[] | undefined=>{
    const branchIds = ktree.branches.map(branch=>branch.knode.id);
    if(branchIds.includes(knodeId))
        return branchIds
    else for (let branch of ktree.branches){
        let result = getBrotherBranchIds(branch, knodeId);
        if(result) return result
    }
}

export const getStemChain = (ktree: Ktree, knode: Knode): Knode[]=>{
    let res = [knode]
    while (knode.stemId){
        knode = getKnode(ktree, knode.stemId)!
        res.push(knode)
    }
    return res.slice(1, res.length-1).reverse()
}
