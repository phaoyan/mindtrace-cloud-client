import React, {Fragment, useEffect, useState} from 'react';
import {Button, Card, Input, Modal, Switch, Tabs} from 'antd';
import {useRecoilValue} from "recoil";
import {UserID} from "../../recoil/User";
import {MinusOutlined, PlusOutlined} from "@ant-design/icons";
import {Enhancer} from "../../service/data/Enhancer";
import {updateEnhancer} from "../../service/api/EnhancerApi";
import {Table} from "antd/lib";
import {Resource} from "../../service/data/Resource";
import {getResourcesFromEnhancer} from "../../service/api/ResourceApi";


export const EditQuizCard = (
    props: {
        onDataChange: (data:{
            type:string,
            title:string,
            createBy:number,
            privacy:string,
            data:Map<string, any>
        })=>void
    })=>{

    const [isFront, setFront] = useState(true)
    const [frontContent, setFrontContent] = useState("")
    const [backContent, setBackContent] = useState("")
    const userId = useRecoilValue(UserID)
    
    const sendDataToParent = ()=>{
        let data = new Map<string, any>();
        data.set("front", frontContent);
        data.set("back", backContent);
        props.onDataChange({
            type: "Quizcard",
            title: "",
            createBy: userId,
            privacy: "private",
            data: data
        })
    }

    const handleSwitch = (checked: boolean)=>{
        setFront(checked)
    }

    // eslint-disable-next-line
    useEffect(()=>{sendDataToParent()}, [frontContent, backContent])

    return (
        <div>
            {isFront
            ? <Input.TextArea
                    autoSize={true}
                    bordered={false}
                    placeholder={"卡片正面..."}
                    style={{width:"90%"}}
                    value={frontContent}
                    onChange={({target: {value}})=>setFrontContent(value)}/>
            : <Input.TextArea
                    autoSize={true}
                    bordered={false}
                    placeholder={"卡片背面..."}
                    style={{width:"90%"}}
                    value={backContent}
                    onChange={({target:{value}})=>setBackContent(value)}/>}
            <Switch defaultChecked={true} onChange={handleSwitch}/>
        </div>
    )

}

export const EnhancerCard = (props:{ori:Enhancer})=>{

    const userId = useRecoilValue(UserID);
    const [showAddResourceModal, setShowAddResourceModal] = useState(false)
    const [submitData, setSubmitData] = useState({})
    const [enhancer, setEnhancer] = useState({...props.ori})
    const [resources, setResources] = useState<Resource[]>([])

    // enhancer -> resources
    useEffect(()=>{
        getResourcesFromEnhancer(userId, enhancer.id)
            .then((data)=>setResources(data))
    }, [enhancer, userId])

    return (
        <div>
            <Card
                headStyle={{padding: "0 0"}}
                bordered={false}
                title={
                    <div>
                        <Input
                            style={{width:"78%"}}
                            bordered={false}
                            value={enhancer.title}
                            onChange={({target:{value}})=>setEnhancer({...enhancer, title: value})}
                            onBlur={()=>updateEnhancer(userId, enhancer.id, enhancer).then(data=> console.log(data))}/>
                        <Button
                            style={{marginRight:"3%"}}
                            shape="circle"
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={()=>setShowAddResourceModal(true)}/>
                        <Button
                            shape="circle"
                            type="primary"
                            icon={<MinusOutlined/>}
                            onClick={()=>{

                            }}/>
                    </div>
                }

                children={
                    <Fragment>
                        <Input.TextArea
                            autoSize={true}
                            bordered={false}
                            value={enhancer.introduction}
                            onChange={({target:{value}})=>setEnhancer({...enhancer, introduction: value})}
                            onBlur={()=>updateEnhancer(userId, enhancer.id, enhancer).then(data=> console.log(data))}/>
                        <Table
                            dataSource={resources} columns={[
                            {
                                title: "名称",
                                key: "title",
                                dataIndex: "title"
                            },
                            {
                                title: "类型",
                                key: "type",
                                dataIndex: "type"
                            }
                        ]}/>
                    </Fragment>
                }
            />

            <Modal
                title={"Add Resource"}
                open={showAddResourceModal}
                onOk={()=>{
                    console.log("SUBMIT DATA", submitData)
                    setShowAddResourceModal(false)
                }}
                onCancel={()=>{
                    setShowAddResourceModal(false)
                }}>
                <Tabs defaultActiveKey={"Quizcard"} items={[
                    {
                        key:"Quizcard",
                        label:"知识卡片",
                        children:<EditQuizCard onDataChange={(data)=>{setSubmitData(data)}}/>
                    },
                    {
                        key:"Markdown",
                        label:"概述"
                    }
                ]}/>
            </Modal>
        </div>
    )
}

