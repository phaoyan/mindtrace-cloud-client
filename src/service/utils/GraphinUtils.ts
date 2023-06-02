export interface GraphinNode{
    id: string,
    label?: string
    x?: number,
    y?: number
}
export interface GraphinEdge{
    source: string,
    target: string
}
export interface GraphinData{
    nodes: GraphinNode[],
    edges: GraphinEdge[]
}
export interface GraphinTree{
    id: string,
    children: GraphinTree[],
    label?: string,
    labelCfg?: any,
    style?: any
}