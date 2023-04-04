import React, {SetStateAction, useEffect} from 'react';
import { List } from 'antd';
import {useRecoilState, useRecoilValue} from "recoil";
import {EnhancerRepository} from "../../recoil/enhancer/Enhancer";
import {UserID} from "../../recoil/user/User";
import axios from "axios";
import {ENHANCER_HOST, RESULT} from "../../constants";


const queryEnhancers = (userId: number, setter: SetStateAction<any>)=> {
    axios.get(ENHANCER_HOST + "user/" + userId + "/enhancer")
        .then(({data})=>{
            if(data.code === RESULT.OK)
                setter(data.data)
            console.log("ENHANCER INIT",data)
        })
}

const EnhancerInfo = ()=> {

    const userId = useRecoilValue(UserID);
    const [enhancerRepository, setEnhancerRepository] = useRecoilState(EnhancerRepository);

    useEffect(()=>queryEnhancers(userId, setEnhancerRepository), [userId, setEnhancerRepository]);

    return (
        <List
            header={<div>Enhancer Info</div>}
            dataSource={enhancerRepository}
            renderItem={(item) => (<List.Item>{item.introduction}</List.Item>)}/>
    );
}

export default EnhancerInfo;