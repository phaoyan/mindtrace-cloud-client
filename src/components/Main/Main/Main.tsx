import React, {useEffect, useRef} from 'react';
import {UserID} from "../../../recoil/User";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {Divider, Input, Popover, Tree} from "antd";
import {
    CheckOutlined,
    MinusOutlined,
    NodeCollapseOutlined,
    NodeExpandOutlined,
    PlusOutlined,
    QuestionCircleOutlined,
    ScissorOutlined
} from "@ant-design/icons";
import "../../../service/api/api.ts"
import {getKnodes} from "../../../service/api/KnodeApi";
import classes from "./Main.module.css"
import utils from "../../../utils.module.css"
import InfoRight from "../InfoRight/InfoRight";
import {
    KtreeAntdSelector,
    KtreeFlatAtom, ScissoredKnodeIdAtom,
    SelectedKnodeIdAtom, SelectedKtreeOffspringIdsSelector
} from "../../../recoil/home/Knode";
import {
    MainPageHeightAtom,
    MainPageWidthAtom
} from "../../../recoil/utils/DocumentData";
import {MilkdownEditor} from "../../utils/markdown/MilkdownEditor";
import {MilkdownProvider} from "@milkdown/react";
import {
    ExpandedKeysAtom, SelectedKnodeExpandedSelector,
    useHandleBranch, useHandleRemove,
    useHotkeys,
    useHotkeysHelp, usePasteSelectedKnode, useScissorSelectedKnode,
    useSearchBar
} from "./MainHooks";

const Main = () => {

    // 指定Main页面的宽高：本组件和InfoRight的ResizableBox需要用到
    const mainPageRef = useRef<HTMLDivElement>(null)
    const [mainPageHeight, setMainPageHeight] = useRecoilState(MainPageHeightAtom)
    const setMainPageWidth = useSetRecoilState(MainPageWidthAtom)
    const userId = useRecoilValue(UserID)
    const setKtreeFlat = useSetRecoilState(KtreeFlatAtom)
    const ktreeAntd = useRecoilValue(KtreeAntdSelector)
    const [selectedId, setSelectedId] = useRecoilState<number>(SelectedKnodeIdAtom)
    const selectedKtreeOffspringIds = useRecoilValue(SelectedKtreeOffspringIdsSelector)
    const [searchTxt, onSearchChange] = useSearchBar()
    const scissoredId = useRecoilValue(ScissoredKnodeIdAtom)
    const hotKeys = useHotkeys()
    const handleBranch = useHandleBranch()
    const handleRemove = useHandleRemove()
    const scissorSelectedKnode = useScissorSelectedKnode()
    const pasteSelectedKnode = usePasteSelectedKnode()
    const hotkeyHelp = useHotkeysHelp()
    const [expandedKeys, setExpandedKeys] = useRecoilState(ExpandedKeysAtom)
    const selectedKnodeExpanded = useRecoilValue(SelectedKnodeExpandedSelector)
    const divRef = useRef<HTMLDivElement>(null)
    useEffect(()=>{
        const effect = async ()=>{
            setKtreeFlat(await getKnodes(userId))
            if(mainPageRef.current){
                setMainPageHeight(mainPageRef.current.scrollHeight)
                setMainPageWidth(mainPageRef.current.scrollWidth)
            }
        }; effect()
        //eslint-disable-next-line
    }, [userId])

    return (
        <div className={classes.container} ref={mainPageRef}>
            <div
                className={classes.main}
                ref={divRef}
                tabIndex={0}
                style={{height: mainPageHeight * 0.85 }}
                onKeyDown={hotKeys}>
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
                    {
                        scissoredId ?
                        <CheckOutlined
                            className={utils.icon_button}
                            onClick={pasteSelectedKnode}/>:
                        <ScissorOutlined
                            className={utils.icon_button}
                            onClick={scissorSelectedKnode}/>
                    }
                    {selectedKnodeExpanded ?
                        <NodeCollapseOutlined className={"icon-button"} onClick={() => {
                            setExpandedKeys(expandedKeys.filter(key => !selectedKtreeOffspringIds.includes(key as number)))
                        }}/> :
                        <NodeExpandOutlined className={"icon-button"} onClick={() => {
                            setExpandedKeys([...expandedKeys, ...selectedKtreeOffspringIds])
                        }}/>
                    }
                    <Popover
                        placement={"bottomLeft"}
                        arrow={false}
                        content={(
                            <div className={classes.help_hotkey}>
                                <MilkdownProvider>
                                    <MilkdownEditor md={hotkeyHelp} editable={false}/>
                                </MilkdownProvider>
                            </div>
                        )}>
                        <QuestionCircleOutlined className={utils.icon_button}/>
                    </Popover>
                </div>
                <div className={`${classes.tree_wrapper} ${utils.custom_scrollbar} ${utils.left_scrollbar}`}>
                    <Tree
                        showLine={true}
                        selectedKeys={[selectedId]}
                        onSelect={(selectedKeys) => setSelectedId(selectedKeys[0]?.valueOf() as number)}
                        treeData={ktreeAntd}
                        expandedKeys={expandedKeys}
                        autoExpandParent={true}
                        onExpand={(expandedKeys) => setExpandedKeys(expandedKeys)}/>
                </div>
            </div>
            {selectedId !== 0 && <InfoRight/>}
        </div>
    );
};

export default Main;