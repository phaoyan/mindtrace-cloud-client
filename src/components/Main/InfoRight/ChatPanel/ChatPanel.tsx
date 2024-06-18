import React, {useEffect, useState} from 'react';
import {Col, Divider, Dropdown, Input, Row, Spin, Tooltip} from "antd";
import {
    AppstoreOutlined,
    BarsOutlined, BellFilled, BellOutlined, BulbFilled, BulbOutlined, CloseOutlined,
    DeleteOutlined, DoubleRightOutlined, FontSizeOutlined,
    SaveOutlined,
    SendOutlined
} from "@ant-design/icons";
import utils from "../../../../utils.module.css"
import classes from "./ChatPanel.module.css";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    ChatLoadingAtom, ChatPanelImageBase64MessageListAtom,
    ChatPanelTxtAtom, ChatSearchModeAtom,
    ChatSessionListAtom,
    ChatSessionListDropdownItemSelector, ChatSystemModeAtom,
    CurrentChatSessionIdAtom,
    CurrentChatSessionSelector,
    CurrentEnhancerDropdownItemsSelector, MarkdownInputKeyAtom, useChatForTitle,
    useCreateChatSession,
    useImportEnhancerInfo,
    useRemoveChatSession,
    useSaveChatSession, useSaveChatSessionToEnhancer, useSendMessage,
    useSystemMessageItems,
} from "./ChatPanelHooks";
import ChatMessageCard from "./ChatMessageCard";
import {MilkdownProvider} from "@milkdown/react";
import {MilkdownEditor} from "../../../utils/markdown/MilkdownEditor";
import {LatexDarkOutlined, LatexLightOutlined} from "../../../utils/antd/icons/Icons";
import {useInitEnhancerPanelData} from "../EnhancerPanel/EnhancerPanelHooks";
import {SearchOptions} from "../SearchPanel/SearchPanel";
import {updateImageBase64} from "../EnhancerPanel/resource/ResourcePlayerUtils";
import MdPreview from "../../../utils/markdown/MdPreview";
import {generateUUID} from "../../../../service/utils/JsUtils";


