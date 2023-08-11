import React, {useEffect, useRef} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import classes from "./KnodeTitle.module.css"
import {KnodeSelector, SelectedKnodeIdAtom} from "../../../recoil/home/Knode";
import {Input, InputRef, Tooltip} from "antd";
import MdPreview from "../../utils/markdown/MdPreview";
import {TitleEditKnodeIdAtom, useHandleSubmit} from "./KnodeTitleHooks";
import {EditOutlined, MinusOutlined, PlusOutlined, StarOutlined} from "@ant-design/icons";
import utils from "../../../utils.module.css"
import {CurrentUserIdSelector, useHandleBranch, useHandleRemove, useHandleSubscribe} from "../Main/MainHooks";
import {LoginUserIdSelector} from "../../Login/LoginHooks";


const KnodeTitle = (props: {id: number, hideOptions?: boolean}) => {
    const loginUserId = useRecoilValue(LoginUserIdSelector)
    const currentUserId = useRecoilValue(CurrentUserIdSelector)
    const [knode, setKnode] = useRecoilState(KnodeSelector(props.id))
    const [titleEditKnodeId, setTitleEditKnodeId] = useRecoilState(TitleEditKnodeIdAtom)
    const selectedId = useRecoilValue(SelectedKnodeIdAtom)
    const divRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<InputRef>(null)
    const handleSubmit = useHandleSubmit()
    const handleBranch = useHandleBranch()
    const handleRemove = useHandleRemove()
    const handleSubscribe = useHandleSubscribe()
    useEffect(()=>{
        if(titleEditKnodeId)
            inputRef.current?.focus()
        if(!titleEditKnodeId && selectedId === props.id)
            divRef.current?.focus()
        //eslint-disable-next-line
    }, [titleEditKnodeId])
    useEffect(()=>{
        if(selectedId === props.id)
            divRef.current?.focus()
    }, [props.id, selectedId])

    if(!knode) return <></>
    return (
        <div className={classes.container}>
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
                        selectedId === knode.id &&
                        !props.hideOptions &&
                        <div className={classes.options} style={{left: knode.title === "" ? "7em" : "5em"}}>
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
                        selectedId === knode.id &&
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