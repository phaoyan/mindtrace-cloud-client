import React, {useEffect} from 'react';
import {Route, Routes} from "react-router-dom";
import Main from "./components/home/Main"
import Login from "./components/login/Login";
import {Navigate} from "react-router-dom"
import {ConfigProvider, theme} from "antd";
import {useRecoilState} from "recoil";
import {User} from "./recoil/User";
import axios from "axios";
import {BACK_HOST, RESULT} from "./constants";
import "./reset.css"

function App() {

    const [user, setUser] = useRecoilState(User);

    useEffect( ()=>{
        // 尝试从后端拿登录数据
        axios.get(`${BACK_HOST}/user`)
            .then(({data})=>{
                if(data.code === RESULT.OK)
                    setUser({...user,
                        username: data.data.username,
                        password: data.data.password,
                        id: data.data.id});
                console.log("LOGIN",data)
            })


    // eslint-disable-next-line
    },[])

    return (
        <ConfigProvider
            theme={{algorithm: theme.defaultAlgorithm}}>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Navigate to="/login"/>}/>
                    <Route path="/home" element={<Main/>}/>
                    <Route path="/login" element={<Login/>}/>
                </Routes>
            </div>
        </ConfigProvider>
    );
}

export default App;
