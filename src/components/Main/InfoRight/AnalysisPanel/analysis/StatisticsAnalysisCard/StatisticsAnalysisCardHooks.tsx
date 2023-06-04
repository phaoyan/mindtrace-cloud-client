import {Knode} from "../../../../../../service/data/Knode";

export interface StatisticsAnalysisData{
    knode: Knode,
    completion: number,
    leaves: number
}

export interface TreeData {
    key: number,
    title: any,
    children: TreeData[]
}
