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

export const ExpandedKeysAtom = atom<Key[]>({
    key: "ExpandedKeysAtom",
    default: []
})

export const SelectedKnodeExpandedSelector = selector<boolean>({
    key: "SelectedKnodeExpandedSelector",
    get: ({get})=>{
        const selectedKtree = get(SelectedKtreeSelector)
        const expandedKeys = get(ExpandedKeysAtom)
        return !!selectedKtree && selectedKtree.branches.map(ktree => ktree.knode.id).every(id => expandedKeys.includes(id))
    }
})

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
    const [selectedId, setSelectedId] = useRecoilState(SelectedKnodeIdAtom)
    const [expandedKeys, setExpandedKeys] = useRecoilState(ExpandedKeysAtom)
    return ()=>{
        if(!selectedKnodeStem) return
        setExpandedKeys(expandedKeys.filter(key=>key !== selectedId))
        setSelectedId(selectedKnodeStem.id)
    }
}
export const useShiftRight = ():(()=>void)=>{
    const selectedKnode = useRecoilValue(SelectedKnodeSelector)!
    const [selectedId, setSelectedId] = useRecoilState(SelectedKnodeIdAtom)
    const [expandedKeys, setExpandedKeys] = useRecoilState(ExpandedKeysAtom)
    return ()=>{
        if(selectedKnode.branchIds.length === 0) return
        !expandedKeys.includes(selectedId) && setExpandedKeys([...expandedKeys, selectedKnode.id])
        setSelectedId(selectedKnode.branchIds[0])
    }
}
export const useHandleBranch = ():(()=>void)=>{
    const [selectedId, setSelectedId] = useRecoilState(SelectedKnodeIdAtom)
    const [ktreeFlat, setKtreeFlat] = useRecoilState(KtreeFlatAtom)
    const [selectedKnodeStem, setSelectedKnodeStem] = useRecoilState(SelectedKnodeStemSelector)
    const [expandedKeys, setExpandedKeys] = useRecoilState(ExpandedKeysAtom)
    return async () => {
        const newKnode = await branch(selectedId);
        setKtreeFlat([...ktreeFlat, newKnode])
        setSelectedKnodeStem({...selectedKnodeStem!, branchIds: [...selectedKnodeStem!.branchIds!, newKnode.id]})
        setExpandedKeys([...expandedKeys, selectedId])
        setSelectedId(newKnode.id)
    }
}
export const useHandleRemove = ():any=>{
    const selectedKtree = useRecoilValue(SelectedKtreeSelector)
    const [selectedId, setSelectedId] = useRecoilState(SelectedKnodeIdAtom)
    const messageApi = useRecoilValue(MessageApiAtom)
    const [ktreeFlat, setKtreeFlat] = useRecoilState(KtreeFlatAtom)
    const [selectedKnodeStem, setSelectedKnodeStem] = useRecoilState(SelectedKnodeStemSelector)
    return async () => {
        if(selectedKtree?.branches.length !== 0){
            messageApi.info("请先删除这个知识点的所有子节点")
            return
        }
        await removeKnode(selectedId)
        setSelectedKnodeStem({...selectedKnodeStem!, branchIds:selectedKnodeStem!.branchIds.filter(id=>id!==selectedId)})
        setKtreeFlat(ktreeFlat.filter(knode=>knode.id !== selectedId))
        setSelectedId(selectedKtree?.knode.stemId!)
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
    const [ktreeFlat, setKtreeFlat] = useRecoilState(KtreeFlatAtom)
    return async ()=>{
        if(!stem) return
        const brotherIds = stem.branchIds
        const index = brotherIds.indexOf(selectedId)
        if(index === 0) return
        await swapBranchIndex(stem.id, index, index - 1)
        setKtreeFlat(ktreeFlat.map(knode=>{
            if(knode.id === selectedId)
                return {...knode, index: index - 1}
            else if(knode.id === brotherIds[index] - 1)
                return {...knode, index: index}
            else return knode
        }))
    }
}
export const useKnodeShiftDown = ():(()=>void)=>{
    const stem = useRecoilValue(SelectedKnodeStemSelector)
    const selectedId = useRecoilValue(SelectedKnodeIdAtom)
    const [ktreeFlat, setKtreeFlat] = useRecoilState(KtreeFlatAtom)
    return async ()=>{
        if(!stem) return
        const brotherIds = stem.branchIds
        const index = brotherIds.indexOf(selectedId)
        if(index === brotherIds.length - 1) return
        await swapBranchIndex(stem.id, index, index + 1)
        setKtreeFlat(ktreeFlat.map(knode=>{
            if(knode.id === selectedId)
                return {...knode, index: index + 1}
            else if(knode.id === brotherIds[index] + 1)
                return {...knode, index: index}
            else return knode
        }))
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

    return (event: React.KeyboardEvent<HTMLDivElement>)=>{
        if(event.ctrlKey && event.key === "ArrowUp")
            shiftUp()
        else if(event.ctrlKey && event.key === "ArrowDown")
            shiftDown()
        else if(event.ctrlKey && event.key === "ArrowRight")
            shiftRight()
        else if(event.ctrlKey && event.key === "ArrowLeft")
            shiftLeft()
        else if(event.ctrlKey && event.key === "Enter")
            handleBranch()
        else if(event.ctrlKey && event.key === "Backspace")
            handleRemove()
        else if(!event.ctrlKey && event.key === "Enter")
            editTitle()
        else if(event.altKey && event.key === "ArrowUp")
            knodeShiftUp()
        else if(event.altKey && event.key === "ArrowDown")
            knodeShiftDown()
        else if(event.ctrlKey && event.altKey && event.key === "x")
            scissorSelectedKnode()
        else if(event.ctrlKey && event.altKey && event.key === "v")
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
