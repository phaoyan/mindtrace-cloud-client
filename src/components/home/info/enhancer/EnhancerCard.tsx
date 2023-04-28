import React, {useEffect, useState} from 'react';
import classes from "./EnhancerCard.module.css";
import {Button, Col, Dropdown, Input, Row} from "antd";
import {DeleteOutlined, EditOutlined, MinusOutlined, PlusOutlined} from "@ant-design/icons";
import utils from "../../../../utils.module.css"
import {removeEnhancerFromUser, updateEnhancerOfUser} from "../../../../service/api/EnhancerApi";
import {useRecoilState, useRecoilValue} from "recoil";
import {UserID} from "../../../../recoil/User";
import {EnhancerSelector, EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import {RESULT} from "../../../../constants";
import {
    addResourceDropdownItems,
    Resource, ResourceType, resourceTypePlayerMapper,
    ResourceWithData
} from "../../../../service/data/Resource";
import {
    addResourceToEnhancer,
    getResourcesFromEnhancer,
    removeResourceFromUser
} from "../../../../service/api/ResourceApi";
import {LearningTraceAtom} from "../../../../recoil/LearningTrace";
import {startLearning} from "../../../../service/api/TracingApi";


export const EnhancerCard = (props: { id: number, readonly? : boolean}) => {

    const userId = useRecoilValue(UserID)
    const [enhancers, setEnhancers] = useRecoilState(EnhancersForSelectedKnodeAtom)
    const [enhancer, setEnhancer] = useRecoilState(EnhancerSelector(props.id))
    const [learningTrace, setLearningTrace] = useRecoilState(LearningTraceAtom)
    const [resources, setResources] = useState<Resource[]>([])

    const [title, setTitle] = useState("")
    useEffect(()=>{
        setTitle(enhancer?.title!)
    },[enhancer])

    const [readonly, setReadonly] = useState(false)
    useEffect(()=> {
        props.readonly && setReadonly(props.readonly)
    }, [props.readonly])

    useEffect(() => {
        getResourcesFromEnhancer(userId, props.id)
            .then((data) => setResources(data))
        // eslint-disable-next-line
    }, [])
    const handleAddResource = (resourceWithData: ResourceWithData)=>{
        addResourceToEnhancer(userId, props.id, resourceWithData)
            .then((data) => setResources([...resources, data]))
    }
    const handleStartLearning = ()=>{
        startLearning(userId, enhancer?.id!)
            .then((data)=>{
                setLearningTrace(data)
            })
    }

    const handleSubmit = ()=>{
        updateEnhancerOfUser(userId, props.id, {...enhancer!, title})
    }

    const ResourcePlayer = (props:{resource: Resource})=>{
        if(props.resource.type && Object.values(ResourceType).includes(props.resource.type!))
            return resourceTypePlayerMapper[props.resource.type!](props.resource)
        return <></>
    }

    return (
        <div className={classes.container}>
            <div className={classes.header_part}>
                <Row>
                    <Col span={10}>
                        <Input
                            value={title}
                            onChange={({target: {value}}) =>
                                enhancer &&
                                setTitle(value)}
                            onBlur={() => handleSubmit()}
                            placeholder={". . ."}
                            className={classes.title}
                            bordered={false}/>
                    </Col>
                    <Col span={13} className={classes.tag_wrapper}>
                        {/*<Tag closable={true} bordered={false} className={classes.tag}>例题</Tag>*/}
                        {/*<Tag closable={true} bordered={false} className={classes.tag}>计算</Tag>*/}
                        {/*{enhancer?.labels.map(label=>*/}
                        {/*    <Tag*/}
                        {/*        key={label.name}*/}
                        {/*        closable*/}
                        {/*        bordered={false}*/}
                        {/*        className={classes.tag}>*/}
                        {/*        {label.name}*/}
                        {/*    </Tag>)}*/}
                        {/*{readonly ? <></>:*/}
                        {/*    <Dropdown*/}
                        {/*        menu={{*/}
                        {/*            items:[{*/}
                        {/*                key: "example",*/}
                        {/*                label: "例题"*/}
                        {/*            }]*/}
                        {/*        }}>*/}
                        {/*        <Tag bordered={false} className={classes.tag}>*/}
                        {/*            <PlusOutlined style={{scale: "100%"}} className={utils.icon_button}/>*/}
                        {/*        </Tag>*/}
                        {/*    </Dropdown>}*/}
                    </Col>
                    <Col span={1}>
                        {readonly ? <></>:
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
                            <ResourcePlayer resource={resource}/>
                        </Col>
                        <Col span={1}>
                            {readonly ? <></>:
                                <MinusOutlined
                                    className={`${classes.resource_delete} ${utils.icon_button}`}
                                    onClick={()=>
                                        removeResourceFromUser(userId, resource.id!)
                                            .then(()=>setResources(resources.filter(temp=>temp.id !== resource.id)))}/>}
                        </Col>
                    </Row>
                ))}
            </div>
            <div className={classes.footer_part}>
                <Row>
                    <Col span={23}>
                        {!learningTrace &&
                            <Button
                                style={{border: "none"}}
                                icon={<EditOutlined/>}
                                onClick={handleStartLearning}>
                                开始学习
                            </Button>
                        }
                    </Col>
                    <Col span={1}>
                        {readonly ? <></>:
                            <DeleteOutlined
                                className={utils.icon_button}
                                onClick={() => {
                                    removeEnhancerFromUser(userId, props.id)
                                        .then((data) =>
                                            data.code === RESULT.OK &&
                                            setEnhancers(enhancers.filter(enhancer => enhancer.id !== props.id)))
                                }}/>}
                    </Col>
                </Row>
            </div>
        </div>
    )
}

