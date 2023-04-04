import React, {Fragment, SetStateAction, useEffect, useState} from 'react';
import axios from "axios";
import {CORE_HOST, RESULT} from "../../constants";
import {UserID} from "../../recoil/user/User";
import {useRecoilState, useRecoilValue} from "recoil";
import {KnodeRepository, KtreeAntdTreeSelector, KtreeSelector} from "../../recoil/knode/Knode";
import {Button, Col, Row, Tree} from "antd";
import {MinusOutlined, PlusOutlined} from "@ant-design/icons";

const CORE_USER_KNODE_PREFIX = (userId: number)=>CORE_HOST + "user/" + userId + "/knode/"

const queryKnodes = (userId:number, setKnodeRepository: SetStateAction<any>)=>{
    axios.get(CORE_USER_KNODE_PREFIX(userId))
        .then(({data})=>{
            if(data.code === RESULT.OK)
                setKnodeRepository(data.data)
            console.log("KNODE INIT",data);
        })
}

const branch = (
    userId: number,
    knodeId: number,
    setKnodeRepository: SetStateAction<any>)=>{
    axios.post(CORE_USER_KNODE_PREFIX(userId) + knodeId + "/branch?title=EPT")
        .then(({data})=>{
            if(data.code === RESULT.OK)
                queryKnodes(userId, setKnodeRepository)
            console.log("BRANCH", data)
        })
}

const remove = (
    userId: number,
    knodeId: number,
    setKnodeRepository: SetStateAction<any>)=>{
    axios.delete(CORE_USER_KNODE_PREFIX(userId) + knodeId)
        .then(({data})=>{
            if(data.code === RESULT.OK)
                queryKnodes(userId, setKnodeRepository)
            console.log("REMOVE KNODE", data)
        })
}

const KnodeInfo = () => {
    const userId = useRecoilValue(UserID);
    const [knodeRepository, setKnodeRepository] = useRecoilState(KnodeRepository);
    const ktree = useRecoilValue(KtreeSelector);
    const ktreeAntd = useRecoilValue(KtreeAntdTreeSelector)
    const [selected, setSelected] = useState<any | null>(null)


    useEffect(()=>queryKnodes(userId, setKnodeRepository),[setKnodeRepository, userId]);
    useEffect(()=>console.log("KTREE",ktree), [knodeRepository, ktree])
    useEffect(()=>console.log("KTREE_ANTD", ktreeAntd), [ktreeAntd])
    useEffect(()=>console.log("KNODE SELECTED", selected), [selected])

    return (
        <Fragment>
            <Row>
                <Col span={12}>
                    <Tree
                        onSelect={(selectedKeys)=>{setSelected(selectedKeys[0])}}
                        treeData={ktreeAntd}/>
                </Col>
                <Col span={12}>
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={()=>branch(userId, selected, setKnodeRepository)}/>
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<MinusOutlined />}
                        onClick={()=>remove(userId, selected, setKnodeRepository)}/>
                </Col>
            </Row>
        </Fragment>
    );
};

export default KnodeInfo;