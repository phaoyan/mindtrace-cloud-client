import React, {SetStateAction, useState} from 'react';
import {Button, Form, Input, Typography} from "antd";
import classes from "./Login.module.css"
import {User} from "../../recoil/User"
import {SetterOrUpdater, useRecoilState} from "recoil";
import axios from "axios";
import {BACK_HOST, RESULT} from "../../constants";
import {useNavigate, NavigateFunction} from "react-router-dom"

const {Title, Paragraph} = Typography

const login = (user:{username:string, password: string, id:number},
               nav: NavigateFunction,
               setError:SetStateAction<any>,
               setUser: SetterOrUpdater<any>)=>{
    // 发送请求
    axios.post(`${BACK_HOST}/user/login`, {username: user.username, password: user.password})
        .then(({data})=> {
            console.log(data);
            // 若响应成功则跳转到主页，并将用户信息保存
                if(data.code===RESULT.OK){
                    setUser({...user, id: data.data})
                    nav("/home");
                }
            // 若响应失败则提示重新输入
                else setError(data.msg)
        });

}

const Login = () => {
    const [user, setUser] = useRecoilState(User);
    const [error, setError] = useState(null);
    const nav  = useNavigate();

    return (
        <div className={classes.container}>
            <div className={classes.login}>
                <Typography>
                    <Title>
                        Mindtrace
                    </Title>
                    <Paragraph>
                        <Form
                            name="basic"
                            wrapperCol={{span: 24}}
                            className={classes.form}>
                            <Form.Item
                                name="username"
                                className={classes.info}
                                rules={[{ required: true, message:"请输入用户名"}]}>
                                <Input
                                    value={user.username}
                                    onChange={(e)=>setUser({...user, username: e.target.value})}
                                    bordered={false} placeholder="请输入用户名"/>
                            </Form.Item>
                            <Form.Item
                                name="password"
                                className={classes.info}
                                rules={[{ required: true, message:"请输入密码" }]}>
                                <Input.Password
                                    value={user.password}
                                    onChange={(e)=>setUser({...user, password:e.target.value})}
                                    bordered={false} placeholder="请输入密码"/>
                            </Form.Item>

                            <Form.Item wrapperCol={{span: 24}}>
                                <Button
                                    className={classes.commit} type="primary" htmlType="submit"
                                    onClick={()=>login(user, nav, setError, setUser)}>
                                    登录
                                </Button>
                            </Form.Item>
                        </Form>
                        {error && <span>用户名或密码错误</span>}
                    </Paragraph>
                </Typography>
            </div>
        </div>
    );
};

export default Login;