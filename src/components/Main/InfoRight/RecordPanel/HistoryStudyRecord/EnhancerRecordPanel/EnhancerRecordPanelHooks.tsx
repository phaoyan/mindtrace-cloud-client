import {atom, useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {useEffect,} from "react";
import {getStudyTraceEnhancerInfoUnderKnode} from "../../../../../../service/api/TracingApi";
import {getEnhancerById} from "../../../../../../service/api/EnhancerApi";

export const EnhancerTimeDistributionAtom = atom<any[]>({
    key: "EnhancerTimeDistributionAtom",
    default: []
})

export const EnhancerRecordPanelCurrentPageAtom = atom<number>({
    key: "EnhancerRecordPanelCurrentPageAtom",
    default: 1
})

export const useInitEnhancerRecordData = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [, setEnhancerTimeDistribution] = useRecoilState(EnhancerTimeDistributionAtom)
    useEffect(()=>{
        const effect = async ()=>{
            const resp = await getStudyTraceEnhancerInfoUnderKnode(selectedKnodeId)
            const data = []
            for(let info of resp)
                data.push({
                    ...info,
                    title: (await getEnhancerById(info.enhancerId)).title,
                    traces: info.traces.reverse()
                })
            setEnhancerTimeDistribution(data.sort((a,b)=>b.duration - a.duration))
        }; effect().then()
    }, [selectedKnodeId, setEnhancerTimeDistribution])
}