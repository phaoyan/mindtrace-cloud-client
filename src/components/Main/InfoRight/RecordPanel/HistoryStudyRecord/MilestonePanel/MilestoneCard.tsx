import {useRecoilState, useRecoilValue} from "recoil";
import {ReadonlyModeAtom} from "../../../../Main/MainHooks";
import React, {useEffect, useState} from "react";
import {
    Resource,
    ResourcePlayer,
    useAddResourceDropdownItems
} from "../../../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import {StudyTrace} from "../../../../../../service/data/Tracing";
import {
    addResourceToMilestone,
    getMilestoneById,
    getResourcesFromMilestone,
    getStudyTracesInMilestone, removeMilestone, removeResourceFromMilestone, setMilestoneDescription, setMilestoneTime
} from "../../../../../../service/api/TracingApi";
import {Col, DatePicker, Dropdown, Input, Popconfirm, Popover, Row} from "antd";
import {
    CalendarOutlined,
    DeleteOutlined,
    DownOutlined,
    MinusOutlined,
    PlusOutlined,
    UpOutlined
} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css";
import classes from "./MilestonePanel.module.css";
import dayjs from "dayjs";
import {
    Milestone,
    MilestoneTracesAtomFamily,
    MilestonesAtom,
    SelectedMilestoneIdAtom,
    MilestoneTraceIdsAtom
} from "./MilestonePanelHooks";
import {StudyTraceRecord} from "../StudyTraceRecord";
import {formatMillisecondsToHHMM} from "../../../../../../service/utils/TimeUtils";
import {DEFAULT_DATE_TIME_PATTERN} from "../../../../../../service/utils/constants";

export const MilestoneCard = (props:{milestoneId: number})=>{

    const readonly = useRecoilValue(ReadonlyModeAtom)
    const [milestone, setMilestone] = useState<Milestone>()
    const [milestones, setMilestones] = useRecoilState(MilestonesAtom)
    const [selectedMilestoneId, setSelectedMilestoneId] = useRecoilState(SelectedMilestoneIdAtom)
    const [resources, setResources] = useState<Resource[]>([])
    const [traces, setTraces] = useRecoilState(MilestoneTracesAtomFamily(props.milestoneId))
    const [, setTraceIds] = useRecoilState(MilestoneTraceIdsAtom)
    const [showTraces, setShowTraces] = useState<boolean>(false)
    const [duration, setDuration] = useState<number>(0)
    const addResourceDropdownItems = useAddResourceDropdownItems()

    useEffect(()=>{
        const effect = async ()=>{
            setMilestone(await getMilestoneById(props.milestoneId))
            setResources(await getResourcesFromMilestone(props.milestoneId))
            const studyTraces = await getStudyTracesInMilestone(props.milestoneId);
            setTraces(studyTraces)
            setTraceIds((traceIds)=>[...traceIds, ...studyTraces.map(trace=>trace.id)])
        }; effect().then()
        //eslint-disable-next-line
    }, [props.milestoneId])
    useEffect(()=>{
        setDuration([0, ...traces.map(trace=>trace.seconds)].reduce((sec1,sec2)=>sec1+sec2))
    }, [traces])

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
                <Col span={8}>
                    <Popover
                        content={
                        <div>
                            <DatePicker onChange={async (date,dateString)=> {
                                const dateTime = dayjs(dateString).format(DEFAULT_DATE_TIME_PATTERN);
                                setMilestone({...milestone, time: dateTime})
                                await setMilestoneTime(props.milestoneId, dateTime)
                            }}/>
                        </div>}>
                        <span className={classes.timestamp}>
                            {dayjs(milestone.time).format("YYYY-MM-DD")}&nbsp;&nbsp;&nbsp;&nbsp;
                                {traces.length !== 0 && formatMillisecondsToHHMM(duration * 1000)}
                        </span>
                    </Popover>
                </Col>
                <Col span={1}>
                    <CalendarOutlined
                        className={utils.icon_button}
                        style={{color: selectedMilestoneId === props.milestoneId ? "#44a393" : "#333"}}
                        onClick={()=>{setSelectedMilestoneId(selectedMilestoneId === props.milestoneId ? undefined : props.milestoneId)}}/>
                </Col>
                <Col span={1} offset={1}>
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
                        onChange={({target: {value}})=> {
                            setMilestone({...milestone, description: value})
                            setMilestones([{...milestone, description: value}, ...milestones.filter((item)=>item.id !== milestone?.id)])
                        }}
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
            )))}
            <Row>
                <Col span={1}>{
                    showTraces ?
                    <UpOutlined
                        className={utils.icon_button_normal}
                        onClick={()=>setShowTraces(false)}/> :
                    <DownOutlined
                        className={utils.icon_button_normal}
                        onClick={()=>setShowTraces(true)}/>
                }</Col>
                <Col span={23}>{
                    showTraces &&
                    traces.map(trace=><StudyTraceRecord trace={trace} milestoneId={props.milestoneId} key={trace.id}/>)}
                    <span className={classes.show_traces_prompt}>点击展开学习记录 . . .</span>
                </Col>
            </Row>
        <br/>
    </div>
    )
}