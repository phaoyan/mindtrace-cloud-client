import {atom, DefaultValue, selector, useRecoilState, useRecoilValue} from "recoil";
import {base64DecodeUtf8, generateUUID} from "../../../../service/utils/JsUtils";
import {CHAT_HOST, getResponse} from "../../../../service/api/ChatApi";
import {MessageOutlined, PlusOutlined} from "@ant-design/icons";
import utils from "../../../../utils.module.css"
import {MessageApiAtom} from "../../../../recoil/utils/DocumentData";
import {Resource, ResourceType, useAddEnhancer} from "../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import {CurrentTabAtom} from "../InfoRightHooks";
import {
    addDataToResource,
    addResource, getAllDataFromResource, getDataFromResource,
    getResourcesFromEnhancer, searchSimilarResource
} from "../../../../service/api/ResourceApi";
import {setEnhancerTitle} from "../../../../service/api/EnhancerApi";
import {EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import {getResourceUrl} from "../EnhancerPanel/resource/MindtraceHubResourcePlayer/MindtraceHubResourcePlayer";
import {ItemType} from "antd/es/menu/hooks/useItems";
import {RESOURCE_SIMILAR_THRESHOLD, useResourceFilter} from "../SearchPanel/SearchPanelHooks";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {getChainStyleTitle} from "../../../../service/api/KnodeApi";
import {CurrentUserIsLoginUserSelector} from "../../Main/MainHooks";




export const wrapSystemMessage = (txt: string): ChatMessage=>{
    return {
        id: generateUUID(),
        role: "system",
        content: txt
    }
}

export const wrapAssistantMessage = (txt: string): ChatMessage=>{
    return {
        id: generateUUID(),
        role: "assistant",
        content: txt
    }
}

export const wrapUserMessage = (txt: string): ChatMessage=>{
    return {
        id: generateUUID(),
        role: "user",
        content: txt
    }
}

export const wrapCompleteUserMessage = (txt: string, imgs: string[]): ChatMessage=>{
    return {
        id: generateUUID(),
        role: "user",
        content: [
            {
                "type": "text",
                "text": txt
            },
            ...imgs.map(img=>({
                "type": "image_url",
                "image_url": {
                    "url": img
                }
            }))
        ]
    }
}

export const prompts = {
    latex: "请在回复中包含任何特殊公式或符号时，用双dollar符包裹起来。请在整个对话中都保持这个规则。\n例如：$x^2+y^2=z$;  $\\frac{a}{b}$;  $a\\rightarrow b$;",
    stepByStep: "Let's Think step by step."
}

export const initialPrompts = ()=> [
    wrapSystemMessage(prompts.latex),
    wrapSystemMessage(prompts.stepByStep),
    wrapAssistantMessage("你好！有什么可以帮助你的吗？")
]

export interface ChatMessage{
    id: string
    role: "user" | "assistant" | "system",
    content: string | any[]
}

export interface ChatSession{
    id: string
    title: string
    messages: ChatMessage[],
    foldedMessageIds: string[]
}

const defaultUUID = generateUUID()

export const ChatSystemModeAtom = atom<boolean>({
    key: "ChatSystemModeAtom",
    default: false
})

export const ChatSearchModeAtom = atom<boolean>({
    key: "ChatSearchModeAtom",
    default: false
})

export const ChatSessionListAtom = atom<ChatSession[]>({
    key: "ChatSessionListAtom",
    default: [{
        id: defaultUUID,
        title: "默认会话",
        messages: initialPrompts(),
        foldedMessageIds: []
    }]
})

export const ChatSessionListDropdownItemSelector = selector({
    key: "ChatSessionListDropdownItemSelector",
    get: ({get})=>{
        return get(ChatSessionListAtom).map(session=>({
            key: session.id,
            label: session.title,
            icon: <MessageOutlined className={utils.color_666}/>,
            disabled: session.id === get(CurrentChatSessionSelector).id,
        })).concat([{
            key: "ADD",
            label: "新会话",
            icon: <PlusOutlined/>,
            disabled: false,
        }])
    }
})

export const CurrentChatSessionIdAtom = atom<string>({
    key: "CurrentChatSessionIndexAtom",
    default: defaultUUID
})

export const CurrentChatSessionSelector = selector<ChatSession>({
    key: "CurrentChatSessionSelector",
    get: ({get})=>{
        return get(ChatSessionListAtom).find((session)=>session.id===get(CurrentChatSessionIdAtom)) || get(ChatSessionListAtom)[0]
    },
    set: ({get, set}, newValue)=>{
        if(newValue instanceof DefaultValue) return
        const sessions = get(ChatSessionListAtom).map((session)=>session.id===get(CurrentChatSessionIdAtom) ? newValue: session)
        set(ChatSessionListAtom, sessions)
    }
})

export const CurrentEnhancerDropdownItemsSelector = selector({
    key: "CurrentEnhancerDropdownItemsSelector",
    get: ({get})=>{
        const enhancers = get(EnhancersForSelectedKnodeAtom);
        return enhancers.map(enhancer=>({
            key: enhancer.id,
            label: enhancer.title
        }))
    }
})

export const CurrentChatSessionSelectedMessageIdsAtom = atom<string[]>({
    key: "CurrentChatSessionSelectedMessageIdsAtom",
    default: []
})

export const ChatPanelTxtAtom = atom<string>({
    key: "ChatPanelTxtAtom",
    default: ""
})

export const ChatPanelImageBase64MessageListAtom = atom<string[]>({
    key: "ChatPanelImageBase64MessageListAtom",
    default: []
})

export const ChatLoadingAtom = atom<boolean>({
    key: "ChatLoadingAtom",
    default: false
})

export const MarkdownInputKeyAtom = atom<number>({
    key: "MarkdownInputKeyAtom",
    default: 0
})

export const useCreateChatSession = ()=>{
    const [sessions, setSessions] = useRecoilState(ChatSessionListAtom)
    const [, setCurrentSessionId] = useRecoilState(CurrentChatSessionIdAtom);
    return ()=>{
        const sessionId = generateUUID();
        setSessions(session=>[...session, {
            id: sessionId,
            title: "会话 " + sessions.length,
            messages: initialPrompts(),
            foldedMessageIds:[]}])
        setCurrentSessionId(sessionId)
    }
}

export const useRemoveChatSession = ()=>{
    const [sessions, setSessions] = useRecoilState(ChatSessionListAtom)
    const [currentSessionId, setCurrentSessionId] = useRecoilState(CurrentChatSessionIdAtom);
    return (id: string)=>{
        if(sessions.length <= 1) return
        const updatedSessions = sessions.filter(session=>session.id!==id);
        if(currentSessionId===id)
            setCurrentSessionId(updatedSessions[0].id)
        setSessions(updatedSessions)
    }
}

export const useBranchChatSession = ()=>{
    const [sessions, setSessions] = useRecoilState(ChatSessionListAtom);
    const currentSession = useRecoilValue(CurrentChatSessionSelector);
    const [, setCurrentSessionId] = useRecoilState(CurrentChatSessionIdAtom);
    return (index: number)=>{
        const newSession: ChatSession = {
            id: generateUUID(),
            title: currentSession.title + " - 分支",
            messages: currentSession.messages.slice(0, index + 1),
            foldedMessageIds: []
        }
        setSessions([...sessions, newSession])
        setCurrentSessionId(newSession.id)
    }
}

export const useFoldChatMessage = ()=>{
    const [currentSession, setCurrentSession] = useRecoilState(CurrentChatSessionSelector);
    return (messageId: string)=>{
        setCurrentSession({...currentSession, foldedMessageIds: currentSession.foldedMessageIds.concat([messageId])})
    }
}

export const useUnfoldChatMessage = ()=>{
    const [currentSession, setCurrentSession] = useRecoilState(CurrentChatSessionSelector);
    return (messageId: string)=>{
        setCurrentSession({...currentSession, foldedMessageIds: currentSession.foldedMessageIds.filter(id=>id!==messageId)})
    }
}

export const useSaveChatSession = ()=>{
    const editMode = useRecoilValue(CurrentUserIsLoginUserSelector);
    const [selectedMessageIds, setSelectedMessageIds] = useRecoilState(CurrentChatSessionSelectedMessageIdsAtom);
    const messageApi = useRecoilValue(MessageApiAtom);
    const chatSystemMode = useRecoilValue(ChatSystemModeAtom)
    const [currentSession, ] = useRecoilState(CurrentChatSessionSelector);
    const saveChatMessage = useSaveChatMessage();
    return async ()=>{
        if(!editMode) {
            messageApi.info("只能在自己的账号内保存数据")
            return
        }
        let messages
        if(selectedMessageIds.length !== 0){
            messages = currentSession.messages.filter(message=>selectedMessageIds.includes(message.id))
        }else{
            messages = currentSession.messages.filter(message=>chatSystemMode || message.role!=="system")
        }
        let content = buildMarkdown(messages)
        await saveChatMessage(content)
        setSelectedMessageIds([])
    }
}

export const useSaveChatSessionToEnhancer = ()=>{
    const editMode = useRecoilValue(CurrentUserIsLoginUserSelector);
    const chatSystemMode = useRecoilValue(ChatSystemModeAtom)
    const messageApi = useRecoilValue(MessageApiAtom);
    const [currentSession, ] = useRecoilState(CurrentChatSessionSelector);
    const [selectedMessageIds, setSelectedMessageIds] = useRecoilState(CurrentChatSessionSelectedMessageIdsAtom);
    const [, setCurrentTab] = useRecoilState(CurrentTabAtom);
    return async (enhancerId: string)=>{
        if(!editMode) {
            messageApi.info("只能在自己的账号内保存数据")
            return
        }
        let messages
        if(selectedMessageIds.length !== 0){
            messages = currentSession.messages.filter(message=>selectedMessageIds.includes(message.id))
        }else{
            messages = currentSession.messages.filter(message=>chatSystemMode || message.role!=="system")
        }
        const resource = await addResource(enhancerId, {type: ResourceType.MARKDOWN});
        await addDataToResource(resource.id!, "content.md", buildMarkdown(messages))
        await addDataToResource(resource.id!, "config.json",  JSON.stringify({hide: false, latexDisplayMode: false}))
        setCurrentTab("note")
        setSelectedMessageIds([])
    }
}

export const useImportEnhancerInfo = ()=>{
    const [, setCurrentSession] = useRecoilState(CurrentChatSessionSelector);
    return async (enhancerId: number | string)=>{
        const resources = await getResourcesFromEnhancer(enhancerId)
        let chatMessages: ChatMessage[] = []
        for(let resource of resources)
            chatMessages.push(await translateResourceToChatMessage(resource))
        chatMessages = chatMessages.filter(message=>message.content!=="")
        setCurrentSession((cur)=>({...cur, messages: cur.messages.concat(chatMessages)}))
    }
}


export const useSaveChatMessage = ()=>{
    const editMode = useRecoilValue(CurrentUserIsLoginUserSelector);
    const messageApi = useRecoilValue(MessageApiAtom);
    const [currentSession, ] = useRecoilState(CurrentChatSessionSelector);
    const addEnhancer = useAddEnhancer();
    const [, setCurrentTab] = useRecoilState(CurrentTabAtom);
    return async (content: string)=>{
        if(!editMode) {
            messageApi.info("只能在自己的账号内保存数据")
            return
        }
        const enhancerId = (await addEnhancer())!
        await setEnhancerTitle(enhancerId, currentSession.title)
        const resource = await addResource(enhancerId, {type: ResourceType.MARKDOWN});
        await addDataToResource(resource.id!, "content.md", content)
        await addDataToResource(resource.id!, "config.json",  JSON.stringify({hide: false, latexDisplayMode: false}))
        setCurrentTab("note")
    }
}

export const useSaveChatMessageToEnhancer = ()=>{
    const editMode = useRecoilValue(CurrentUserIsLoginUserSelector);
    const messageApi = useRecoilValue(MessageApiAtom);
    const [, setCurrentTab] = useRecoilState(CurrentTabAtom);
    return async (enhancerId: string, content: string)=>{
        if(!editMode) {
            messageApi.info("只能在自己的账号内保存数据")
            return
        }
        const resource = await addResource(enhancerId, {type: ResourceType.MARKDOWN});
        await addDataToResource(resource.id!, "content.md", content)
        await addDataToResource(resource.id!, "config.json",  JSON.stringify({hide: false, latexDisplayMode: false}))
        setCurrentTab("note")
    }
}

export const buildMarkdown = (messages: ChatMessage[]): string=>{
    return messages
        .map((message)=>`-- *${message.role}*\n ${message.content}\n\n`)
        .reduce((acc,cur)=>acc+cur)
}

export const translateResourceToChatMessage = async (resource: Resource): Promise<ChatMessage>=>{
    let content = ""
    if(resource.type===ResourceType.MARKDOWN){
        let resp = await getAllDataFromResource(resource.id!)
        content = base64DecodeUtf8(resp["content.md"])
    }
    else if(resource.type===ResourceType.LINKOUT){
        let resp = await getAllDataFromResource(resource.id!)
        let data = JSON.parse(base64DecodeUtf8(resp["data.json"]))
        content = `[${data.remark}](${data.url}) - ${data.url}`
    }
    else if(resource.type===ResourceType.MINDTRACE_HUB_RESOURCE){
        const resp = await getDataFromResource(resource.id!, "data.json")
        content = `[${resp.remark}](${getResourceUrl(resource.id!, resp.remark)}) - ${resp.description}`
    }
    else if(resource.type===ResourceType.CLOZE){
        let resp = await getAllDataFromResource(resource.id!)
        content = base64DecodeUtf8(resp["raw.md"])
    }
    else if(resource.type===ResourceType.QUIZCARD){
        let resp = await getAllDataFromResource(resource.id!)
        let data = JSON.parse(base64DecodeUtf8(resp["data.json"]))
        content = `--front\n${data.front}\n\n--back\n${data.back}\n`
    }
    return {
        id: generateUUID(),
        role: "user",
        content: content
    }
}

export const useSendMessage = ()=>{
    const chatSystemMode = useRecoilValue(ChatSystemModeAtom);
    const chatSearchMode = useRecoilValue(ChatSearchModeAtom);
    const addSystemMessage = useAddSystemMessage();
    const searchResourcesToChatMessage = useSearchResourcesToChatMessage();
    const chatOnce = useChatOnce();
    return async (txt: string)=>{
        if (chatSystemMode){
            await addSystemMessage(txt)
            return
        } else if (chatSearchMode){
            await searchResourcesToChatMessage(txt)
            return
        } else {
            await chatOnce(txt)
            return
        }
    }
}

export const useSearchResourcesToChatMessage = ()=>{
    const [loading, setLoading] = useRecoilState(ChatLoadingAtom);
    const messageApi = useRecoilValue(MessageApiAtom)
    const addUserMessage = useAddUserMessage();
    const [, setChatSearchMode] = useRecoilState(ChatSearchModeAtom);
    const resourceFilter = useResourceFilter();
    return async (txt: string)=>{
        if(loading) messageApi.warning("AI 响应中 . . . ")
        setLoading(true)
        const resources = await resourceFilter(await searchSimilarResource(txt, RESOURCE_SIMILAR_THRESHOLD))
        for (let resource of resources)
            addUserMessage((await translateResourceToChatMessage(resource)).content as string);
        setLoading(false)
        setChatSearchMode(false)
    }
}

export const useChatOnce = ()=>{
    const [currentSession, setCurrentSession] = useRecoilState(CurrentChatSessionSelector)
    const [, setTxt] = useRecoilState(ChatPanelTxtAtom);
    const [, setMarkdownInputKey] = useRecoilState(MarkdownInputKeyAtom);
    const [imgs, setImgs] = useRecoilState(ChatPanelImageBase64MessageListAtom);
    const [loading, setLoading] = useRecoilState(ChatLoadingAtom);
    const messageApi = useRecoilValue(MessageApiAtom)
    return async (txt: string)=>{
        if(!currentSession) return
        if(loading) messageApi.warning("AI 响应中 . . . ")
        setLoading(true)
        let messages: ChatMessage[] = [...currentSession.messages].filter(message=>message.content!=="")
        txt.trim().length !== 0 && (messages = messages.concat([wrapCompleteUserMessage(txt, imgs)]))
        setTxt("")
        setMarkdownInputKey(key=>key+1)
        setImgs([])
        setCurrentSession({...currentSession, messages: messages})
        const chatMessage = await getResponse(messages.filter(message=>!currentSession.foldedMessageIds.includes(message.id)));
        messages = messages.concat([wrapAssistantMessage(chatMessage.content as string)])
        setLoading(false)
        setCurrentSession(session=>({...session, messages: messages}))
    }
}

export const useChatOneByStream = ()=>{
    const [currentSession, setCurrentSession] = useRecoilState(CurrentChatSessionSelector)
    const [, setTxt] = useRecoilState(ChatPanelTxtAtom);
    const [loading, setLoading] = useRecoilState(ChatLoadingAtom);
    const messageApi = useRecoilValue(MessageApiAtom)
    return async (txt: string)=>{
        if(!currentSession) return
        if(loading) messageApi.warning("AI 响应中 . . . ")
        setLoading(true)
        setTxt("")
        let messages: ChatMessage[] = [...currentSession.messages].filter(message=>message.content!=="")
        txt.trim().length !== 0 && (messages = messages.concat([wrapUserMessage(txt)]))
        setCurrentSession({...currentSession, messages: messages})
        const eventSource = new EventSource(`${CHAT_HOST}/chat/stream`);
        eventSource.onmessage = ()=>{
            setCurrentSession({...currentSession, messages:[] })
        }

        setLoading(false)
        setCurrentSession(session=>({...session, messages: messages}))
    }
}

export const useChatForTitle = ()=>{
    const [currentSession, setCurrentSession] = useRecoilState(CurrentChatSessionSelector)
    return async ()=>{
        const prompt = "将之前的对话总结为一个20字以内的标题，只返回标题本身即可，无需更多解释文字"
        let messages: ChatMessage[] = [...currentSession.messages].filter(message=>message.content!=="").concat([wrapUserMessage(prompt)])
        const chatMessage = await getResponse(messages.filter(message=>!currentSession.foldedMessageIds.includes(message.id)));
        setCurrentSession({...currentSession, title: chatMessage.content as string})
    }
}


export const useAddSystemMessage = ()=>{
    const [, setCurrentSession] = useRecoilState(CurrentChatSessionSelector);
    return (txt: string)=>{
        setCurrentSession(cur => ({...cur, messages: cur.messages.concat([wrapSystemMessage(txt)])}))
    }
}

export const useAddUserMessage = ()=>{
    const [, setCurrentSession] = useRecoilState(CurrentChatSessionSelector);
    return (txt: string)=>{
        if(txt==="") return
        setCurrentSession(cur => ({...cur, messages: cur.messages.concat([wrapUserMessage(txt)])}))
    }
}

export const useCurrentKnodeContextPrompt = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom);
    return async ()=>`请在如下知识领域的语境中回答问题：${(await getChainStyleTitle(selectedKnodeId)).reverse().slice(1,).reduce((acc, cur)=>`${acc} - ${cur}`)}`
}

export const useSystemMessageItems = ():ItemType[]=>{
    const addSystemMessage = useAddSystemMessage();
    const currentKnodeContextPrompt = useCurrentKnodeContextPrompt();
    return [
        {
            key: "Latex",
            label: "公式兼容",
            onClick: ()=>addSystemMessage(prompts.latex)
        },{
            key: "Think",
            label: "加强逻辑",
            onClick: ()=>addSystemMessage(prompts.stepByStep)
        },{
            key: "Context",
            label: "导入语境",
            onClick: async ()=>addSystemMessage(await currentKnodeContextPrompt())
        }
    ]
}