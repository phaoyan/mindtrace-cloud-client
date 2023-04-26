import React, {Key, useEffect, useRef, useState} from 'react';
import {User} from "../../recoil/User";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {Divider, Input, message, Popover, Tree} from "antd";
import {
    CheckOutlined,
    MinusOutlined,
    NodeCollapseOutlined,
    NodeExpandOutlined,
    PlusOutlined, QuestionCircleOutlined,
    ScissorOutlined
} from "@ant-design/icons";
import "../../service/api/api.ts"
import {branch, getKnodes, removeKnode, shiftKnode, swapBranchIndex} from "../../service/api/KnodeApi";
import {
    appendToKtree,
    constructKtree, getBrotherBranchIds, Knode,
    Ktree,
    KtreeAntd, removeFromKtree, updateKtree, updateKtreeBatch
} from "../../service/data/Knode";
import classes from "./Main.module.css"
import utils from "../../utils.module.css"
import InfoRight from "./info/InfoRight";
import {getKnode, KtreeAtom, SelectedKnodeIdAtom, SelectedKnodeSelector} from "../../recoil/home/Knode";
import {MarkdownInlineContext} from "../../recoil/utils/MarkdownInline";
import KnodeTitle from "./KnodeTitle";
import {RESULT} from "../../constants";
import TraceInfo from "./trace/TraceInfo";
import {MainPageHeightAtom, MainPageWidthAtom} from "../../recoil/utils/DocumentData";
import {MilkdownEditor} from "../utils/markdown/MilkdownEditor";
import {MilkdownProvider} from "@milkdown/react";
import {SelectedLeafIdsAtom} from "../../recoil/home/Mindtrace";
import {LearningTraceAtom} from "../../recoil/LearningTrace";


const Main = () => {

    // 指定Main页面的宽高：本组件和InfoRight的ResizableBox需要用到
    const mainPageRef = useRef<HTMLDivElement>(null)
    const [mainPageHeight, setMainPageHeight] = useRecoilState(MainPageHeightAtom)
    const setMainPageWidth = useSetRecoilState(MainPageWidthAtom)
    useEffect(()=>{
        if(mainPageRef.current){
            setMainPageHeight(mainPageRef.current.scrollHeight)
            setMainPageWidth(mainPageRef.current.scrollWidth)
        }
        // eslint-disable-next-line
    },[])


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

    // 实现搜索Knode
    const [searchTxt, setSearchTxt] = useState<string>("")
    const getKnodeList = (tree: Ktree): Knode[]=>{
        let res: Knode[] = [tree.knode]
        for(let br of tree.branches)
            res = [...res, ...getKnodeList(br)]
        return res
    }
    const onSearchChange = (txt: string)=>{
        setSearchTxt(txt)
        let newExpandedKeys = getKnodeList(ktree)
            .filter(knode=>txt !== "" && knode.title.includes(txt))
            .map(knode=>knode.id);
        if(newExpandedKeys.length !== 0)
            setExpendedKeys(newExpandedKeys)
    }

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

    const learningTrace = useRecoilValue(LearningTraceAtom)
    const [selectedLeafIds, setSelectedLeafIds] = useRecoilState(SelectedLeafIdsAtom)
    const selectedKnode = useRecoilValue(SelectedKnodeSelector)
    const handleBranch = () => {
        branch(userId, selectedId)
            .then((data) => {
                console.log("handle branch", data)
                const stemId = selectedId
                updateKtree(ktree, {
                    ...selectedKnode!,
                    branchIds: [...selectedKnode?.branchIds!, data.id]
                })
                setKtree(appendToKtree({...ktree}, {knode: data, branches: []}))
                setExpendedKeys([...expandedKeys, selectedId])
                setSelectedId(data.id)
                // 默认添加branch的时候尝试将它放到learning trace中，当然如果没有开启learning trace的话不算
                learningTrace &&
                setSelectedLeafIds([...selectedLeafIds.filter(id=>id !== stemId), data.id])
            })
    }

    const [messageApi, contextHolder] = message.useMessage()
    const handleRemove = () => {
        if(selectedKtree?.branches.length === 0)
            removeKnode(userId, selectedId)
                .then(() => {
                    let temp = selectedKtree?.knode.stemId
                    let stem = getKnode(ktree, temp!)
                    updateKtree(ktree, {
                        ...stem!,
                        branchIds: stem!.branchIds.filter(id=>id !== selectedId)
                    })
                    setSelectedLeafIds(selectedLeafIds.filter(id=>id!==selectedId))
                    setKtree(removeFromKtree({...ktree}, selectedId))
                    setSelectedId(temp as number)
                })
        else {
            messageApi.info("请先删除这个知识点的所有子节点")
        }
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
        let stemId = selectedKtree!.knode.stemId;
        stemId &&
        swapBranchIndex(userId, stemId, index, index-1)
            .then((data)=> {
                if(data.code === RESULT.OK){
                    let stem = getKtreeById(stemId!)!;
                    setKtree(constructKtree(
                        getKnodeList(updateKtreeBatch({...ktree},
                        [
                            {...stem.branches[index].knode, index: index-1},
                            {...stem.branches[index-1].knode, index: index}
                        ]))))
                }
            })
    }

    const knodeShiftDown = ()=>{
        let branchIds = getBrotherBranchIds(ktree, selectedId)!;
        let index = branchIds?.indexOf(selectedId);
        if(index === branchIds.length - 1) return
        let stemId = selectedKtree!.knode.stemId;
        stemId &&
        swapBranchIndex(userId, stemId, index, index+1)
            .then((data)=>{
                if(data.code === RESULT.OK){
                    let stem = getKtreeById(stemId!)!
                    setKtree(constructKtree(
                        getKnodeList(updateKtreeBatch({...ktree},
                            [
                                {...stem.branches[index].knode, index: index+1},
                                {...stem.branches[index+1].knode, index: index}
                            ]))))
                }
            })
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

    const hotkeyHelp =
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

    // @ts-ignore
    return (
        <div className={classes.container} ref={mainPageRef}>
            {contextHolder}
            <div
                className={classes.main}
                style={{height: mainPageHeight * 0.85 }}
                tabIndex={0}
                onKeyDown={ktreeHotkey} ref={markdownInlinePossessor}>
                <div className={classes.main_toolbar}>
                    <div className={classes.search_wrapper}>
                        <Input
                            bordered={false}
                            placeholder={"搜索知识. . ."}
                            className={classes.search}
                            value={searchTxt}
                            onChange={({target: {value}})=>onSearchChange(value)}/>
                        <Divider className={utils.ghost_horizontal_divider} style={{minWidth:"20vw"}}/>
                    </div>

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
                    <Popover
                        placement={"bottomLeft"}
                        arrow={false}
                        content={(
                            <div className={classes.help_hotkey}>
                                <MilkdownProvider>
                                    <MilkdownEditor
                                        md={hotkeyHelp}
                                        editable={true}
                                        onChange={(cur, prev)=>{}}/>
                                </MilkdownProvider>
                            </div>
                        )}>
                        <QuestionCircleOutlined className={utils.icon_button}/>
                    </Popover>
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
                                autoExpandParent={true}
                                onExpand={(expandedKeys) => {
                                    setExpendedKeys(expandedKeys)
                                }}/>
                        </MarkdownInlineContext.Provider>
                </div>
            </div>
            {selectedId !== 0 && <InfoRight/>}
            <TraceInfo/>
        </div>
    );
};

export default Main;