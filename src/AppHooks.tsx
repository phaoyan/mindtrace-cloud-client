import {
    HomeOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import React from "react";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {MessageApiAtom} from "./recoil/utils/DocumentData";
import {message} from "antd";
import {CurrentUserAtom} from "./components/Main/Main/MainHooks";

export const useMenuItems = ()=>{
    const currentUser = useRecoilValue(CurrentUserAtom)
    return [
        {
            label: "主页",
            key: "/main",
            disabled: !currentUser,
            icon: <HomeOutlined/>
        },
        {
            label: "搜索",
            key: "/search",
            icon: <SearchOutlined/>
        }
    ]
}

export const useSetGlobalMessage = ()=>{
    const [messageApi, contextHolder] = message.useMessage()
    const setMessageApi = useSetRecoilState(MessageApiAtom)
    setMessageApi(messageApi)
    return contextHolder
}