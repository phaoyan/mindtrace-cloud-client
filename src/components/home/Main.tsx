import React, {Key, useEffect, useRef, useState} from 'react';
import {User} from "../../recoil/User";
import {useRecoilState, useRecoilValue} from "recoil";
import {Tree} from "antd";
import {
    CheckOutlined,
    MinusOutlined,
    NodeCollapseOutlined,
    NodeExpandOutlined,
    PlusOutlined,
    ScissorOutlined
} from "@ant-design/icons";
import "../../service/api/api.ts"
import {branch, getKnodes, removeKnode, shiftKnode, swapBranchIndex} from "../../service/api/KnodeApi";
import {
    appendToKtree,
    constructKtree, getBrotherBranchIds,
    Ktree,
    KtreeAntd, removeFromKtree
} from "../../service/data/Knode";
import classes from "./Main.module.css"
import utils from "../../utils.module.css"
import InfoRight from "./info/InfoRight";
import {KtreeAtom, SelectedKnodeIdAtom} from "../../recoil/home/Knode";
import {MarkdownInlineContext} from "../../recoil/utils/MarkdownInline";
import KnodeTitle from "./KnodeTitle";
import {RESULT} from "../../constants";


const Main = () => {
    const {id: userId} = useRecoilValue(User);

    const [selectedId, setSelectedId] = useRecoilState<number>(SelectedKnodeIdAtom)

    const loadKtree = ()=>{
        console.log(`user:${userId} -> ktree`)
        getKnodes(userId)
            .then((data) => {
                console.log(data)
                try {
                    setKtree(constructKtree(data))
                } catch (e) {}
            })
    }

    // user -> ktree
    const [ktree, setKtree] = useRecoilState<Ktree>(KtreeAtom)
    useEffect(() => {
        loadKtree()
        // eslint-disable-next-line
    }, [userId])

    // selectedId -> selectedKeys
    const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
    useEffect(() => setSelectedKeys([selectedId]), [selectedId])


    const markdownInlinePossessor = useRef(null)
    const convertKtreeAntd = (ori: Array<Ktree | null>): KtreeAntd[] => {
        if (ori[0] == null) return []
        return ori.map(ktree => ({
            // @ts-ignore
            key: ktree.knode.id,
            // @ts-ignore
            title: (<KnodeTitle
                    id={ktree?.knode.id!}
                    possessorRef={markdownInlinePossessor.current!}/>),
            // @ts-ignore
            children: convertKtreeAntd(ktree.branches)
        }))
    }

    // ktree -> ktreeAntd
    const [ktreeAntd, setKtreeAntd] = useState<KtreeAntd[]>([])
    useEffect(() => {
        console.log("ktree -> ktreeAntd", ktree)
        setKtreeAntd(convertKtreeAntd([ktree]))
    // eslint-disable-next-line
    }, [ktree])

    useEffect(()=>{
        console.log(ktreeAntd)
    }, [ktreeAntd])



    const getKtreeById = (id: number)=>{
        let temp = [ktree]
        while (temp.length !== 0) {
            let cur = temp.pop()!
            if (cur.knode.id === id) {
                return cur
            } else temp = [...temp, ...cur.branches]
        }
    }

    const getOffspringIds = (ktree: Ktree): number[] => {
        if (!ktree) return []
        let res = [ktree.knode.id]
        for (let branch of ktree.branches)
            res = [...res, ...getOffspringIds(branch)]
        return res;
    }

    const getOffspringIdsOfSelected = (): number[] => {
        if (selectedKtree)
            return getOffspringIds(selectedKtree)
        else return []
    }

    const handleBranch = () => {
        branch(userId, selectedId)
            .then((data) => {
                console.log("handle branch", data)
                setKtree(appendToKtree({...ktree}, {knode: data, branches: []}))
                setExpendedKeys([...expandedKeys, selectedId])
                setSelectedId(data.id)
            })
    }
    const handleRemove = () => {
        removeKnode(userId, selectedId)
            .then(() => {
                let temp = selectedKtree?.knode.stemId
                console.log("temp", temp)
                setKtree(removeFromKtree({...ktree}, selectedId))
                setSelectedId(temp as number)
            })
    }

    // 实现按上箭头向上选中knode
    const shiftUp = ()=>{
        let brotherIds = getBrotherBranchIds(ktree, selectedId);
        if(brotherIds){
            let index = brotherIds.indexOf(selectedId);
            if(index === 0)
                shiftLeft()
            else
                setSelectedId(brotherIds[index - 1])
        }
    }

    // 实现下箭头向下选中knode
    const shiftDown = ()=>{
        let brotherIds = getBrotherBranchIds(ktree, selectedId);
        if(brotherIds){
            let index = brotherIds.indexOf(selectedId);
            if(index === brotherIds.length - 1)
                shiftRight()
            else
                setSelectedId(brotherIds[index + 1])
        }
    }

    // 实现右箭头向右选中子节点，顺便展开
    const shiftRight = ()=>{
        if(selectedKtree?.branches && selectedKtree.branches.length !== 0) {
            if(!expandedKeys.includes(selectedId))
                setExpendedKeys([...expandedKeys, selectedId])
            setSelectedId(selectedKtree.branches[0].knode.id)
        }
    }

    // 实现左箭头向左选中父节点
    const shiftLeft = ()=>{
        if(selectedKtree?.knode.stemId){
            setExpendedKeys(expandedKeys.filter(key=>key !== selectedId))
            setSelectedId(selectedKtree.knode.stemId)
        }
    }

    const [markdownInlineEdit, setMarkdownInlineEdit] = useState(0)
    const editTitle = ()=>{
        console.log("edit title")
        setMarkdownInlineEdit(selectedId)
        // 在完成更新效果后，清零markdownInlineEdit，目的是
        // 在连续两次setMarkdownInlineEdit为同一值时不至于无响应
        setTimeout(()=>setMarkdownInlineEdit(0), 10)
    }

    const knodeShiftUp = ()=>{
        let branchIds = getBrotherBranchIds(ktree, selectedId)!;
        let index = branchIds?.indexOf(selectedId);
        if(index === 0) return
        selectedKtree!.knode.stemId &&
        swapBranchIndex(userId, selectedKtree!.knode.stemId, index, index-1)
            .then((data)=>data.code === RESULT.OK && loadKtree())
    }

    const knodeShiftDown = ()=>{
        let branchIds = getBrotherBranchIds(ktree, selectedId)!;
        let index = branchIds?.indexOf(selectedId);
        if(index === branchIds.length - 1) return
        selectedKtree!.knode.stemId &&
        swapBranchIndex(userId, selectedKtree!.knode.stemId, index, index+1)
            .then((data)=>data.code === RESULT.OK && loadKtree())
    }

    const [scissoredId, setScissoredId] = useState<number | undefined>(undefined)
    const scissorSelectedKnode = ()=>{
        scissoredId !== 0 &&
        setScissoredId(selectedId)
    }
    const pasteSelectedKnode = ()=>{
        scissoredId &&
        shiftKnode(userId, selectedId, scissoredId)
            .then((data)=> {
                setKtree(constructKtree(data))
            })
            .then(()=>setScissoredId(undefined))
    }

    // selectedId -> selectedKtree
    const [selectedKtree, setSelectedKtree] = useState<Ktree>()
    useEffect(() => {
        selectedId &&
        setSelectedKtree(getKtreeById(selectedId))
    // eslint-disable-next-line
    }, [ktree, selectedId])
    // useEffect(()=>{
    //     console.log("selected ktree", selectedKtree)
    // }, [selectedKtree])

    // selected knode expanded
    const [expandedKeys, setExpendedKeys] = useState<Key[]>([])
    const [selectedKnodeExpanded, setSelectedKnodeExpanded] = useState<boolean>(false)
    useEffect(() => {
        // console.log("SELECTED", selectedKtree?.knode, ktree, knodeRepo)
        setSelectedKnodeExpanded(
            selectedKtree ?
                selectedKtree.branches.map(ktree => ktree.knode.id).every(id => expandedKeys.includes(id)) : false)
    }, [expandedKeys, ktree, selectedId, selectedKtree])

    const ktreeHotkey = (event: React.KeyboardEvent<HTMLDivElement>)=>{
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

    // @ts-ignore
    return (
        <div className={classes.container}>
            <div className={classes.main} tabIndex={0} onKeyDown={ktreeHotkey} ref={markdownInlinePossessor}>
                <div className={classes.main_toolbar}>
                    <PlusOutlined
                        className={utils.icon_button}
                        onClick={handleBranch}/>
                    <MinusOutlined
                        className={utils.icon_button}
                        onClick={handleRemove}/>
                    {scissoredId ?
                        <CheckOutlined
                            className={utils.icon_button}
                            onClick={pasteSelectedKnode}/>:
                        <ScissorOutlined
                            className={utils.icon_button}
                            onClick={scissorSelectedKnode}/>
                    }
                    {selectedKnodeExpanded ?
                        <NodeCollapseOutlined className={"icon-button"} onClick={() => {
                            setExpendedKeys(expandedKeys.filter(key => !getOffspringIdsOfSelected().includes(key as number)))
                        }}/> :
                        <NodeExpandOutlined className={"icon-button"} onClick={() => {
                            setExpendedKeys([...expandedKeys, ...getOffspringIdsOfSelected()])
                        }}/>
                    }
                </div>
                <div className={`${classes.tree_wrapper} ${utils.custom_scrollbar} ${utils.left_scrollbar}`}>
                        <MarkdownInlineContext.Provider value={markdownInlineEdit}>
                            <Tree
                                showLine={true}
                                selectedKeys={selectedKeys}
                                // @ts-ignore
                                onSelect={(selectedKeys) => {
                                    setSelectedId(selectedKeys[0]?.valueOf() as number)
                                }}
                                treeData={ktreeAntd}
                                expandedKeys={expandedKeys}
                                onExpand={(expandedKeys) => {
                                    setExpendedKeys(expandedKeys)
                                }}/>
                        </MarkdownInlineContext.Provider>
                </div>

            </div>
            {selectedId !== 0 && <InfoRight/>}
        </div>
    );
};

export default Main;