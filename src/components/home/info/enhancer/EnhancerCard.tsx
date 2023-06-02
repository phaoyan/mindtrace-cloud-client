import React, {useEffect, useState} from 'react';
import classes from "./EnhancerCard.module.css";
import {Col, Dropdown, Input, Row, Tooltip} from "antd";
import {MinusOutlined, PlusOutlined, PushpinOutlined, ScissorOutlined} from "@ant-design/icons";
import utils from "../../../../utils.module.css"
import {getEnhancerById, updateEnhancer} from "../../../../service/api/EnhancerApi";
import { useRecoilValue, useSetRecoilState} from "recoil";
import {UserID} from "../../../../recoil/User";
import {
    addResourceDropdownItems,
    Resource, ResourcePlayer, ResourceType, resourceTypePlayerMapper,
    ResourceWithData
} from "../../../../service/data/Resource";
import {
    addResourceToEnhancer,
    getResourcesFromEnhancer,
    removeResource
} from "../../../../service/api/ResourceApi";
import {defaultEnhancer, Enhancer} from "../../../../service/data/Enhancer";
import {EnhancerCardIdClipboardAtom} from "../../../../recoil/home/Enhancer";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import useMessage from "antd/es/message/useMessage";

export const EnhancerCard = (props: { id: number, readonly? : boolean}) => {

    const userId = useRecoilValue(UserID)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [enhancer, setEnhancer] = useState<Enhancer>(defaultEnhancer)
    const [resources, setResources] = useState<Resource[]>([])
    const [title, setTitle] = useState("")
    useEffect(()=>{
        const init = async ()=>{
            setEnhancer(await getEnhancerById(props.id))
            setResources(await getResourcesFromEnhancer(props.id))
        };init()
    }, [props.id])
    useEffect(()=>{
        setTitle(enhancer.title)
    },[enhancer])

    const handleAddResource = async (resourceWithData: ResourceWithData)=>{
        setResources([...resources, await addResourceToEnhancer(props.id, resourceWithData)])
    }


    const handleSubmit = ()=>{
        !props.readonly &&
        updateEnhancer(props.id, {...enhancer!, title})
    }



    const setEnhancerIdClipboard = useSetRecoilState(EnhancerCardIdClipboardAtom)
    const [messageApi, contextHolder] = useMessage()

    return (
        <div className={classes.container}>
            {contextHolder}
            <div className={classes.header_part}>
                <Row>
                    <Col span={10}>
                        {props.readonly ?
                            <span
                                className={classes.title}
                                style={{padding:"0.5em"}}>
                                {title}
                            </span> :
                            <Input
                                value={title}
                                onChange={({target: {value}}) =>
                                    enhancer &&
                                    setTitle(value)}
                                onBlur={() => handleSubmit()}
                                placeholder={". . ."}
                                className={classes.title}
                                bordered={false}/>
                        }

                    </Col>
                    <Col span={11} className={classes.tag_wrapper}>
                    </Col>
                    <Col span={1}>
                        <ScissorOutlined
                            className={utils.icon_button}
                            onClick={()=>{
                                setEnhancerIdClipboard([props.id, selectedKnodeId])
                                messageApi.success("笔记剪切成功")
                            }}/>
                    </Col>
                    <Col span={1} offset={1}>
                        {props.readonly ? <></>:
                            <Dropdown
                                menu={{items: addResourceDropdownItems(handleAddResource, userId)}}>
                                <PlusOutlined className={utils.icon_button}/>
                            </Dropdown>}
                    </Col>
                </Row>
            </div>

            <div className={classes.main_part}>
                {resources.map(resource => (
                    <Row key={resource.id}>
                        <Col span={23}>
                            <ResourcePlayer resource={resource} readonly={props.readonly}/>
                        </Col>
                        <Col span={1}>
                            {props.readonly ? <></>:
                                <MinusOutlined
                                    className={`${classes.resource_delete} ${utils.icon_button}`}
                                    onClick={()=>
                                        removeResource(resource.id!).then(
                                        ()=>setResources(resources.filter(temp=>temp.id !== resource.id)))}/>}
                        </Col>
                    </Row>
                ))}
            </div>

        </div>
    )
}

