import React, {Fragment, useEffect, useState} from 'react';
import {User, UserID} from "../../recoil/User";
import {useRecoilValue} from "recoil";
import {Button, Col, Input, Row, Tree} from "antd";
import {DeleteOutlined, DiffOutlined, MinusOutlined, PlusOutlined} from "@ant-design/icons";
import classes from "./KnodeInfo.module.css"
import "../../service/api/api.ts"
import {getEnhancersForKnode} from "../../service/api/EnhancerApi";
import {Enhancer} from "../../service/data/Enhancer";
import {branch, clearDeletedKnodes, getKnodes, removeKnode, updateKnode} from "../../service/api/KnodeApi";
import {EnhancerCard} from "./EnhancerCard";
import {
    appendToKtree,
    constructKtree,
    convertKtree,
    defaultKnode,
    Knode,
    Ktree,
    KtreeAntd, removeFromKtree
} from "../../service/data/Knode";

export const KnodeTitle = (props:{ori: Knode}) => {

    const userId = useRecoilValue(UserID);
    const [knode, setKnode] = useState<Knode>(props.ori)

    return (
        <div style={{display:"flex"}}>
            <div>
                <Input
                    value={knode?.title}
                    bordered={false}
                    onChange={({target: {value}})=>{setKnode({...knode, title: value})}}
                    onBlur={()=>updateKnode(knode, userId)}/>
            </div>
        </div>
    );
};

const KnodeInfo = () => {
    const {id: userId} = useRecoilValue(User);

    const [selectedId, setSelectedId] = useState<number>(0)

    const [enhancersForSelectedKnode, setEnhancersForSelectedKnode] = useState<Enhancer[]>([])
    const [ktree, setKtree] = useState<Ktree>({knode:defaultKnode, branches:[]})
    const [ktreeAntd, setKtreeAntd] = useState<KtreeAntd[]>([])

    // user -> ktree
    useEffect(()=>{
        console.log(`user:${userId} -> ktree`)
        getKnodes(userId)
            .then((data)=> {
                console.log(data)
                try{
                    setKtree(constructKtree(data))
                }catch (e){}
            })
    },[userId])

    // ktree -> ktreeAntd
    useEffect(()=>{
        console.log("ktree -> ktreeAntd")
        setKtreeAntd(convertKtree([ktree]))
    }, [ktree])

    // selectedId -> enhancers
    useEffect(()=>{
        if(selectedId)
            getEnhancersForKnode(userId, selectedId)
            .then(enhancers=>setEnhancersForSelectedKnode(enhancers))
    }, [selectedId, userId])


    return (
        <Fragment>
            <Row>
                <Col span={12} className={classes.left}>
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        onClick={()=>
                            branch(userId, selectedId)
                                .then((data)=> {
                                    setKtree(appendToKtree({...ktree}, {knode: data, branches: []}))
                                })}/>
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<MinusOutlined />}
                        onClick={()=>
                            removeKnode(userId, selectedId)
                                .then(()=>{
                                    setKtree(removeFromKtree({...ktree}, selectedId))
                                })
                    }/>
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<DeleteOutlined />}
                        onClick={()=>clearDeletedKnodes(userId)}/>
                    <Button
                        shape="circle"
                        type="primary"
                        icon={<DiffOutlined/>}
                        onClick={()=>{}}/>
                    <Tree
                        // @ts-ignore
                        onSelect={(selectedKeys)=>{setSelectedId(selectedKeys[0]?.valueOf())}}
                        treeData={ktreeAntd}/>
                </Col>
                <Col span={12} className={classes.right}>
                    {enhancersForSelectedKnode.map(enhancer=><EnhancerCard ori={enhancer} key={enhancer.id}/>)}
                </Col>
            </Row>
        </Fragment>
    );
};

export default KnodeInfo;