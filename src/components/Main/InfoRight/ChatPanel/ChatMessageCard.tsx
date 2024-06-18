import React, {useEffect, useState} from 'react';
import {
    ChatMessage, CurrentChatSessionSelectedMessageIdsAtom,
    CurrentChatSessionSelector, CurrentEnhancerDropdownItemsSelector,
    useBranchChatSession,
    useFoldChatMessage, useSaveChatMessage, useSaveChatMessageToEnhancer,
    useUnfoldChatMessage
} from "./ChatPanelHooks";
import {Col, Divider, Dropdown, Row, Tooltip} from "antd";
import classes from "./ChatPanel.module.css"
import {ChatGPTOutlined} from "../../../utils/antd/icons/Icons";
import {
    BellOutlined,
    BranchesOutlined,
    CopyOutlined,
    DeleteOutlined,
    FolderFilled,
    FolderOutlined, MinusSquareOutlined, PlusSquareOutlined,
    SaveOutlined,
    UserOutlined
} from "@ant-design/icons";
import utils from "../../../../utils.module.css"
import {useRecoilState, useRecoilValue} from "recoil";
import {MessageApiAtom} from "../../../../recoil/utils/DocumentData";
import MdPreview from "../../../utils/markdown/MdPreview";
import {copyToClipboard,} from "../../../../service/utils/JsUtils";

const ChatMessageCard = (props: {message: ChatMessage}) => {
    const [txts, setTxts] = useState<string[]>([])
    const [imgs, setImgs] = useState<string[]>([])
    const [currentSession, setCurrentSession] = useRecoilState(CurrentChatSessionSelector);
    const [selectedMessageIds, setSelectedMessageIds] = useRecoilState(CurrentChatSessionSelectedMessageIdsAtom);
    const enhancerDropdownItems = useRecoilValue(CurrentEnhancerDropdownItemsSelector);
    const branchChatSession = useBranchChatSession();
    const foldChatMessage = useFoldChatMessage();
    const unfoldChatMessage = useUnfoldChatMessage();
    const saveChatMessage = useSaveChatMessage();
    const saveChatMessageToEnhancer = useSaveChatMessageToEnhancer();
    const messageApi = useRecoilValue(MessageApiAtom);

    useEffect(()=>{
        if(typeof props.message.content==="string"){
            setTxts([props.message.content])
        }else {
            const texts = props.message.content
                .filter(content=>content.type==="text")
                .map(content=>content.text);
            setTxts(texts)
            const imgs = props.message.content
                .filter(content=>content.type==="image_url")
                .map(content=>content.image_url.url);
            setImgs(imgs)
        }
    }, [props.message.content])
    return (
        <div className={classes.card}>
            <Row>
                <Col span={1}>{
                    props.message.role === "assistant" && <ChatGPTOutlined/>}{
                    props.message.role === "user" && <UserOutlined/>}{
                    props.message.role === "system" && <BellOutlined/>
                }</Col>
                <Col span={22}>{
                    !currentSession.foldedMessageIds.includes(props.message.id) ?
                        txts.map((txt, i)=>(<MdPreview key={i}>{txt}</MdPreview>)):
                        <span className={utils.folded}> . . . </span>
                }</Col>
            </Row>
            <Row>
                <Col span={22} offset={1}>{
                    imgs.map((img, i)=>(
                        <div key={i}>
                            <MdPreview>{`![img-${i}](${img})`}</MdPreview>
                        </div>
                    ))
                }</Col>
            </Row>
            <Row style={{marginTop:"0.5em"}}>
                <Col span={1}>{
                    selectedMessageIds.includes(props.message.id) ?
                    <MinusSquareOutlined
                        className={utils.icon_button_normal}
                        onClick={()=>setSelectedMessageIds(selectedMessageIds.filter(messageId=>messageId!==props.message.id))}/> :
                    <PlusSquareOutlined
                        className={utils.icon_button_normal}
                        onClick={()=>setSelectedMessageIds(selectedMessageIds.concat([props.message.id]))}/>
                }</Col>
                <Col span={1}>
                    <Tooltip title={"在此分支出新会话"}>
                        <BranchesOutlined
                            className={utils.icon_button_normal}
                            onClick={()=>branchChatSession(currentSession.messages.indexOf(props.message))}/>
                    </Tooltip>
                </Col>
                <Col span={1}>
                    <CopyOutlined
                        className={utils.icon_button_normal}
                        onClick={async ()=>{
                            txts.forEach(txt=>copyToClipboard(txt))
                            messageApi.info("复制成功")
                        }}/>
                </Col>
                <Col span={1}>
                    <Dropdown menu={{items: enhancerDropdownItems, onClick: (data)=>txts.forEach(txt=>saveChatMessageToEnhancer(data.key, txt))}}>
                        <SaveOutlined
                            className={utils.icon_button_normal}
                            onClick={()=>txts.forEach(txt=>saveChatMessage(txt))}/>
                    </Dropdown>
                </Col>
                <Col span={1}>
                    <Tooltip title={"折叠该文本"}>{
                        !currentSession.foldedMessageIds.includes(props.message.id) ?
                            <FolderOutlined
                                className={utils.icon_button_normal}
                                onClick={()=>foldChatMessage(props.message.id)}/>:
                            <FolderFilled
                                className={utils.icon_button_normal}
                                onClick={()=>unfoldChatMessage(props.message.id)}/>
                    }</Tooltip>
                </Col>
                <Col span={1}>
                    <DeleteOutlined
                        className={utils.icon_button_normal}
                        onClick={()=>{setCurrentSession({...currentSession, messages: currentSession.messages.filter(message=>message.id!==props.message.id)})}}/>
                </Col>
            </Row>
            <Row>
                <Col span={22} offset={1}>
                    <Divider className={utils.ghost_horizontal_divider_top}/>
                </Col>
            </Row>
        </div>
    );
};

export default ChatMessageCard;