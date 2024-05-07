import React, {Key, useState} from "react";
import {atom, selector, useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {
    FocusedKnodeSelector,
    FocusedKnodeStemSelector, KnodeSelector,
    KtreeFlatAtom, ScissoredKnodeIdsAtom,
    SelectedKnodeIdAtom,
    SelectedKnodeStemSelector
} from "../../../recoil/home/Knode";
import {
    branch,
    connectKnode, disconnectKnode,
    getKnodeById,
    removeKnode,
    shiftKnode,
    swapBranchIndex
} from "../../../service/api/KnodeApi";
import {KnodeConnectionIdTempAtom, TitleEditKnodeIdAtom} from "../KnodeTitle/KnodeTitleHooks";
import {CurrentPageAtom, MessageApiAtom} from "../../../recoil/utils/DocumentData";
import {User} from "../../../service/data/Gateway";
import {LoginUserAtom, LoginUserIdSelector} from "../../Login/LoginHooks";
import {KnodeIdBeforeVisitAtom} from "../InfoRight/SharePanel/KnodeShareCard/KnodeShareCardHooks";
import {subscribeKnode} from "../../../service/api/ShareApi";
import {getUserPublicInfo} from "../../../service/api/LoginApi";
import dayjs, {Dayjs} from "dayjs";
import {EnhancerPanelCurrentPageAtom} from "../InfoRight/EnhancerPanel/EnhancerPanelHooks";
import {
    StudyTraceTimelineCurrentPageAtom
} from "../InfoRight/RecordPanel/HistoryStudyRecord/StudyTraceTimeline/StudyTraceTimelineHooks";
import {useRemoveKnodeId} from "../InfoRight/RecordPanel/CurrentStudyRecord/CurrentStudyRecordHooks";
import {CurrentTabAtom} from "../InfoRight/InfoRightHooks";

export const ReadonlyModeAtom = atom<boolean>({
    key: "ReadonlyModeAtom",
    default: false
})

export const FocusedKnodeIdAtom = atom<number>({
    key: "FocusedKnodeIdAtom",
    default: -1
})

export const SwitchTimeoutAtom = atom<NodeJS.Timeout | undefined>({
    key: "SwitchTimeoutAtom",
    default: undefined
})

export const LastMovementAtom = atom<Dayjs>({
    key: "LastMovementAtom",
    default: dayjs()
})

// 这个current user并不是login user，而是用户当前访问的其他user
export const CurrentUserAtom = atom<User | undefined>({
    key: "CurrentUserAtom",
    default: undefined
})
export const CurrentUserIdSelector = selector<number>({
    key: "CurrentUserIdSelector",
    get: ({get})=>{
        const currentUser = get(CurrentUserAtom)
        return currentUser ? currentUser.id! : -1
    }
})
export const ExpandedKeysAtom = atom<Key[]>({
    key: "ExpandedKeysAtom",
    default: []
})

export const useBack = ()=>{
    const [currentUser, setCurrentUser] = useRecoilState(CurrentUserAtom)
    const loginUser = useRecoilValue(LoginUserAtom)
    const [knodeIdBeforeVisit, setKnodeIdBeforeVisit] = useRecoilState(KnodeIdBeforeVisitAtom)
    const setSelectedKnodeId = useSetRecoilState(SelectedKnodeIdAtom)
    return async ()=>{
        if(!loginUser) return
        if(currentUser?.id === loginUser?.id) return
        if(!knodeIdBeforeVisit || knodeIdBeforeVisit.length === 0) window.location.reload()
        let lastId = knodeIdBeforeVisit[knodeIdBeforeVisit.length-1]
        const knode = await getKnodeById(lastId)
        setCurrentUser(await getUserPublicInfo(knode.createBy))
        setKnodeIdBeforeVisit(knodeIdBeforeVisit.filter(id=>id!==lastId))
        knodeIdBeforeVisit && setSelectedKnodeId(lastId)
    }
}

export const useSearchBar = (): [string, (txt:string)=>void]=>{
    const ktreeFlat = useRecoilValue(KtreeFlatAtom)
    const [searchText, setSearchText] = useState<string>("")
    const setExpandedKeys = useSetRecoilState(ExpandedKeysAtom)

    const onSearchChange = (txt: string)=>{
        setSearchText(txt)
        let newExpandedKeys = ktreeFlat
            .filter(knode=>txt !== "" && knode.title.includes(txt))
            .map(knode=>knode.id);
        if(newExpandedKeys.length !== 0)
            setExpandedKeys(newExpandedKeys)
    }

    return [searchText, onSearchChange]
}

export const useShiftUp = ()=>{
    const shiftLeft = useShiftLeft()
    const [focusedKnodeId, setFocusedKnodeId] = useRecoilState(FocusedKnodeIdAtom)
    const focusedKnodeStem = useRecoilValue(FocusedKnodeStemSelector)
    return ()=>{
        if(!focusedKnodeStem) return
        const brotherIds  = focusedKnodeStem.branchIds
        if(brotherIds){
            const index = brotherIds.indexOf(focusedKnodeId)
            index === 0 ? shiftLeft() : setFocusedKnodeId(brotherIds[index - 1])
        }
    }
}
export const useShiftDown = ()=>{
    const shiftRight = useShiftRight()
    const [focusedKnodeId, setFocusedKnodeId] = useRecoilState(FocusedKnodeIdAtom)
    const focusedKnodeStem = useRecoilValue(FocusedKnodeStemSelector)
    return ()=>{
        if(!focusedKnodeStem) {
            shiftRight()
            return
        }
        const brotherIds = focusedKnodeStem.branchIds
        if(brotherIds){
            const index = brotherIds.indexOf(focusedKnodeId)
            index === brotherIds.length - 1 ? shiftRight(): setFocusedKnodeId(brotherIds[index+1])
        }
    }
}
export const useShiftLeft = ()=>{
    const focusedKnodeStem = useRecoilValue(FocusedKnodeStemSelector)
    const [, setFocusedKnodeId] = useRecoilState(FocusedKnodeIdAtom)
    return ()=>{
        if(!focusedKnodeStem) return
        setFocusedKnodeId(focusedKnodeStem.id)
    }
}
export const useShiftRight = ()=>{
    const focusedKnode = useRecoilValue(FocusedKnodeSelector)!
    const [, setFocusedKnodeId] = useRecoilState(FocusedKnodeIdAtom)
    return ()=>{
        if(!focusedKnode || focusedKnode.branchIds.length === 0) return
        setFocusedKnodeId(focusedKnode.branchIds[0])
    }
}
export const useHandleBranch = ()=>{
    const [focusedKnodeId, setFocusedKnodeId] = useRecoilState(FocusedKnodeIdAtom)
    const [ktreeFlat, setKtreeFlat] = useRecoilState(KtreeFlatAtom)
    const focusedKnode = useRecoilValue(FocusedKnodeSelector)
    const [expandedKeys, setExpandedKeys] = useRecoilState(ExpandedKeysAtom)
    return async () => {
        const knodeId = focusedKnodeId
        const newKnode = await branch(focusedKnodeId);
        setKtreeFlat(
            [...ktreeFlat, newKnode]
            .map(knode=>knode.id === knodeId ?
                ({...focusedKnode!, branchIds: [...focusedKnode!.branchIds!, newKnode.id]}):
                knode))
        setExpandedKeys([...expandedKeys, focusedKnodeId])
        setFocusedKnodeId(newKnode.id)
    }
}
export const useHandleRemove = ()=>{
    const focusedKnode = useRecoilValue(FocusedKnodeSelector)
    const [focusedKnodeId,] = useRecoilState(FocusedKnodeIdAtom)
    const messageApi = useRecoilValue(MessageApiAtom)
    const [ktreeFlat, setKtreeFlat] = useRecoilState(KtreeFlatAtom)
    const focusedKnodeStem = useRecoilValue(FocusedKnodeStemSelector)
    const shiftUp = useShiftUp()
    const removeKnodeIdInCurrentStudy = useRemoveKnodeId()
    return async () => {
        if(focusedKnode?.branchIds.length !== 0 || !focusedKnodeStem){
            messageApi.info("请先删除这个知识点的所有子节点")
            return
        }

        const stemId = focusedKnodeStem.id
        await removeKnode(focusedKnodeId)
        // 维护CurrentStudy的KnodeId的正确性
        await removeKnodeIdInCurrentStudy(focusedKnodeId)
        setKtreeFlat(
            ktreeFlat
            .filter(knode=>knode.id !== focusedKnodeId)
            .map(knode=>knode.id === stemId ?
                ({...focusedKnodeStem!, branchIds:focusedKnodeStem!.branchIds.filter(id=>id!==focusedKnodeId)}) :
                knode))
        shiftUp()
    }
}

export const useHandleSubscribe = ()=>{
    const knodeIdBeforeVisit = useRecoilValue(KnodeIdBeforeVisitAtom)
    const messageApi = useRecoilValue(MessageApiAtom)
    return async (knodeId: number)=>{
        if(!knodeIdBeforeVisit) return
        await subscribeKnode(knodeIdBeforeVisit[0], knodeId)
        messageApi.success("订阅知识点成功")
    }
}

export const useHandleConnect = (knodeId: number)=>{
    const [knodeConnectionTemp, setConnectionTemp] = useRecoilState(KnodeConnectionIdTempAtom)
    const [knode, setKnode] = useRecoilState(KnodeSelector(knodeId))
    const [other, setOther] = useRecoilState(KnodeSelector(knodeConnectionTemp!))

    return async ()=>{
        if(!knodeConnectionTemp || !knode || !other) return
        await connectKnode(knodeConnectionTemp, knodeId)
        setKnode({...knode, connectionIds: [knodeConnectionTemp]})
        setOther({...other, connectionIds: [knodeId]})
        setConnectionTemp(undefined)
    }
}

export const useHandleDisconnect = (knodeId: number)=>{
    const [knode, setKnode] = useRecoilState(KnodeSelector(knodeId))
    return async ()=>{
        if (!knode || knode?.connectionIds.length === 0) return
        await disconnectKnode(knodeId, knode.connectionIds[0]!)
        setKnode({...knode, connectionIds: []})
    }
}



export const useEditTitle = ()=>{
    const setTitleEditKnodeId = useSetRecoilState(TitleEditKnodeIdAtom);
    const selectedId = useRecoilValue(FocusedKnodeIdAtom)
    return ()=> setTitleEditKnodeId(selectedId)
}
export const useKnodeShiftUp = ()=>{
    const stem = useRecoilValue(SelectedKnodeStemSelector)
    const selectedId = useRecoilValue(SelectedKnodeIdAtom)
    const setKtreeFlat = useSetRecoilState(KtreeFlatAtom)
    return async ()=>{
        if(!stem) return
        const brotherIds = stem.branchIds
        const index = brotherIds.indexOf(selectedId)
        if(index === 0) return
        swapBranchIndex(stem.id, index, index - 1)
        setKtreeFlat(ktreeFlat=>{
            return ktreeFlat.map(knode=>{
                if(knode.id === selectedId)
                    return {...knode, index: index - 1}
                else if(knode.id === brotherIds[index-1])
                    return {...knode, index: index}
                else if(knode.id === stem.id)
                    return {...knode, branchIds: knode.branchIds.map(br=>
                            br === brotherIds[index] ? brotherIds[index-1] :
                            br === brotherIds[index-1] ? brotherIds[index] : br)}
                else return knode
            })
        })
    }
}
export const useKnodeShiftDown = ()=>{
    const stem = useRecoilValue(SelectedKnodeStemSelector)
    const selectedId = useRecoilValue(SelectedKnodeIdAtom)
    const setKtreeFlat = useSetRecoilState(KtreeFlatAtom)
    return async ()=>{
        if(!stem) return
        const brotherIds = stem.branchIds
        const index = brotherIds.indexOf(selectedId)
        if(index === brotherIds.length - 1) return
        swapBranchIndex(stem.id, index, index + 1)
        setKtreeFlat((ktreeFlat)=>{
            return ktreeFlat.map(knode=>{
                if(knode.id === selectedId)
                    return {...knode, index: index + 1}
                else if(knode.id === brotherIds[index + 1])
                    return {...knode, index: index}
                else if(knode.id === stem.id)
                    return {...knode, branchIds: knode.branchIds.map(br=>
                            br === brotherIds[index] ? brotherIds[index + 1] :
                                br === brotherIds[index + 1] ? brotherIds[index] : br)}
                else return knode
            })
        })
    }
}
export const useScissorKnode = ()=>{
    const [scissored, setScissored] = useRecoilState(ScissoredKnodeIdsAtom)
    return (knodeId: number)=> setScissored([...scissored, knodeId])
}
export const usePasteSelectedKnode = ()=>{
    const [scissored, setScissored] = useRecoilState(ScissoredKnodeIdsAtom)
    const selectedId = useRecoilValue(FocusedKnodeIdAtom)
    const setKtreeFlat = useSetRecoilState(KtreeFlatAtom)
    return async ()=>{
        setKtreeFlat(await shiftKnode(selectedId, scissored))
        setScissored([])
    }
}
export const useHotkeys = ()=>{

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const shiftUp = useShiftUp()
    const shiftDown = useShiftDown()
    const shiftRight = useShiftRight()
    const shiftLeft = useShiftLeft()
    const handleBranch = useHandleBranch()
    const handleRemove = useHandleRemove()
    const editTitle = useEditTitle()
    const knodeShiftUp = useKnodeShiftUp()
    const knodeShiftDown = useKnodeShiftDown()
    const scissorSelectedKnode = useScissorKnode()
    const pasteSelectedKnode = usePasteSelectedKnode()
    const readonly = useRecoilValue(ReadonlyModeAtom)

    return (event: React.KeyboardEvent<HTMLDivElement>)=>{
        if(event.ctrlKey && event.key === "ArrowUp")
            shiftUp()
        else if(event.ctrlKey && event.key === "ArrowDown")
            shiftDown()
        else if(event.ctrlKey && event.key === "ArrowRight")
            shiftRight()
        else if(event.ctrlKey && event.key === "ArrowLeft")
            shiftLeft()
        else if(event.ctrlKey && event.key === "Enter" && !readonly)
            handleBranch().then()
        else if(event.ctrlKey && event.key === "Backspace" && !readonly)
            handleRemove().then()
        else if(!event.ctrlKey && event.key === "Enter" && !readonly)
            editTitle()
        else if(event.altKey && event.key === "ArrowUp" && !readonly)
            knodeShiftUp().then()
        else if(event.altKey && event.key === "ArrowDown" && !readonly)
            knodeShiftDown().then()
        else if(event.ctrlKey && event.altKey && event.key === "x" && !readonly)
            scissorSelectedKnode(selectedKnodeId)
        else if(event.ctrlKey && event.altKey && event.key === "v" && !readonly)
            pasteSelectedKnode().then()
    }
}

export const useVisit = ()=>{
    const setCurrentPage = useSetRecoilState(CurrentPageAtom)
    const setCurrentUser = useSetRecoilState(CurrentUserAtom)
    const setCurrentTab = useSetRecoilState(CurrentTabAtom)
    const [knodeIdBeforeVisit, setKnodeIdBeforeVisit] = useRecoilState(KnodeIdBeforeVisitAtom)
    const [selectedKnodeId, setSelectedKnodeId] = useRecoilState(SelectedKnodeIdAtom)
    const [, setFocusedKnodeId] = useRecoilState(FocusedKnodeIdAtom)
    return async (owner: User, knodeId?: number)=>{
        setKnodeIdBeforeVisit([...knodeIdBeforeVisit, selectedKnodeId])
        setCurrentUser(owner)
        setSelectedKnodeId(knodeId || -1)
        setFocusedKnodeId(knodeId || -1)
        setCurrentTab("note")
        setCurrentPage("main")
    }
}

export const useJumpToKnode = ()=>{
    const userId = useRecoilValue(LoginUserIdSelector)
    const [,setSelectedKnodeId] = useRecoilState(SelectedKnodeIdAtom)
    const [,setEnhancerPanelCurrentPage] = useRecoilState(EnhancerPanelCurrentPageAtom)
    const [,setStudyTraceTimelineCurrentPage] = useRecoilState(StudyTraceTimelineCurrentPageAtom);
    const setCurrentPage = useSetRecoilState(CurrentPageAtom)
    const setCurrentUser = useSetRecoilState(CurrentUserAtom)
    const setCurrentTab = useSetRecoilState(CurrentTabAtom)
    const visit = useVisit();
    return async (knodeId: number)=>{
        const knode = await getKnodeById(knodeId)
        if(knode.createBy !== userId)
            await visit(await getUserPublicInfo(knode.createBy), knodeId)
        setCurrentPage("main")
        setCurrentUser(await getUserPublicInfo(knode.createBy))
        setCurrentTab("note")
        setSelectedKnodeId(knodeId)
        setEnhancerPanelCurrentPage(1)
        setStudyTraceTimelineCurrentPage(1)
    }
}

export const useHotkeysHelp = (): string=>{
    return (
`
### 快捷键汇总  
> $ctrl$ + $\\leftarrow$ / $\\rightarrow$ / $\\uparrow$ / $\\downarrow$ : 移动光标  
> $ctrl$ + $enter$ : 添加当前知识点的子知识点  
> $ctrl$ + $backspace$ : 删除当前知识点  
> $enter$ : 编辑当前知识点  
> $shift + enter$ : 完成对当前知识点的编辑  
> $ctrl + alt + X$ : 剪切当前知识点  
> $ctrl + alt + V$ : 粘贴知识点  
> $alt$ + $\\uparrow$ / $\\downarrow$ : 上下移动当前知识点的位置
`
    )
}
