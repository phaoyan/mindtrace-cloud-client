import React, {useEffect, useMemo, useState} from 'react';
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import Main from "./components/home/Main"
import Login from "./components/login/Login";
import {Navigate} from "react-router-dom"
import {ConfigProvider, Menu, MenuProps, theme} from "antd";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {IsLogin, User, UserShareAtom} from "./recoil/User";
import axios from "axios";
import {BACK_HOST, RESULT} from "./constants";
import {HomeOutlined, LoginOutlined, LogoutOutlined, ShareAltOutlined, UserOutlined} from "@ant-design/icons";
import classes from "./App.module.css"
import {Header} from "antd/es/layout/layout";
import logo from "./static/img/logo.png"
import {CurrentPageAtom} from "./recoil/utils/DocumentData";
import {logout} from "./service/api/LoginApi";
import "./reset.css"
import {getUserShare} from "./service/api/ShareApi";

const App = ()=> {

    const [user, setUser] = useRecoilState(User)
    const isLogin = useRecoilValue(IsLogin)

    // Menu
    const [current, setCurrent] = useRecoilState(CurrentPageAtom)
    const navigate = useNavigate()
    const [items, setItems] = useState<MenuProps['items']>([])
    useEffect(()=>{
        setItems([
            {
                label: "主页",
                key: "main",
                icon: <HomeOutlined/>
            },
            {
                label: "我的",
                key: "user",
                icon: <UserOutlined/>
            },
            {
                label: "Mindtrace Hub",
                key: "hub",
                icon: <ShareAltOutlined />
            },
            {
                label: <>{isLogin ? "登出" : "登录"}</>,
                key: "login",
                icon: <>{isLogin ? <LogoutOutlined/> : <LoginOutlined/>}</>,
                onClick: ()=> {
                    console.log("isLogin?" , isLogin)
                    if(isLogin) logout().then(()=>{
                        setUser({username: "", password: "", id:-1})
                        navigate("/login")
                    })
                }
            },
        ])
    },[user])


    const setUserShare = useSetRecoilState(UserShareAtom)
    // 尝试从后端拿登录数据
    useMemo(async ()=>{
        if(!isLogin && current !== "login"){
            try{
                let {data} = await axios.get(`${BACK_HOST}/user`);
                console.log("test login", data)
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
        else navigate(`/${current}`)
        //eslint-disable-next-line
    },[current])

    let location = useLocation()
    useEffect(()=>{
        setCurrent(location.pathname.replace("/",""))
    }, [location])


    return (
        <ConfigProvider
            theme={{algorithm: theme.defaultAlgorithm}}>
            <div className={classes.app}>
                <Header className={classes.header}>
                    <div className={classes.logo}>
                        <img src={logo} alt={""} style={{scale:"80%", height: "10vh"}}/>
                    </div>
                    <div className={classes.menu}>
                        <Menu
                            selectedKeys={[current]}
                            onClick={({key})=>{setCurrent(key)}}
                            mode={"horizontal"}
                            items={items}/>
                    </div>
                </Header>
                <Routes>
                    <Route path="/" element={<Navigate to="/login"/>}/>
                    <Route path="/main" element={<Main/>}/>
                    <Route path="/login" element={<Login/>}/>
                </Routes>
            </div>
        </ConfigProvider>
    );
}

export default App;
