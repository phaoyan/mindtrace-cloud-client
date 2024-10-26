import axios from "axios";
import {ChatMessage, ChatModel, supportStream} from "../../components/Main/InfoRight/ChatPanel/ChatPanelHooks";
import {ENHANCER_HOST} from "./EnhancerApi";
import {fetchEventSource} from "@microsoft/fetch-event-source";
import {BACK_HOST} from "../utils/constants";
import {atom, useRecoilValue} from "recoil";

export const SSEControllerAtom = atom<AbortController>({
    key: "SSEControllerAtom",
    default: new AbortController()
})

export const getResponse = async (messages: ChatMessage[], model: string="gpt-4o-mini"): Promise<ChatMessage>=>{
    return await axios.post(`${ENHANCER_HOST}/chat`, {messages: messages, model: model}).then(({data})=>data)
}


export const useGetStreamResponse = ()=>{

    const controller = useRecoilValue(SSEControllerAtom);
    return (
        messages: ChatMessage[],
        model: ChatModel="gpt-4o-mini",
        onMessage: any,
        onClose: any)=>{
        const { signal } = controller;
        fetchEventSource(
            `${BACK_HOST}/chat/stream`,
            {
                method: "POST",
                openWhenHidden: true,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream",
                },
                body: JSON.stringify({
                    messages: messages,
                    model: model,
                    stream: supportStream(model)
                }),
                onmessage: async (e) => onMessage(e),
                onclose: async ()=>onClose(),
                signal: signal,
            }
        ).then()

    }
}