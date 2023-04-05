import React from 'react';
import {useRecoilValue} from "recoil";
import {User} from "../../recoil/User";
import {Typography} from "antd";
import KnodeInfo from "./KnodeInfo";

const {Title, Paragraph} = Typography

const Home = () => {

    const user = useRecoilValue(User);

    return (
        <Typography>
            <Title>Home Page for {user.username} / {user.password} / {user.id}</Title>
            <Paragraph>
                <KnodeInfo/>
            </Paragraph>
        </Typography>
    );
};

export default Home;