import React, {useEffect, useState} from 'react';
import classes from "./EnhancerCard.module.css";
import { Col, Dropdown, Input, Row} from "antd";
import {MinusOutlined, PlusOutlined} from "@ant-design/icons";
import utils from "../../../../utils.module.css"
import {getEnhancerById, updateEnhancer} from "../../../../service/api/EnhancerApi";
import {useRecoilValue} from "recoil";
import {UserID} from "../../../../recoil/User";
import {
    addResourceDropdownItems,
    Resource, ResourceType, resourceTypePlayerMapper,
    ResourceWithData
} from "../../../../service/data/Resource";
import {
    addResourceToEnhancer,
    getResourcesFromEnhancer,
    removeResource
} from "../../../../service/api/ResourceApi";
import {defaultEnhancer, Enhancer} from "../../../../service/data/Enhancer";


export const EnhancerCard = (props: { id: number, readonly? : boolean}) => {

    const userId = useRecoilValue(UserID)
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

    const handleAddResource = (resourceWithData: ResourceWithData)=>{
        addResourceToEnhancer(props.id, resourceWithData)
            .then((data) => setResources([...resources, data]))
    }


    const handleSubmit = ()=>{
        !props.readonly &&
        updateEnhancer(props.id, {...enhancer!, title})
    }

    const ResourcePlayer = (props:{resource: Resource, readonly? : boolean })=>{
        if(props.resource.type && Object.values(ResourceType).includes(props.resource.type!))
            return resourceTypePlayerMapper[props.resource.type!](props.resource, !!props.readonly)
        return <></>
    }

    return (
        <div className={classes.container}>
            <div className={classes.header_part}>
                <Row>
                    <Col span={10}>
                        {props.readonly ?
                            <span className={classes.title} style={{padding:"0.5em"}}>
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
                    <Col span={13} className={classes.tag_wrapper}>
                    </Col>
                    <Col span={1}>
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

