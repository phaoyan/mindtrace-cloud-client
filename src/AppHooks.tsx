import {HomeOutlined, LoginOutlined, LogoutOutlined, ShareAltOutlined, UserOutlined} from "@ant-design/icons";
import {logout, getLoginData} from "./service/api/LoginApi";
import React, {useMemo} from "react";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {useNavigate} from "react-router-dom";
import {getUserShare} from "./service/api/ShareApi";
import {CurrentPageAtom, MessageApiAtom} from "./recoil/utils/DocumentData";
import {message} from "antd";
import {IsLogin, LoginUserAtom} from "./components/Login/LoginHooks";
import {UserShareAtom} from "./components/Main/InfoRight/SharePanel/SharePanelHooks";

export const useMenuItems = ()=>{
    const isLogin = useRecoilValue(IsLogin)
    const navigate = useNavigate()
    return [
        {
            label: "主页",
            key: "/main",
            icon: <HomeOutlined/>
        },
        {
            label: "我的",
            key: "/home",
            icon: <UserOutlined/>
        },
        {
            label: "Mindtrace Hub",
            key: "/hub",
            icon: <ShareAltOutlined />
        },
        {
            label: <>{isLogin ? "登出" : "登录"}</>,
            key: "/login",
            icon: <>{isLogin ? <LogoutOutlined/> : <LoginOutlined/>}</>,
            onClick: async ()=> {
                if(isLogin){
                    await logout()
                    navigate("/Login")
                    window.location.reload()
                }
            }
        },
    ]
}
export const useLoadLoginData = ()=>{
    const isLogin = useRecoilValue(IsLogin)
    const [current, setCurrent] = useRecoilState(CurrentPageAtom)
    const setUser = useSetRecoilState(LoginUserAtom)
    const setUserShare = useSetRecoilState(UserShareAtom)
    useMemo(async ()=>{
        if(!isLogin && current !== "login"){
            try{
                let userData = await getLoginData();
                setUser(userData);
                setUserShare(await getUserShare(userData.id!))
            }catch (err){
                // 未登录则跳转至登陆页面
                setCurrent("login")
            }
        }
        //eslint-disable-next-line
    },[current])
}

export const useSetGlobalMessage = ()=>{
    const [messageApi, contextHolder] = message.useMessage()
    const setMessageApi = useSetRecoilState(MessageApiAtom)
    setMessageApi(messageApi)
    return contextHolder
}