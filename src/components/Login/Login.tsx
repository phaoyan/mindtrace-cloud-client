import React from 'react';
import {Button, Col, Form, Input, Row, Typography} from "antd";
import classes from "./Login.module.css"
import {User} from "../../recoil/User"
import {useRecoilState, useRecoilValue} from "recoil";
import {LoginErrorAtom, useLogin, useRegister} from "./LoginHooks";


const {Title, Paragraph} = Typography

const Login = () => {
    const [user, setUser] = useRecoilState(User);
    const error = useRecoilValue(LoginErrorAtom)
    const login = useLogin()
    const register = useRegister()
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
                                <Row>
                                    <Col span={18}>
                                        <Button
                                            className={classes.commit}
                                            type="primary" htmlType="submit"
                                            onClick={()=>login()}>
                                            登录
                                        </Button>
                                    </Col>
                                    <Col span={4} offset={2}>
                                        <Button
                                            className={classes.commit}
                                            type="primary" htmlType="submit"
                                            onClick={()=>register()}>
                                            注册
                                        </Button>
                                    </Col>
                                </Row>
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