const ChatPanel = () => {
    const [txt, setTxt] = useRecoilState(ChatPanelTxtAtom)
    const [imgs, setImgs] = useRecoilState(ChatPanelImageBase64MessageListAtom);
    const [title, setTitle] = useState("")
    const [markdownMode, setMarkdownMode] = useState(false)
    const [markdownInputKey, ] = useRecoilState(MarkdownInputKeyAtom);
    const [systemMode, setSystemMode] = useRecoilState(ChatSystemModeAtom)
    const [searchMode, setSearchMode] = useRecoilState(ChatSearchModeAtom)
    const [loading, setLoading] = useRecoilState(ChatLoadingAtom);
    const [currentSession, setCurrentSession] = useRecoilState(CurrentChatSessionSelector);
    const enhancerDropdownItems = useRecoilValue(CurrentEnhancerDropdownItemsSelector);
    const [sessions, ] = useRecoilState(ChatSessionListAtom);
    const [, setCurrentSessionId] = useRecoilState(CurrentChatSessionIdAtom);
    const sessionDropdownItems = useRecoilValue(ChatSessionListDropdownItemSelector);
    const saveChatSession = useSaveChatSession();
    const saveChatSessionToEnhancer = useSaveChatSessionToEnhancer();
    const createChatSession = useCreateChatSession();
    const removeChatSession = useRemoveChatSession();
    const importEnhancerInfo = useImportEnhancerInfo();
    const systemMessageItems = useSystemMessageItems();
    const sendMessage = useSendMessage();
    const chatForTitle = useChatForTitle();

    useInitEnhancerPanelData()
    useEffect(()=>{
        setTitle(currentSession.title)
    }, [currentSession])
    return (
        <div>
            <Row style={{marginBottom:"0.7em"}}>
                <Col span={1} className={utils.flex_center}>
                    <Dropdown
                        placement={"bottom"}
                        menu={{items:[{
                                key: "Title",
                                label: (
                                    <FontSizeOutlined
                                        className={utils.icon_button}
                                        onClick={()=>chatForTitle()}/>
                                )},{
                                key: "Delete",
                                label: (
                                    <DeleteOutlined
                                        className={utils.icon_button}
                                        onClick={()=>sessions.length >= 2 && removeChatSession(currentSession.id)}/>
                                )},
                        ]}}>
                        <AppstoreOutlined className={utils.icon_button}/>
                    </Dropdown>
                </Col>
                <Col span={15}>
                    <Input
                        value={title}
                        className={classes.title}
                        onChange={({target: {value}})=>setTitle(value)}
                        onBlur={()=>setCurrentSession(currentSession=>({...currentSession, title: title}))}
                        bordered={false}
                        placeholder={"开始聊天 . . . "}/>
                </Col>
            </Row>
            <Row className={classes.main}>
                <Col span={24}>{
                    currentSession.messages.map(message=><ChatMessageCard key={message.id} message={message}/>)
                }</Col>
            </Row>
            <br/>
            <Row>
                <Col span={1} className={`${utils.flex_center} ${utils.margin_bottom_1em}`}>
                    <Dropdown menu={{items: enhancerDropdownItems, onClick: (data)=>saveChatSessionToEnhancer(data.key)}}>
                        <SaveOutlined
                            className={`${utils.icon_button} ${utils.color_666}`}
                            onClick={()=>saveChatSession()}/>
                    </Dropdown>
                </Col>
                <Col span={1} className={`${utils.flex_center} ${utils.margin_bottom_1em}`}>
                    <Dropdown menu={{items: systemMessageItems}}>{
                        !systemMode ?
                            <BellOutlined
                                className={`${utils.icon_button} ${utils.color_666}`}
                                onClick={()=>setSystemMode(true)}/>:
                            <BellFilled
                                className={`${utils.icon_button} ${utils.color_666}`}
                                onClick={()=>setSystemMode(false)}/>
                    }</Dropdown>
                </Col>
                <Col span={1} className={`${utils.flex_center} ${utils.margin_bottom_1em}`}>
                    <Tooltip title={"搜索模式"}>{
                        !searchMode ?
                            <BulbOutlined
                                className={`${utils.icon_button} ${utils.color_666}`}
                                onClick={()=>setSearchMode(true)}/>:
                            <BulbFilled
                                className={`${utils.icon_button} ${utils.color_666}`}
                                onClick={()=>setSearchMode(false)}/>
                    }</Tooltip>
                </Col>
                <Col span={1} className={`${utils.flex_center} ${utils.margin_bottom_1em}`}>
                    <Dropdown menu={{items: enhancerDropdownItems, onClick: async (data)=>{await importEnhancerInfo(data.key)}}}>
                        <DoubleRightOutlined className={`${utils.icon_button} ${utils.color_666}`}/>
                    </Dropdown>
                </Col>

            </Row>
            {searchMode && <SearchOptions/>}
            <Row>
                <Col span={1} className={utils.flex_center}>
                    <Dropdown
                        menu={{items: sessionDropdownItems, onClick: (data)=>{data.key==="ADD" ? createChatSession() : setCurrentSessionId(data.key)}}}
                        placement={"topCenter"}>
                        <BarsOutlined className={`${utils.icon_button} ${utils.color_666}`}/>
                    </Dropdown>
                </Col>
                <Col span={1}  className={utils.flex_center}>{
                    markdownMode ?
                    <LatexDarkOutlined
                        className={utils.icon_button}
                        onClick={()=>setMarkdownMode(false)}/>:
                    <LatexLightOutlined
                        className={utils.icon_button}
                        onClick={()=>setMarkdownMode(true)}/>
                }</Col>
                <Col span={20}>
                    <>{
                        markdownMode ?
                        <div className={classes.markdown_wrapper} key={markdownInputKey}>
                            <MilkdownProvider>
                                <MilkdownEditor
                                    md={txt}
                                    editable={true}
                                    onChange={(cur)=>setTxt(cur)}
                                    updateImage={async (image)=> {
                                        const base64 = await updateImageBase64(image) as string;
                                        setImgs((imgs)=>[...imgs, base64])
                                        return ""
                                    }}/>
                            </MilkdownProvider>
                        </div> :
                        <Input
                            value={txt}
                            onChange={({target: {value}})=>setTxt(value)}
                            onPressEnter={async ()=> await sendMessage(txt)}
                            bordered={false}
                            placeholder={"开始聊天 . . . "}/>
                    }</>
                    <Divider className={utils.ghost_horizontal_divider}/>
                </Col>
                <Col span={2} className={utils.flex_center}>{
                    !loading ?
                        <SendOutlined
                            className={`${utils.icon_button} ${utils.color_666}`}
                            onClick={async ()=> await sendMessage(txt)}/>:
                        <div
                            className={utils.icon_button_normal}
                            onClick={()=>setLoading(false)}>
                            <Spin/>
                        </div>
                }</Col>
            </Row>
            <Row>
                <Col span={22} offset={1}>{
                    imgs.map((img,i)=>(
                        <div key={generateUUID()}>
                            <CloseOutlined
                                style={{position: "absolute"}}
                                className={`${utils.icon_button_normal} ${utils.color_999}`}
                                onClick={()=>setImgs(imgs.filter((img, j)=>i!==j))}/>
                            <MdPreview>{`![img-${i}](${img})`}</MdPreview>
                        </div>
                    ))
                }</Col>
            </Row>
        </div>
    );
};

export default ChatPanel;