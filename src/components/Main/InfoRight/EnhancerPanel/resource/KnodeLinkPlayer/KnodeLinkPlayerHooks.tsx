import {Knode} from "../../../../../../service/data/Knode";
import {useRecoilValue} from "recoil";
import {KtreeFlatAtom} from "../../../../../../recoil/home/Knode";
import {getAncestors} from "../../../../../../service/api/KnodeApi";

export const useSearchKnodes = ()=>{
    const ktreeFlat = useRecoilValue(KtreeFlatAtom)
    return async (txt: string): Promise<Knode[][]>=>{
        const knodes = ktreeFlat.filter(knode=>txt !== "" && knode.title.includes(txt))
        const res = []
        for(let knode of knodes)
            res.push(await getAncestors(knode.id))
        return res
    }
}