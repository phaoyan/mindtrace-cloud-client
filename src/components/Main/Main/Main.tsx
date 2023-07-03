import React, {useEffect, useRef} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {Avatar, Divider, Input, Popover, Tree} from "antd";
import {HomeOutlined, QuestionCircleOutlined, UserOutlined} from "@ant-design/icons";
import {getKnodes} from "../../../service/api/KnodeApi";
import classes from "./Main.module.css"
import utils from "../../../utils.module.css"
import InfoRight from "../InfoRight/InfoRight";
import {
    KtreeAntdSelector,
    KtreeFlatAtom, SelectedKnodeAncestorsSelector,
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
    ExpandedKeysAtom, ReadonlyModeAtom, useBackHome,
    useHotkeys,
    useHotkeysHelp,
    useSearchBar
} from "./MainHooks";
import {LoginUserAtom, LoginUserIdSelector} from "../../Login/LoginHooks";

const Main = () => {

    const setReadonlyMode = useSetRecoilState(ReadonlyModeAtom)
    const loginUser = useRecoilValue(LoginUserAtom)
    const [currentUser, setCurrentUser] = useRecoilState(CurrentUserAtom)
    // 指定Main页面的宽高：本组件和InfoRight的ResizableBox需要用到
    const mainPageRef = useRef<HTMLDivElement>(null)
    const [mainPageHeight, setMainPageHeight] = useRecoilState(MainPageHeightAtom)
    const setMainPageWidth = useSetRecoilState(MainPageWidthAtom)
    const userId = useRecoilValue(CurrentUserIdSelector)
    const loginId = useRecoilValue(LoginUserIdSelector)
    const [ktreeFlat,setKtreeFlat] = useRecoilState(KtreeFlatAtom)
    const ktreeAntd = useRecoilValue(KtreeAntdSelector)
    const [selectedId, setSelectedId] = useRecoilState<number>(SelectedKnodeIdAtom)
    const [searchTxt, onSearchChange] = useSearchBar()
    const hotKeys = useHotkeys()
    const hotkeyHelp = useHotkeysHelp()
    const [expandedKeys, setExpandedKeys] = useRecoilState(ExpandedKeysAtom)
    const divRef = useRef<HTMLDivElement>(null)
    const selectedKnodeAncestors = useRecoilValue(SelectedKnodeAncestorsSelector)
    const backHome = useBackHome()
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
    useEffect(()=>{
        const knodeIds = selectedKnodeAncestors.map(knode=>knode.id).filter(knodeId=>knodeId !== selectedId);
        const updatedExpandedKeys = expandedKeys.filter(key=>knodeIds.indexOf(key as number) !== -1).concat(knodeIds);
        setExpandedKeys(updatedExpandedKeys)
        //eslint-disable-next-line
    }, [selectedId, ktreeFlat])
    useEffect(()=>{
        currentUser && setReadonlyMode(currentUser.id !== loginId)
        //eslint-disable-next-line
    }, [currentUser])
    useEffect(()=>{
        !currentUser && loginUser && setCurrentUser(loginUser)
        //eslint-disable-next-line
    }, [currentUser, loginUser])

    if(!currentUser) return <></>
    return (
        <div className={classes.container} ref={mainPageRef}>
            <div
                className={classes.main}
                ref={divRef}
                tabIndex={0}
                style={{height: mainPageHeight * 0.85 }}
                onKeyDown={hotKeys}>
                <div className={classes.main_toolbar}>{
                    currentUser.id !== loginId &&
                    <HomeOutlined
                        className={utils.icon_button}
                        onClick={()=>backHome()}/>
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
                        selectedKeys={[selectedId]}
                        onSelect={(selectedKeys) => setSelectedId(selectedKeys[0]?.valueOf() as number)}
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