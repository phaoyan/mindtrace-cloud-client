import React, {Key, useState} from "react";
import {atom, selector, useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {
    KtreeFlatAtom, ScissoredKnodeIdAtom,
    SelectedKnodeIdAtom,
    SelectedKnodeSelector,
    SelectedKnodeStemSelector, SelectedKtreeSelector
} from "../../../recoil/home/Knode";
import {branch, removeKnode, shiftKnode, swapBranchIndex} from "../../../service/api/KnodeApi";
import {TitleEditKnodeIdAtom} from "../KnodeTitle/KnodeTitleHooks";
import {MessageApiAtom} from "../../../recoil/utils/DocumentData";
import {User} from "../../../service/data/Gateway";
import {LoginUserAtom} from "../../Login/LoginHooks";
import {KnodeIdBeforeVisitAtom} from "../InfoRight/SharePanel/KnodeShareCard/KnodeShareCardHooks";

export const ReadonlyModeAtom = atom<boolean>({
    key: "ReadonlyModeAtom",
    default: false
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

export const useBackHome = ()=>{
    const [currentUser, setCurrentUser] = useRecoilState(CurrentUserAtom)
    const loginUser = useRecoilValue(LoginUserAtom)
    const knodeIdBeforeVisit = useRecoilValue(KnodeIdBeforeVisitAtom)
    const setSelectedKnodeId = useSetRecoilState(SelectedKnodeIdAtom)
    return ()=>{
        if(currentUser?.id === loginUser?.id) return
        setCurrentUser(loginUser!)
        knodeIdBeforeVisit && setSelectedKnodeId(knodeIdBeforeVisit)
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

export const useShiftUp = ():(()=>void)=>{
    const shiftLeft = useShiftLeft()
    const [selectedId, setSelectedId] = useRecoilState(SelectedKnodeIdAtom)
    const selectedKnodeStem = useRecoilValue(SelectedKnodeStemSelector)
    return ()=>{
        if(!selectedKnodeStem) return
        const brotherIds  = selectedKnodeStem.branchIds
        if(brotherIds){
            const index = brotherIds.indexOf(selectedId)
            index === 0 ? shiftLeft() : setSelectedId(brotherIds[index - 1])
        }
    }
}
export const useShiftDown = ():(()=>void)=>{
    const shiftRight = useShiftRight()
    const [selectedId, setSelectedId] = useRecoilState(SelectedKnodeIdAtom)
    const selectedKnodeStem = useRecoilValue(SelectedKnodeStemSelector)
    return ()=>{
        if(!selectedKnodeStem) {
            shiftRight()
            return
        }
        const brotherIds = selectedKnodeStem.branchIds
        if(brotherIds){
            const index = brotherIds.indexOf(selectedId)
            index === brotherIds.length - 1 ? shiftRight(): setSelectedId(brotherIds[index+1])
        }
    }
}
export const useShiftLeft = ():(()=>void)=>{
    const selectedKnodeStem = useRecoilValue(SelectedKnodeStemSelector)
    const [, setSelectedId] = useRecoilState(SelectedKnodeIdAtom)
    return ()=>{
        if(!selectedKnodeStem) return
        setSelectedId(selectedKnodeStem.id)
    }
}
export const useShiftRight = ():(()=>void)=>{
    const selectedKnode = useRecoilValue(SelectedKnodeSelector)!
    const [, setSelectedId] = useRecoilState(SelectedKnodeIdAtom)
    return ()=>{
        if(selectedKnode.branchIds.length === 0) return
        setSelectedId(selectedKnode.branchIds[0])
    }
}
export const useHandleBranch = ():(()=>void)=>{
    const [selectedId, setSelectedId] = useRecoilState(SelectedKnodeIdAtom)
    const [ktreeFlat, setKtreeFlat] = useRecoilState(KtreeFlatAtom)
    const selectedKnode = useRecoilValue(SelectedKnodeSelector)
    const [expandedKeys, setExpandedKeys] = useRecoilState(ExpandedKeysAtom)
    return async () => {
        const knodeId = selectedId
        const newKnode = await branch(selectedId);
        setKtreeFlat(
            [...ktreeFlat, newKnode]
            .map(knode=>knode.id === knodeId ?
                ({...selectedKnode!, branchIds: [...selectedKnode!.branchIds!, newKnode.id]}):
                knode))
        setExpandedKeys([...expandedKeys, selectedId])
        setSelectedId(newKnode.id)
    }
}
export const useHandleRemove = ():any=>{
    const selectedKtree = useRecoilValue(SelectedKtreeSelector)
    const [selectedId,] = useRecoilState(SelectedKnodeIdAtom)
    const messageApi = useRecoilValue(MessageApiAtom)
    const [ktreeFlat, setKtreeFlat] = useRecoilState(KtreeFlatAtom)
    const selectedKnodeStem = useRecoilValue(SelectedKnodeStemSelector)
    const shiftUp = useShiftUp()
    return async () => {
        if(selectedKtree?.branches.length !== 0 || !selectedKnodeStem){
            messageApi.info("请先删除这个知识点的所有子节点")
            return
        }

        const stemId = selectedKnodeStem.id
        await removeKnode(selectedId)
        setKtreeFlat(
            ktreeFlat
            .filter(knode=>knode.id !== selectedId)
            .map(knode=>knode.id === stemId ?
                ({...selectedKnodeStem!, branchIds:selectedKnodeStem!.branchIds.filter(id=>id!==selectedId)}) :
                knode))
        shiftUp()
    }
}
export const useEditTitle = ():(()=>void)=>{
    const setTitleEditKnodeId = useSetRecoilState(TitleEditKnodeIdAtom);
    const selectedId = useRecoilValue(SelectedKnodeIdAtom)
    return ()=> setTitleEditKnodeId(selectedId)
}
export const useKnodeShiftUp = ():(()=>void)=>{
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
export const useKnodeShiftDown = ():(()=>void)=>{
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
export const useScissorSelectedKnode = ():(()=>void)=>{
    const setScissored = useSetRecoilState(ScissoredKnodeIdAtom)
    const selectedId = useRecoilValue(SelectedKnodeIdAtom);
    return ()=> setScissored(selectedId)
}
export const usePasteSelectedKnode = ():(()=>void)=>{
    const [scissored, setScissored] = useRecoilState(ScissoredKnodeIdAtom)
    const selectedId = useRecoilValue(SelectedKnodeIdAtom)
    const setKtreeFlat = useSetRecoilState(KtreeFlatAtom)
    return async ()=>{
        scissored && setKtreeFlat(await shiftKnode(selectedId, scissored))
        setScissored(undefined)
    }
}
export const useHotkeys = ()=>{

    const shiftUp = useShiftUp()
    const shiftDown = useShiftDown()
    const shiftRight = useShiftRight()
    const shiftLeft = useShiftLeft()
    const handleBranch = useHandleBranch()
    const handleRemove = useHandleRemove()
    const editTitle = useEditTitle()
    const knodeShiftUp = useKnodeShiftUp()
    const knodeShiftDown = useKnodeShiftDown()
    const scissorSelectedKnode = useScissorSelectedKnode()
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
            handleBranch()
        else if(event.ctrlKey && event.key === "Backspace" && !readonly)
            handleRemove()
        else if(!event.ctrlKey && event.key === "Enter" && !readonly)
            editTitle()
        else if(event.altKey && event.key === "ArrowUp" && !readonly)
            knodeShiftUp()
        else if(event.altKey && event.key === "ArrowDown" && !readonly)
            knodeShiftDown()
        else if(event.ctrlKey && event.altKey && event.key === "x" && !readonly)
            scissorSelectedKnode()
        else if(event.ctrlKey && event.altKey && event.key === "v" && !readonly)
            pasteSelectedKnode()
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
