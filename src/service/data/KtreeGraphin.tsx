import {Knode} from "./Knode";


export interface Node {
    id: string,
    style: {
        label: {
            value: string
        }
    },
    shape?: string
}

export interface Edge {
    source: string,
    target: string
}

export interface KtreeGraphin {
    nodes: Node[],
    edges: Edge[]
}

export const convertToKtreeGraphin = (repo: Knode[]): KtreeGraphin => {

    let ktreeGraphin: KtreeGraphin = {
        nodes: [],
        edges: []
    }

    for (let knode of repo) {
        ktreeGraphin.nodes.push({
            id: knode.id.toString(),
            style: {label: {value: knode.title}},
        })

        knode.stemId &&
        ktreeGraphin.edges.push({
            source: knode.stemId.toString(),
            target: knode.id.toString()
        })
    }

    return ktreeGraphin
}