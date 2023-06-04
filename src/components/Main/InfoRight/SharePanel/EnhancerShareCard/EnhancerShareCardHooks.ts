import {useRecoilState, useRecoilValue} from "recoil";
import {EnhancersForSelectedKnodeAtom} from "../../../../../recoil/home/Enhancer";
import {forkEnhancerShare} from "../../../../../service/api/ShareApi";
import {MessageApiAtom} from "../../../../../recoil/utils/DocumentData";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";

export const useFork = (shareId: number)=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [enhancersForSelectedKnode, setEnhancersForSelectedKnode] = useRecoilState(EnhancersForSelectedKnodeAtom)
    const messageApi = useRecoilValue(MessageApiAtom)
    return  async ()=>{
        setEnhancersForSelectedKnode([...enhancersForSelectedKnode, await forkEnhancerShare(shareId, selectedKnodeId)])
        messageApi.success("笔记复制成功！（前往”笔记“查看）")
    }
}