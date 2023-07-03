import React, {useEffect} from 'react';
import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import Main from "./components/Main/Main/Main"
import Login from "./components/Login/Login";
import {Navigate} from "react-router-dom"
import {ConfigProvider, Menu, theme} from "antd";
import {useRecoilState} from "recoil";
import classes from "./App.module.css"
import {Header} from "antd/es/layout/layout";
import logo from "./static/img/logo_no_txt.png"
import {CurrentPageAtom} from "./recoil/utils/DocumentData";
import "./reset.css"
import {useLoadLoginData, useMenuItems, useSetGlobalMessage} from "./AppHooks";
import Home from "./components/Home/Home";

const App = ()=> {
    const [current, setCurrent] = useRecoilState(CurrentPageAtom)
    const menuItems = useMenuItems()
    const location = useLocation()
    const contextHolder = useSetGlobalMessage()
    const navigate = useNavigate()
    useLoadLoginData()
    useEffect(()=>{
        setCurrent(location.pathname.replace("/",""))
        //eslint-disable-next-line
    }, [location])
    useEffect(()=>{
        navigate(current)
        //eslint-disable-next-line
    }, [current])

    return (
        <ConfigProvider theme={{algorithm: theme.defaultAlgorithm}}>
            {contextHolder}
            <div className={classes.app}>
                <Header className={classes.header}>
                    <div className={classes.logo_container}>
                        <img src={logo} alt={""} className={classes.logo}/>
                        <span className={classes.logo_txt}>Mind Trace</span>
                    </div>
                    <div className={classes.menu}>
                        <Menu
                            selectedKeys={[current]}
                            onClick={({key})=>{setCurrent(key)}}
                            mode={"horizontal"}
                            items={menuItems}/>
                    </div>
                </Header>
                <Routes>
                    <Route path="/" element={<Navigate to="/login"/>}/>
                    <Route path="/main" element=<Main/>/>
                    <Route path="/home" element=<Home/>/>
                    <Route path="/login" element=<Login/>/>
                </Routes>
            </div>
        </ConfigProvider>
    );
}

export default App;
