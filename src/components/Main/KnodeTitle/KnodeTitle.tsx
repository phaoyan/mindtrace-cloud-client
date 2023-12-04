import React, {useEffect, useRef, useState} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import classes from "./KnodeTitle.module.css"
import {KnodeSelector, ScissoredKnodeIdsAtom, SelectedKnodeIdAtom} from "../../../recoil/home/Knode";
import {Input, InputRef, Tooltip} from "antd";
import MdPreview from "../../utils/markdown/MdPreview";
import {KnodeConnectionIdTempAtom, TitleEditKnodeIdAtom, useHandleSubmit} from "./KnodeTitleHooks";
import {
    CopyOutlined,
    DisconnectOutlined,
    EditOutlined,
    LinkOutlined,
    MinusOutlined,
    PlusOutlined, ScissorOutlined,
    StarOutlined,
    SwapOutlined
} from "@ant-design/icons";
import utils from "../../../utils.module.css"
import {
    CurrentUserIdSelector, FocusedKnodeIdAtom,
    useHandleBranch,
    useHandleConnect, useHandleDisconnect,
    useHandleRemove,
    useHandleSubscribe, usePasteSelectedKnode, useScissorKnode,
} from "../Main/MainHooks";
import {LoginUserIdSelector} from "../../Login/LoginHooks";


const KnodeTitle = (props: {id: number, hideOptions?: boolean}) => {
    const loginUserId = useRecoilValue(LoginUserIdSelector)
    const currentUserId = useRecoilValue(CurrentUserIdSelector)
    const scissoredKnodeIds = useRecoilValue(ScissoredKnodeIdsAtom)
    const [knode, setKnode] = useRecoilState(KnodeSelector(props.id))
    const [titleEditKnodeId, setTitleEditKnodeId] = useRecoilState(TitleEditKnodeIdAtom)
    const [selectedKnodeId,] = useRecoilState(SelectedKnodeIdAtom)
    const [, setFocusedKnodeId] = useRecoilState(FocusedKnodeIdAtom)
    const [knodeConnectionTemp, setKnodeConnectionTemp] = useRecoilState(KnodeConnectionIdTempAtom)
    const divRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<InputRef>(null)
    const handleSubmit = useHandleSubmit()
    const handleBranch = useHandleBranch()
    const handleRemove = useHandleRemove()
    const handleSubscribe = useHandleSubscribe()
    const handleConnect = useHandleConnect(props.id)
    const handleDisconnect = useHandleDisconnect(props.id)
    const scissorKnode = useScissorKnode();
    const pasteKnode = usePasteSelectedKnode();
    useEffect(()=>{
        if(titleEditKnodeId)
            inputRef.current?.focus()
        if(!titleEditKnodeId && selectedKnodeId === props.id)
            divRef.current?.focus()
        //eslint-disable-next-line
    }, [titleEditKnodeId])
    useEffect(()=>{
        if(selectedKnodeId === props.id)
            divRef.current?.focus()
    }, [props.id, selectedKnodeId])

    if(!knode) return <></>
    return (
        <div
            className={classes.container}
            style={{backgroundColor: scissoredKnodeIds.includes(props.id) ? "#eee":"transparent"}}>
            <div tabIndex={0} ref={divRef}>
                {
                    titleEditKnodeId === knode.id?
                    <Input
                        className={classes.title}
                        ref={inputRef}
                        value={knode.title}
                        onChange={({target: {value}})=> setKnode({...knode, title: value})}
                        onKeyPress={({shiftKey, key})=>shiftKey && key === "Enter" && handleSubmit()}
                        onBlur={()=>handleSubmit()}
                        bordered={false}/>:
                    <div className={classes.title}>
                        <MdPreview>{knode.title}</MdPreview>{
                        loginUserId === currentUserId &&
                        selectedKnodeId === knode.id &&
                        !props.hideOptions &&
                        <div className={classes.options} style={{left: knode.title === "" ? "9em" : "7em"}}>{
                            knode.connectionIds.length === 0 ? (
                                knodeConnectionTemp ?
                                <Tooltip title={"确认连接"}>
                                    <LinkOutlined
                                        className={utils.icon_button_normal}
                                        onClick={()=>handleConnect()}/>
                                </Tooltip>:
                                <Tooltip title={"连接知识点"}>
                                    <LinkOutlined
                                        style={{color:"gray"}}
                                        className={utils.icon_button_normal}
                                        onClick={()=>setKnodeConnectionTemp(knode.id)}/>
                                </Tooltip>):
                            <Tooltip title={(
                                <div>
                                    <span>
                                        跳转到相关知识点&nbsp;&nbsp;
                                        <Tooltip title={"点击删除连接"}>
                                            <DisconnectOutlined
                                                className={utils.icon_button_normal}
                                                onClick={()=>handleDisconnect()}/>
                                        </Tooltip>
                                    </span>
                                </div>)}>
                                <SwapOutlined
                                    className={utils.icon_button_normal}
                                    onClick={()=>{setFocusedKnodeId(knode.connectionIds[0])}}/>
                            </Tooltip>}
                            <Tooltip title={
                                <CopyOutlined
                                    className={utils.icon_button_normal}
                                    onClick={()=>pasteKnode()}
                                />}>
                                <ScissorOutlined
                                    className={utils.icon_button_normal}
                                    onClick={()=>scissorKnode(props.id)}/>
                            </Tooltip>
                            <EditOutlined
                                className={utils.icon_button_normal}
                                onClick={()=>setTitleEditKnodeId(knode.id)}/>
                            <PlusOutlined
                                className={utils.icon_button_normal}
                                onClick={handleBranch}/>{
                            knode.branchIds.length === 0 &&
                            <MinusOutlined
                                className={utils.icon_button_normal}
                                onClick={handleRemove}/>}
                        </div>}{
                        loginUserId !== currentUserId &&
                        selectedKnodeId === knode.id &&
                        !props.hideOptions &&
                        <div  className={classes.other_user_options}>
                            <Tooltip title={"订阅该知识点"}>
                                <StarOutlined
                                    className={utils.icon_button_normal}
                                    onClick={()=>handleSubscribe(props.id)}/>
                            </Tooltip>
                        </div>
                    }</div>
                }
            </div>
        </div>
    );
};

export default KnodeTitle;