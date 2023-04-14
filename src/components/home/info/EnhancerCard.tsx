import React, {useEffect, useState} from 'react';
import classes from "./EnhancerCard.module.css";
import {Col, Dropdown, Input, Row} from "antd";
import {DeleteOutlined, MinusOutlined, PlusOutlined} from "@ant-design/icons";
import utils from "../../../utils.module.css"
import {removeEnhancerFromUser, updateEnhancerOfUser} from "../../../service/api/EnhancerApi";
import {useRecoilState, useRecoilValue} from "recoil";
import {UserID} from "../../../recoil/User";
import {EnhancerSelector, EnhancersForSelectedKnodeAtom} from "../../../recoil/home/Enhancer";
import {RESULT} from "../../../constants";
import {
    addResourceDropdownItems,
    Resource, resourceTypePlayerMapper,
    ResourceWithData
} from "../../../service/data/Resource";
import {
    addResourceToEnhancer,
    getResourcesFromEnhancer,
    removeResourceFromUser
} from "../../../service/api/ResourceApi";


export const EnhancerCard = (props: { id: number }) => {

    const userId = useRecoilValue(UserID)
    const [enhancers, setEnhancers] = useRecoilState(EnhancersForSelectedKnodeAtom)
    const [enhancer, setEnhancer] = useRecoilState(EnhancerSelector(props.id))
    const [resources, setResources] = useState<Resource[]>([])

    useEffect(() => {
        getResourcesFromEnhancer(userId, props.id)
            .then((data) => setResources(data))
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        console.log("Resources", resources)
    }, [resources])

    const handleAddResource = (resourceWithData: ResourceWithData)=>{
        addResourceToEnhancer(userId, props.id, resourceWithData)
            .then((data) => setResources([...resources, data]))
    }

    return (
        <div className={classes.container}>
            <div className={classes.header_part}>
                <Row>
                    <Col span={23}>
                        <Input
                            value={enhancer?.title}
                            onChange={({target: {value}}) =>
                                enhancer &&
                                setEnhancer({...enhancer, title: value})}
                            onBlur={() => updateEnhancerOfUser(userId, props.id, enhancer!)}
                            placeholder={". . ."}
                            className={classes.title}
                            bordered={false}/>
                    </Col>
                    <Col span={1}>
                        <Dropdown
                            menu={{items: addResourceDropdownItems(handleAddResource, userId)}}>
                            <PlusOutlined className={utils.icon_button}/>
                        </Dropdown>
                    </Col>
                </Row>
            </div>

            <div className={classes.main_part}>
                {resources.map(resource => (
                    <Row key={resource.id}>
                        <Col span={23}>
                            {resourceTypePlayerMapper[resource.type!](resource)}
                        </Col>
                        <Col span={1}>
                            <MinusOutlined
                                className={`${classes.resource_delete} ${utils.icon_button}`}
                                onClick={()=>
                                    removeResourceFromUser(userId, resource.id!)
                                    .then(()=>setResources(resources.filter(temp=>temp.id !== resource.id)))}/>
                        </Col>
                    </Row>
                ))}
            </div>
            <div className={classes.footer_part}>
                <Row>
                    <Col span={23}>

                    </Col>
                    <Col span={1}>
                        <DeleteOutlined
                            className={utils.icon_button}
                            onClick={() => {
                                removeEnhancerFromUser(userId, props.id)
                                    .then((data) =>
                                        data.code === RESULT.OK &&
                                        setEnhancers(enhancers.filter(enhancer => enhancer.id !== props.id)))
                            }}/>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

