import {atom, selector, useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {
    addMilestone,
    addResourceToMilestone,
    getMilestoneById,
    getResourcesFromMilestone, removeMilestone, removeResourceFromMilestone, setMilestoneDescription
} from "../../../../../../service/api/TracingApi";
import React, {useEffect, useState} from "react";
import {Col, Dropdown, Input, Popconfirm, Row} from "antd";
import dayjs from "dayjs";
import {
    Resource,
    ResourcePlayer,
    useAddResourceDropdownItems
} from "../../../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import {DeleteOutlined, MinusOutlined, PlusOutlined} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css";
import classes from "./MilestonePanel.module.css"
import {ReadonlyModeAtom} from "../../../../Main/MainHooks";

export interface Milestone{
    id: number
    knodeId: number
    userId: number
    description: string,
    time: string
}

export const MilestonesAtom = atom<Milestone[]>({
    key: "milestonesAtom",
    default: []
})

export const MilestoneCardsSelector = selector<any[]>({
    key: "MilestoneCardsSelector",
    get: ({get})=>{
        const milestones = get(MilestonesAtom);
        return milestones.map(milestone=>({
            children:<MilestoneCard milestoneId={milestone.id}/>,
            time: milestone.time
        }))
    }
})

export const MilestoneCard = (props:{milestoneId: number})=>{

    const readonly = useRecoilValue(ReadonlyModeAtom)
    const [milestone, setMilestone] = useState<Milestone>()
    const [milestones, setMilestones] = useRecoilState(MilestonesAtom)
    const [resources, setResources] = useState<Resource[]>([])
    const addResourceDropdownItems = useAddResourceDropdownItems()

    useEffect(()=>{
        const effect = async ()=>{
            setMilestone(await getMilestoneById(props.milestoneId))
            setResources(await getResourcesFromMilestone(props.milestoneId))
        }; effect().then()
    }, [props.milestoneId])

    if(!milestone) return <></>
    return (
        <div>
            <Row>
                <Col span={1}>
                    <Popconfirm
                        title={"确定删除？"}
                        showCancel={false}
                        onConfirm={async ()=>{
                            await removeMilestone(milestone?.id)
                            setMilestones(milestones.filter(milestone=>milestone.id !== props.milestoneId))
                        }}>
                        <DeleteOutlined className={utils.icon_button_normal}/>
                    </Popconfirm>
                </Col>
                <Col span={6}>
                    <span className={classes.timestamp}>{dayjs(milestone.time).format("YYYY-MM-DD")}</span>
                </Col>
                <Col span={1}>
                    <Dropdown
                        menu={{items: addResourceDropdownItems, onClick: async (data: any)=>{
                                const resource = await addResourceToMilestone(props.milestoneId, data.key);
                                setResources([...resources, resource])
                            }}}>
                        <PlusOutlined className={utils.icon_button}/>
                    </Dropdown>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Input
                        defaultValue={milestone.description}
                        placeholder={"描述 . . ."}
                        onChange={({target: {value}})=>setMilestone({...milestone, description: value})}
                        onBlur={async ()=>await setMilestoneDescription(props.milestoneId, milestone?.description || " ")}
                        className={classes.description}
                        bordered={false}
                        disabled={readonly}/>
                </Col>
            </Row>{
                resources.map((resource=>(
                    <Row key={resource.id}>
                        <Col span={23}>
                            <ResourcePlayer resource={resource} readonly={readonly}/>
                        </Col>
                        <Col span={1}>{
                            !readonly &&
                            <MinusOutlined
                                className={`${classes.resource_delete} ${utils.icon_button}`}
                                onClick={async ()=>{
                                    await removeResourceFromMilestone(resource.id!)
                                    setResources(resources.filter(temp=>temp.id !== resource.id))
                                }}/>
                        }</Col>
                    </Row>
                )))
            }<br/>
        </div>
    )
}

export const useAddMilestone = ()=>{
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [milestones, setMilestones] = useRecoilState(MilestonesAtom)
    return async ()=>{
        setMilestones([...milestones, await addMilestone(selectedKnodeId)])
    }
}