import {useRecoilValue} from "recoil";
import {KtreeFlatAtom} from "../../../../../../recoil/home/Knode";

export const useGetKnode = ()=>{
    const ktreeFlat = useRecoilValue(KtreeFlatAtom)
    return (knodeId: number)=>{
        return ktreeFlat.find((knode)=>knode.id === knodeId)
    }
}