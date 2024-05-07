import React, {useEffect, useRef, useState} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {Avatar, Divider, Input, Popover, Tree} from "antd";
import {QuestionCircleOutlined, UserOutlined} from "@ant-design/icons";
import {getKnodes} from "../../../service/api/KnodeApi";
import classes from "./Main.module.css"
import utils from "../../../utils.module.css"
import InfoRight from "../InfoRight/InfoRight";
import {
    FocusedKnodeAncestorsSelector,
    KtreeAntdSelector,
    KtreeFlatAtom,
    SelectedKnodeIdAtom
} from "../../../recoil/home/Knode";
import {
    MainPageHeightAtom,
    MainPageWidthAtom
} from "../../../recoil/utils/DocumentData";
import {MilkdownEditor} from "../../utils/markdown/MilkdownEditor";
import {MilkdownProvider} from "@milkdown/react";
import {
    CurrentUserAtom, CurrentUserIdSelector,
    ExpandedKeysAtom, FocusedKnodeIdAtom, LastMovementAtom, ReadonlyModeAtom, SwitchTimeoutAtom, useBack,
    useHotkeys,
    useHotkeysHelp,
    useSearchBar
} from "./MainHooks";
import {LoginUserIdSelector} from "../../Login/LoginHooks";
import {VisitOutlined} from "../../utils/antd/icons/Icons";
import dayjs from "dayjs";
import {Navigate} from "react-router-dom";

const Main = () => {

    const setReadonlyMode = useSetRecoilState(ReadonlyModeAtom)
    const [loading, setLoading] = useState(true)
    const [currentUser,] = useRecoilState(CurrentUserAtom)
    // 指定Main页面的宽高：本组件和InfoRight的ResizableBox需要用到
    const mainPageRef = useRef<HTMLDivElement>(null)
    const setMainPageWidth = useSetRecoilState(MainPageWidthAtom)
    const userId = useRecoilValue(CurrentUserIdSelector)
    const loginId = useRecoilValue(LoginUserIdSelector)
    const [ktreeFlat,setKtreeFlat] = useRecoilState(KtreeFlatAtom)
    const ktreeAntd = useRecoilValue(KtreeAntdSelector)
    const [selectedId, setSelectedId] = useRecoilState(SelectedKnodeIdAtom)
    const [focusedKnodeId, setFocusedKnodeId] = useRecoilState(FocusedKnodeIdAtom)
    const [lastMovement, setLastMovement] = useRecoilState(LastMovementAtom)
    const [switchTimeout, setSwitchTimeout] = useRecoilState(SwitchTimeoutAtom)
    const [searchTxt, onSearchChange] = useSearchBar()
    const hotKeys = useHotkeys()
    const hotkeyHelp = useHotkeysHelp()
    const [expandedKeys, setExpandedKeys] = useRecoilState(ExpandedKeysAtom)
    const divRef = useRef<HTMLDivElement>(null)
    const focusedKnodeAncestors = useRecoilValue(FocusedKnodeAncestorsSelector)
    const back = useBack()
    useEffect(()=>{
        const effect = async ()=>{
            setKtreeFlat(await getKnodes(userId))
            if(mainPageRef.current){
                setMainPageWidth(mainPageRef.current.scrollWidth)
            }
            setLoading(false)
        }; effect().then()
        //eslint-disable-next-line
    }, [userId])
    useEffect(()=>{
        const knodeIds = focusedKnodeAncestors.map(knode=>knode.id).filter(knodeId=>knodeId !== focusedKnodeId);
        setExpandedKeys(knodeIds)
        //eslint-disable-next-line
    }, [focusedKnodeId, ktreeFlat])
    useEffect(()=>{
        setFocusedKnodeId(selectedId)
        //eslint-disable-next-line
    }, [selectedId])
    useEffect(()=>{
        const now = dayjs()
        if(focusedKnodeId === selectedId) return
        if(now.diff(lastMovement, "seconds") < 0.5)
            clearTimeout(switchTimeout)
        setSwitchTimeout(setTimeout(()=>setSelectedId(focusedKnodeId), 500))
        setLastMovement(now)
        //eslint-disable-next-line
    }, [focusedKnodeId])
    useEffect(()=>{
        currentUser && setReadonlyMode(currentUser.id !== loginId)
        //eslint-disable-next-line
    }, [currentUser])


    if(loading) return <></>
    if(!currentUser) return <Navigate to={"/search"}/>
    return (
        <div className={classes.container} ref={mainPageRef}>
            <div
                className={classes.main}
                ref={divRef}
                tabIndex={0}
                style={{height: document.body.scrollHeight * 0.85 }}
                onKeyDown={hotKeys}>
                <div className={classes.main_toolbar}>{
                    currentUser.id !== loginId &&
                    <VisitOutlined
                        className={utils.icon_button}
                        onClick={()=>back()}/>
                    }<Avatar size={40} shape={"circle"} src={currentUser.avatar}><UserOutlined/></Avatar>
                    <span className={classes.username}>{currentUser.username}</span>
                    <div className={classes.search_wrapper}>
                        <Input
                            bordered={false}
                            placeholder={"搜索知识. . ."}
                            className={classes.search}
                            value={searchTxt}
                            onChange={({target: {value}})=>onSearchChange(value)}/>
                        <Divider className={utils.ghost_horizontal_divider} style={{minWidth:"20vw"}}/>
                    </div>
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
                        selectedKeys={[focusedKnodeId]}
                        onSelect={(selectedKeys) => setSelectedId(selectedKeys[0] ? selectedKeys[0].valueOf() as number: selectedId)}
                        treeData={ktreeAntd}
                        expandedKeys={expandedKeys}
                        autoExpandParent={true}
                        onExpand={(expandedKeys) => setExpandedKeys(expandedKeys)}/>
                </div>
            </div>
            {selectedId !== -1 && <InfoRight/>}
        </div>
    );
};

export default Main;