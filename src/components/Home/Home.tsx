import React, {useEffect, useState} from 'react';
import {Avatar, Col, Dropdown, Form, Input, message, Modal, Row, Tooltip, Upload} from "antd";
import classes from "./Home.module.css"
import {useRecoilState, useRecoilValue} from "recoil";
import {LoginUserAtom} from "../Login/LoginHooks";
import {SettingOutlined, UserOutlined} from "@ant-design/icons";
import {ChangePasswordModalAtom, useAvatarCheck, useChangePassword, useCheckUserInfo} from "./HomeHooks";
import {BACK_HOST} from "../../service/utils/constants";
import utils from "../../utils.module.css"
import {logout} from "../../service/api/LoginApi";

const Home = () => {
    const user = useRecoilValue(LoginUserAtom)
    const avatarCheck = useAvatarCheck()
    const checkUserInfo = useCheckUserInfo()
    const [avatarKey, setAvatarKey] = useState<number>(0)
    const [changePasswordModal, setChangePasswordModal] = useRecoilState<boolean>(ChangePasswordModalAtom)
    const [changePasswordForm] = Form.useForm()
    const changePassword = useChangePassword()
    useEffect(()=>{
        setAvatarKey(avatarKey + 1)
        //eslint-disable-next-line
    }, [user])
    if(!user) return <></>
    return (
        <div>
            <Row className={classes.container}>
                <Col span={20} offset={2}>
                    <div className={classes.header}>
                        <div className={classes.header_info}>
                            <Upload
                                name={"file"}
                                action={`${BACK_HOST}/user/${user.id}/avatar`}
                                beforeUpload={avatarCheck}
                                withCredentials={true}
                                showUploadList={false}
                                onChange={async (info)=>{
                                    if (info.file.status === 'uploading')
                                        console.log(info.file, info.fileList)
                                    else if (info.file.status === 'error')
                                        message.error(`${info.file.name} file upload failed.`)
                                    else if(info.file.status === 'done')
                                        await checkUserInfo()
                                }}>
                                <Tooltip title={"点击上传头像"}>
                                    <Avatar
                                        key={avatarKey}
                                        className={classes.avatar}
                                        shape={"circle"} size={64}
                                        src={user.avatar}>
                                        <UserOutlined style={{scale:"150%"}}/>
                                    </Avatar>
                                </Tooltip>
                            </Upload>
                            <span className={classes.username}>{user.username}</span>
                            <Dropdown
                                className={classes.options}
                                menu={{
                                    items:[
                                        {
                                            key: "change password",
                                            label: <span>修改密码</span>,
                                            onClick: ()=>setChangePasswordModal(true)
                                        },
                                        {
                                            key: "logout",
                                            label: <span>登出</span>,
                                            onClick: async ()=>{await logout(); window.location.reload()}
                                        }
                                    ]
                                }}>
                                <SettingOutlined className={utils.icon_button}/>
                            </Dropdown>
                        </div>
                    </div>
                </Col>
            </Row>
            <Modal
                open={changePasswordModal}
                title={"修改密码"}
                onCancel={()=>setChangePasswordModal(false)}
                cancelText={"取消"}
                okText={"完成"}
                onOk={()=>changePassword(
                    changePasswordForm.getFieldValue("oriPassword"),
                    changePasswordForm.getFieldValue("newPassword"),
                    changePasswordForm.getFieldValue("confirmPassword"))}>
                <Form
                    form={changePasswordForm}
                    labelCol={{span:6}}
                    wrapperCol={{span:12}}>
                    <Form.Item
                        label={"原密码"}
                        name={"oriPassword"}
                        rules={[{required: true, message: "请输入原密码"}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label={"新密码"}
                        name={"newPassword"}
                        rules={[{required: true, message: "请输入新密码"}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label={"确认密码"}
                        name={"confirmPassword"}
                        rules={[{required: true, message: "请确认新密码"}]}>
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Home;