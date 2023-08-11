import {getUserInfoByLike} from "../../../../../service/api/LoginApi";
import {atom, useRecoilState} from "recoil";
import {User} from "../../../../../service/data/Gateway";
import {Knode} from "../../../../../service/data/Knode";
import {Enhancer} from "../../../../../service/data/Enhancer";
import {getKnodeByLike} from "../../../../../service/api/KnodeApi";

export const UserResultsAtom = atom<User[]>({
    key: "UserResultsAtom",
    default: []
})

export const KnodeResultsAtom = atom<Knode[]>({
    key: "KnodeResultsAtom",
    default: []
})

export const EnhancerResultsAtom = atom<Enhancer[]>({
    key: "EnhancerResultsAtom",
    default: []
})


export const useSearch = ()=>{
    const [,setUserResults] = useRecoilState(UserResultsAtom)
    const [,setKnodeResults] = useRecoilState(KnodeResultsAtom)
    return async (searchText: string, mode: string)=>{
        if(!searchText || searchText === "") return
        mode === "user" && setUserResults(await getUserInfoByLike(searchText))
        mode === "knode" && setKnodeResults(await getKnodeByLike(searchText, 10))
    }
}