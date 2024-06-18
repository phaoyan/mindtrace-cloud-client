import {getResourceBatch, searchSimilarResource} from "../../../../service/api/ResourceApi";
import {atom, useRecoilState, useRecoilValue} from "recoil";
import {getEnhancersByResourceId} from "../../../../service/api/EnhancerApi";
import {Resource} from "../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import {LoginUserIdSelector} from "../../../Login/LoginHooks";

export const RESOURCE_SIMILAR_THRESHOLD = 0.8

export const SearchOptionsAtom = atom<any>({
    key: "SearchOptionsAtom",
    default: {
        showMineOnly: false,
        resourceTypeLimits: [],
        count: 8
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
    const resourceFilter = useResourceFilter();
    return async (txt: string, threshold: number)=>{
        setSearching(true)
        const dataList = await searchSimilarResource(txt, threshold)
        let resources = await resourceFilter(dataList)
        let enhancerIds: number[] = []
        for(let resource of resources){
            const enhancers = await getEnhancersByResourceId(resource.id!)
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



export const useResourceFilter = ()=>{
    const options = useRecoilValue(SearchOptionsAtom)
    const showMineOnlyFilter = useShowMineOnlyFilter()
    const resourceTypeLimitsFilter = useResourceTypeLimitsFilter()
    return async (dataList: {id: number, score: number}[]): Promise<Resource[]>=>{
        let resources = await getResourceBatch(dataList.map(data=>data.id))
        resources = showMineOnlyFilter(resources)
        resources = resourceTypeLimitsFilter(resources)
        let resourceIds = resources.map(resource=>resource.id)
        resourceIds = dataList.filter(data=>resourceIds.includes(data.id)).slice(0, options.count).map(data=>data.id)
        return resources.filter(resource=>resourceIds.includes(resource.id))
    }
}