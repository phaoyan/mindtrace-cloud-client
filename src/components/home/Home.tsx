import React from 'react';
import {useRecoilValue} from "recoil";
import {User} from "../../recoil/user/User";
import {Typography} from "antd";
import KnodeInfo from "./KnodeInfo";
import EnhancerInfo from "./EnhancerInfo";

const {Title, Paragraph} = Typography

const Home = () => {

    const user = useRecoilValue(User);

    return (
        <Typography>
            <Title>Home Page for {user.username} / {user.password} / {user.id}</Title>
            <Paragraph>
                <KnodeInfo/>
            </Paragraph>
            <Paragraph>
                <EnhancerInfo/>
            </Paragraph>
        </Typography>
    );
};

export default Home;