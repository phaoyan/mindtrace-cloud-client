import axios from "axios";
import {ChatMessage} from "../../components/Main/InfoRight/ChatPanel/ChatPanelHooks";
import {BACK_HOST} from "../utils/constants";
import {ENHANCER_HOST} from "./EnhancerApi";

export const CHAT_HOST =`${BACK_HOST}/chat`

export const getResponse = async (messages: ChatMessage[]): Promise<ChatMessage>=>{
    return await axios.post(`${ENHANCER_HOST}/chat`, messages).then(({data})=>data)
}
