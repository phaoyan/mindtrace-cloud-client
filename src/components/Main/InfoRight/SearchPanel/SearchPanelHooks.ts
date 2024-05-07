import {getResourceBatch, searchSimilarResource} from "../../../../service/api/ResourceApi";
import {atom, useRecoilState, useRecoilValue} from "recoil";
import {getEnhancersByResourceId} from "../../../../service/api/EnhancerApi";
import {Resource} from "../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import {LoginUserIdSelector} from "../../../Login/LoginHooks";

export const SearchOptionsAtom = atom<any>({
    key: "SearchOptionsAtom",
    default: {
        showMineOnly: false,
        resourceTypeLimits: []
    }
})

export const SearchPanelSearchingAtom = atom<boolean>({
    key: "SearchPanelSearchingAtom",
    default: false
})

export const SimilarResourcesRelatedEnhancerIdsAtom = atom<number[]>({
    key: "SimilarResourcesRelatedEnhancerIdsAtom",
    default: []
})

export const useSetResourceTypeLimit = ()=>{
    const [options, setOptions] = useRecoilState(SearchOptionsAtom)
    return (type: string, checked: boolean)=>{
        setOptions({
            ...options,
            resourceTypeLimits: checked ?
                [...options.resourceTypeLimits, type]:
                options.resourceTypeLimits.filter((resourceType: string)=>resourceType !== type)
        })
    }
}

export const useSearchResourcesBySimilar = ()=>{
    const [, setEnhancerIds] = useRecoilState(SimilarResourcesRelatedEnhancerIdsAtom)
    const [, setSearching] = useRecoilState(SearchPanelSearchingAtom)
    const showMineOnlyFilter = useShowMineOnlyFilter()
    const resourceTypeLimitsFilter = useResourceTypeLimitsFilter()
    return async (txt: string, threshold: number)=>{
        setSearching(true)
        const dataList = await searchSimilarResource(txt, threshold)
        let resources = await getResourceBatch(dataList.map(data=>data.id))
        resources = showMineOnlyFilter(resources)
        resources = resourceTypeLimitsFilter(resources)
        const resourceIds = resources.map(resource=>resource.id);
        let enhancerIds: number[] = []
        for(let data of dataList.filter(data=>resourceIds.includes(data.id))){
            const enhancers = await getEnhancersByResourceId(data.id!)
            enhancerIds = [...enhancerIds, ...enhancers.map(enhancer=>enhancer.id)]
        }
        setEnhancerIds([...new Set(enhancerIds)])
        setSearching(false)
    }
}

export const useShowMineOnlyFilter = ()=>{
    const options = useRecoilValue(SearchOptionsAtom)
    const userId = useRecoilValue(LoginUserIdSelector)
    return (resources: Resource[])=>options.showMineOnly ? resources.filter(resource=>resource.createBy===userId) : resources
}

export const useResourceTypeLimitsFilter = ()=>{
    const options = useRecoilValue(SearchOptionsAtom)
    return (resources: Resource[])=>resources.filter(resource=>options.resourceTypeLimits.length===0 || options.resourceTypeLimits.includes(resource.type))
}