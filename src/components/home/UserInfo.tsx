import React from 'react';
import {List} from "antd";
import {useRecoilValue} from "recoil";
import {User} from "../../recoil/user/User";

const UserInfo = () => {

    const user = useRecoilValue(User);
    return (
        <List
            header={<div>User Info</div>}
            dataSource={Object.entries(user)}
            renderItem={item=><List.Item>{item[1]}</List.Item>}/>
    );
};

export default UserInfo;