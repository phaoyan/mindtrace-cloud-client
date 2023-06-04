import {HomeOutlined, LoginOutlined, LogoutOutlined, ShareAltOutlined, UserOutlined} from "@ant-design/icons";
import {logout} from "./service/api/LoginApi";
import React, {useMemo} from "react";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {IsLogin, User, UserShareAtom} from "./recoil/User";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {BACK_HOST, RESULT} from "./constants";
import {getUserShare} from "./service/api/ShareApi";
import {CurrentPageAtom, MessageApiAtom} from "./recoil/utils/DocumentData";
import {message} from "antd";

export const useMenuItems = ()=>{
    const isLogin = useRecoilValue(IsLogin)
    const setUser = useSetRecoilState(User)
    const navigate = useNavigate()
    return [
        {
            label: "主页",
            key: "/main",
            icon: <HomeOutlined/>
        },
        {
            label: "我的",
            key: "/user",
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
            onClick: ()=> {
                console.log("isLogin?" , isLogin)
                if(isLogin) logout().then(()=>{
                    setUser({username: "", password: "", id:-1})
                    navigate("/Login")
                })
            }
        },
    ]
}
export const useLoadLoginData = ()=>{
    const isLogin = useRecoilValue(IsLogin)
    const [user, setUser] = useRecoilState(User)
    const [current, setCurrent] = useRecoilState(CurrentPageAtom)
    const setUserShare = useSetRecoilState(UserShareAtom)
    useMemo(async ()=>{
        if(!isLogin && current !== "login"){
            try{
                let {data} = await axios.get(`${BACK_HOST}/user`);
                if(data.code === RESULT.OK){
                    setUser({
                        ...user,
                        username: data.data.username,
                        password: data.data.password,
                        id: data.data.id
                    });
                    setUserShare(await getUserShare(data.data.id))
                }
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