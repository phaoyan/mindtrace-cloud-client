import {Knode} from "./Knode";


export interface Node{
    id: string,

}

export interface Edge{
    source: string,
    target: string
}

export interface KtreeG6 {
    nodes: Node[],
    edges: Edge[]
}

export const convertToKtreeG6 = (repo: Knode[]): KtreeG6=>{
    return {
        nodes: repo.map((knode)=>({
            id: knode.id.toString()
        })),
        edges: repo.filter(knode=>knode.stemId)
                .map(knode=>({
                    // @ts-ignore
                    source: knode.stemId.toString(),
                    target: knode.id.toString()}))

    }
}