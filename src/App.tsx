import React, {useEffect, useState} from 'react';
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import Main from "./components/Main/Main/Main"
import {Navigate} from "react-router-dom"
import {Avatar, ConfigProvider, Menu, Popover, theme, Tooltip} from "antd";
import {useRecoilState, useRecoilValue} from "recoil";
import classes from "./App.module.css"
import {Header} from "antd/es/layout/layout";
import logo from "./static/img/logo_no_txt.png"
import {CurrentPageAtom} from "./recoil/utils/DocumentData";
import "./reset.css"
import {useMenuItems, useSetGlobalMessage} from "./AppHooks";
import Home from "./components/Home/Home";
import 'dayjs/locale/zh-cn';
import locale from 'antd/locale/zh_CN';
import GuestSearch from "./components/Search/GuestSearch";
import {getLoginData, getUserPublicInfoByUsername} from "./service/api/LoginApi";
import {CurrentUserAtom} from "./components/Main/Main/MainHooks";
import {IsLogin, LoginUserAtom} from "./components/Login/LoginHooks";
import {UserOutlined} from "@ant-design/icons";
import utils from "./utils.module.css"
import Login from "./components/Login/Login";
import Intro from "./components/Intro/Intro";

const App = ()=> {
    const [loading, setLoading] = useState(true)
    const isLogin = useRecoilValue(IsLogin)
    const [loginUser, setLoginUser] = useRecoilState(LoginUserAtom)
    const [currentUser, setCurrentUser] = useRecoilState(CurrentUserAtom)
    const [current, setCurrent] = useRecoilState(CurrentPageAtom)
    const menuItems = useMenuItems()
    const location = useLocation()
    const contextHolder = useSetGlobalMessage()
    const navigate = useNavigate()
    useEffect(()=>{
        const effect = async ()=>{
            const visit = new URLSearchParams(location.search).get("visit");
            visit && setCurrentUser(await getUserPublicInfoByUsername(visit))
            if(!isLogin && current !== "login"){
                try{
                    setLoginUser(await getLoginData());
                }catch (err){
                    setLoginUser(undefined)
                }
            }
            setLoading(false)
        }; effect().then()
        //eslint-disable-next-line
    }, [location])
    useEffect(()=>{
        setCurrent(location.pathname.replace("/",""))
        //eslint-disable-next-line
    }, [location])
    useEffect(()=>{
        navigate(current)
        //eslint-disable-next-line
    }, [current])
    useEffect(()=>{
        !currentUser && loginUser && setCurrentUser(loginUser)
        //eslint-disable-next-line
    }, [currentUser, loginUser])

    if(loading) return <></>
    return (
        <ConfigProvider
            theme={{algorithm: theme.defaultAlgorithm}}
            locale={locale}>
            {contextHolder}
            <div className={classes.app}>
                <Header className={classes.header}>
                    <div className={classes.logo_container}>
                        <img src={logo} alt={""} className={classes.logo}/>
                        <span className={classes.logo_txt}>Mind Trace</span>
                    </div>
                    <div className={classes.menu}>
                        <Menu
                            className={classes.menu_item}
                            selectedKeys={[current]}
                            onClick={({key})=>{setCurrent(key)}}
                            mode={"horizontal"}
                            items={menuItems}/>
                        <div className={`${classes.user_info}`}>{
                            loginUser ?
                            <Popover
                                placement={"left"}
                                trigger={"click"}
                                arrow={false}
                                content={<Home/>}>
                                <Avatar
                                    className={utils.icon_button}
                                    size={25} shape={"circle"}
                                    src={currentUser?.avatar}>
                                    <UserOutlined/>
                                </Avatar>
                            </Popover>:
                            <Tooltip
                                placement={"left"}
                                title={"点击登录 / 注册"}>
                                <Popover
                                    placement={"left"}
                                    trigger={"click"}
                                    arrow={false}
                                    content={<Login/>}>
                                    <UserOutlined className={utils.icon_button}/>
                                </Popover>
                            </Tooltip>
                        }</div>
                    </div>
                </Header>
                <Routes>
                    <Route path="/" element={<Navigate to={"/main"}/>}/>
                    <Route path="/main" element={<Main/>}/>
                    <Route path="/home" element=<Home/>/>
                    <Route path="/intro" element=<Intro/>/>
                    <Route path="/search" element=<GuestSearch/>/>
                </Routes>
            </div>
        </ConfigProvider>
    );
}

export default App;
