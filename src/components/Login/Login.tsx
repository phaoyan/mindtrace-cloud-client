import React, {useState} from 'react';
import {Button, Col, Form, Input, Modal, Row, Tooltip, Typography} from "antd";
import classes from "./Login.module.css"
import {useRecoilState, useRecoilValue} from "recoil";
import {
    LoginErrorAtom,
    RegisterModalOpenAtom,
    useLogin,
    useRegisterConfirm,
    useRegisterSendValidateCode
} from "./LoginHooks";


const {Title, Paragraph} = Typography

const Login = () => {
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [registerModalOpen, setRegisterModalOpen] = useRecoilState(RegisterModalOpenAtom)
    const error = useRecoilValue(LoginErrorAtom)
    const login = useLogin()
    const sendValidateCode = useRegisterSendValidateCode()
    const confirmRegister = useRegisterConfirm()
    const [registerForm] = Form.useForm()
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
                                    value={username}
                                    onChange={({target: {value}})=>setUsername(value)}
                                    bordered={false} placeholder="请输入用户名"/>
                            </Form.Item>
                            <Form.Item
                                name="password"
                                className={classes.info}
                                rules={[{ required: true, message:"请输入密码" }]}>
                                <Input.Password
                                    value={password}
                                    onChange={({target:{value}})=>setPassword(value)}
                                    bordered={false} placeholder="请输入密码"/>
                            </Form.Item>
                            <Form.Item wrapperCol={{span: 24}}>
                                <Row>
                                    <Col span={18}>
                                        <Button
                                            className={classes.commit}
                                            type="primary" htmlType="submit"
                                            onClick={()=>login(username, password)}>
                                            登录
                                        </Button>
                                    </Col>
                                    <Col span={4} offset={2}>
                                        <Button
                                            className={classes.commit}
                                            type="primary"
                                            onClick={()=>setRegisterModalOpen(true)}>
                                            注册
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Item>
                        </Form>
                        {error && <span>用户名或密码错误</span>}
                    </Paragraph>
                </Typography>
                <Modal
                    title={"注册"}
                    open={registerModalOpen}
                    keyboard={true}
                    onCancel={()=>setRegisterModalOpen(false)}
                    footer={[]}>
                    <div className={classes.register_form_wrapper}>
                        <Form
                            name={"basic"}
                            form={registerForm}
                            onFinish={(data)=> confirmRegister(data.username, data.password, data.rePassword, data.email, data.validate)}
                            labelCol={{span: 8}}
                            wrapperCol={{span: 16}}
                            autoComplete={"off"}>
                            <Form.Item
                                label={"用户名"}
                                name={"username"}
                                rules={[{required: true, message:"请输入用户名"}]}>
                                <Input/>
                            </Form.Item>
                            <Form.Item
                                label={"密码"}
                                name={"password"}
                                rules={[{required: true, message:"请输入密码"}]}>
                                <Input.Password/>
                            </Form.Item>
                            <Form.Item
                                label={"重复密码"}
                                name={"rePassword"}
                                rules={[{required: true, message:"请输入密码"}]}>
                                <Input.Password/>
                            </Form.Item>
                            <Form.Item
                                label={"qq邮箱"}
                                name={"email"}
                                rules={[{required: true, type:"email", message:"请提供有效邮箱以供身份校验" }]}>
                                <Input/>
                            </Form.Item>
                            <Form.Item style={{direction:"rtl"}}>
                                <Button
                                    type={"primary"}
                                    onClick={()=>sendValidateCode(registerForm.getFieldValue("email"))}>
                                    发送验证码
                                </Button>
                            </Form.Item>
                            <Form.Item
                                label={"验证码"}
                                name={"validate"}
                                rules={[{required: true, message:"请输入验证码"}]}>
                                <Input/>
                            </Form.Item>
                            <span className={classes.info}>
                                网站作者注（重要）：注册后，我会同时收到通知并主动根据你的QQ邮箱加你的QQ号。有任何使用上的问题或者建议可以直接和我沟通。
                                目前网站的用户很少，我十分希望能够留住除了我自己以外的其他长期使用者。
                                Mindtrace的大愿景是知识共享，你在Mindtrace中记录的笔记将会被所有其他Mindtrace使用者看到，相应地，你也能无条件地查看任何其他Mindtrace使用者的笔记。
                                我本人（Mindtrace中搜索juumii）在Mindtrace中记录了自己在大学课内学习过程中的笔记，以及目前学习编曲的笔记和网站教学资源等，注册后可以直接查看我的笔记。我们可以分享交流相关学习经验。
                            </span>
                            <Form.Item wrapperCol={{span:24}}>
                                <div className={classes.register_complete_wrapper}>
                                    <Button
                                        className={classes.register_complete_button}
                                        htmlType={"submit"}
                                        type={"primary"} >
                                        完成
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default Login;