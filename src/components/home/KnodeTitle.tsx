import React, {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {UserID} from "../../recoil/User";
import {updateKnode} from "../../service/api/KnodeApi";
import classes from "./KnodeTitle.module.css"
import MarkdownInline from "../utils/markdown/MarkdownInline";
import {KnodeSelector, SelectedKnodeIdAtom} from "../../recoil/home/Knode";
import {defaultMindtrace, masteryDesc, Mindtrace} from "../../service/data/Mindtrace";
import {getMindtracesByKnodeId} from "../../service/api/TracingApi";
import dayjs from "dayjs";
import {CheckOutlined, ScheduleOutlined} from "@ant-design/icons";
import utils from "../../utils.module.css"
import {LearningTraceAtom} from "../../recoil/LearningTrace";
import {SelectedLeafIdsAtom} from "../../recoil/home/Mindtrace";

const KnodeTitle = (props: { id: number, possessorRef: HTMLDivElement}) => {

    const userId = useRecoilValue(UserID);
    const [knode, setKnode] = useRecoilState(KnodeSelector(props.id))
    const [lastTrace, setLastTrace] = useState<Mindtrace>(defaultMindtrace)

    useEffect(()=>{
        knode &&
        getMindtracesByKnodeId(userId, knode.id).then((data)=>{
            data.length !== 0 &&
            setLastTrace(data[data.length-1])
        })
    },[userId, knode])

    useEffect(()=>{
        lastTrace.id !== -1 &&
        console.log("last trace", lastTrace)
    }, [lastTrace])

    const interval = ()=>{
        let days = dayjs().diff(dayjs(lastTrace.createTime), 'day');
        return days > 365 ? ". . . " : days + "天"
    }

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const learningTrace = useRecoilValue(LearningTraceAtom)
    const [selectedLeafIds, setSelectedLeaves] = useRecoilState(SelectedLeafIdsAtom)

    if(!knode) return <></>
    return (
        <div className={classes.container}>
            <div>
                <MarkdownInline
                    possessorRef={props.possessorRef}
                    editKey={props.id}
                    className={classes.title}
                    initialText={knode.title}
                    // @ts-ignore
                    onTextChange={({target: {value}})=>setKnode({...knode, title: value})}
                    onSubmit={()=>updateKnode(knode, userId)}/>
            </div>
            <div className={classes.options}>
                {

                    (knode.isLeaf || knode.branchIds.length === 0) &&
                    <div className={classes.info}>
                        <span className={classes.time}>{interval()}</span>
                        <span className={classes.mastery}>{masteryDesc(lastTrace.retentionAfter)}</span>
                    </div>
                }

                {
                    // 如果选中且learning trace存在，则可以点击这里将其记录到trace info中
                    knode.id === selectedKnodeId &&
                    knode.branchIds.length === 0 &&
                    !selectedLeafIds.includes(knode.id) &&
                    learningTrace &&
                    <div className={classes.record}>
                        <ScheduleOutlined
                            className={utils.icon_button}
                            onClick={(e)=>{
                                e.stopPropagation()
                                setSelectedLeaves([...selectedLeafIds, knode?.id])
                            }}/>
                    </div>
                }
                {
                    selectedLeafIds.includes(knode.id) &&
                    <div>
                        <CheckOutlined style={{color:"#666"}}/>
                    </div>
                }
            </div>
        </div>
    );
};

export default KnodeTitle;