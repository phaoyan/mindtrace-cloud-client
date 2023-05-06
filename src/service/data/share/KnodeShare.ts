import {Knode} from "../Knode";
import {defaultKnode} from "../../../recoil/home/Knode";
export const defaultKnodeShare: KnodeShare = {
    id: -1,
    knodeId: -1,
    userId: -1,
    rate: -1,
    visits: -1,
    likes: -1,
    favorites: -1,
    knode: defaultKnode
}
export interface KnodeShare{
    id: number,
    knodeId: number,
    userId: number,
    rate: number,
    visits: number,
    likes: number,
    favorites: number,
    knode: Knode
}