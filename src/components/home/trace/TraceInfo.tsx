import React, {useEffect, useState} from 'react';
import classes from "./TraceInfo.module.css";
import {Breadcrumb, Button, Cascader, Col, FloatButton, message, Modal, Popover, Row, Slider} from "antd";
import {
    CheckOutlined,
    EditOutlined,
    FieldTimeOutlined,
    MinusOutlined,
    PauseOutlined,
    PlaySquareOutlined,
    TagOutlined
} from "@ant-design/icons";
import {formatMillisecondsToHHMMSS} from "../../../service/utils/TimeUtils";
import {useRecoilState, useRecoilValue} from "recoil";
import {LearningTraceAtom} from "../../../recoil/LearningTrace";
import {checkNow, continueLearning, pauseLearning, settleLearning} from "../../../service/api/TracingApi";
import {UserID} from "../../../recoil/User";
import {EnhancerCard} from "../info/enhancer/EnhancerCard";
import utils from "../../../utils.module.css"
import {KtreeAtom} from "../../../recoil/home/Knode";
import {getStemChain, Knode, Ktree} from "../../../service/data/Knode";
import {Divider} from "antd/lib";
import {CascaderOption} from "../../../service/utils/AntdUtils";
import {getLeaves} from "../../../service/api/KnodeApi";
import MdPreview from "../../utils/markdown/MdPreview";
import {BreadcrumbItemType} from "antd/es/breadcrumb/Breadcrumb";
import {calculateDuration, Mindtrace} from "../../../service/data/Mindtrace";
import {LearningTraceSubmitSignalAtom} from "../../../recoil/home/Mindtrace";

const TraceInfo = () => {

    const  userId = useRecoilValue(UserID)
    const [learningTrace, setLearningTrace] = useRecoilState(LearningTraceAtom)
    const [open, setOpen] = useState(false)

    useEffect(()=>{
        checkNow(userId).then((data)=> setLearningTrace(data))
    }, [setLearningTrace, userId])

    const [pause, setPause] = useState(false)
    useEffect(()=>{
        learningTrace &&
        setPause(learningTrace.pauseList.length > learningTrace.continueList.length)
    }, [learningTrace])


    // 初始化 cascader 数据源
    const convertKtreeToCascaderOptions = (branches: Ktree[]): CascaderOption[]=>{
        return branches.map(branch=>({
            value: branch.knode.id,
            label: branch.knode.title,
            children: convertKtreeToCascaderOptions(branch.branches)
        }))
    }

    const ktree = useRecoilValue<Ktree>(KtreeAtom)
    const [ktreeCascaderOptions, setKtreeCascaderOptions] = useState<CascaderOption[]>([])
    useEffect(()=>{
        setKtreeCascaderOptions(convertKtreeToCascaderOptions(ktree.branches))
        // eslint-disable-next-line
    }, [ktree])

    // modal打开时popover暂时关闭以免两者重叠
    const [settleLearningModal, setSettleLearningModal] = useState(false)
    useEffect(()=>{
        setOpen(!settleLearningModal)
    }, [settleLearningModal])


    const [selectedStemId, setSelectedStemId] = useState<number>(0)
    // modal左半框待选leaf节点
    const [leaves, setLeaves] = useState<Knode[]>([])
    useEffect(()=>{
        getLeaves(userId, selectedStemId)
            .then((data)=>{
                setLeaves(data)
            })
    }, [userId, selectedStemId])

    // 实现 breadcrumb
    const getBreadcrumbStemChainOfLeaves = (ktree: Ktree): {[id: number] : BreadcrumbItemType[]}=>{
        let res: {[id: number] : BreadcrumbItemType[]} = {}
        for(let leaf of leaves)
            res[leaf.id] = getStemChain(ktree, leaf).map(knode => ({title: <MdPreview>{knode.title}</MdPreview>}))
        return res
    }
    const [breadcrumbStemChainMap, setBreadcrumbSteamChainMap] = useState<{[id: number] : BreadcrumbItemType[]}>({})
    useEffect(()=>{
        setBreadcrumbSteamChainMap({
            ...breadcrumbStemChainMap,
            ...getBreadcrumbStemChainOfLeaves(ktree)
        })
    }, [userId, selectedStemId])

    const getDefaultRetentionMap = async ()=>{
        let allLeaves = await getLeaves(userId, ktree.knode.id)
        console.log("all leaves" , allLeaves)
        let res: {[id:number]: [number, number]} = {}
        for(let leaf of allLeaves)
            // TODO：此处可结合熟练度算法修改默认值
            res[leaf.id] = [0,0]
        console.log("res", res)
        return res
    }
    // id: [retention before, retention after]
    const [retentionMap, setRetentionMap] = useState<{[id: number]: [number, number]}>({})
    useEffect(()=>{
        getDefaultRetentionMap().then((map)=>setRetentionMap(map))
    }, [ktree])

    // modal右半框已被选中的leaf节点
    const [selected, setSelected] = useState<Knode[]>([])

    // signal用于告知record页面刷新
    const [submitSignal, setSubmitSignal] = useRecoilState(LearningTraceSubmitSignalAtom)
    const [messageApi, contextHolder] = message.useMessage()
    const submit = ()=>{
        if(!learningTrace) return 0
        messageApi.info("学习完成！（在相关知识点的“记录”页面查看）")

        let mindtraces: Mindtrace[] = []
        for(let knode of selected){
            mindtraces.push({
                id: -1,
                enhancerId: learningTrace.enhancerId,
                knodeId: knode.id,
                createBy: userId,
                createTime: "",
                retentionAfter: retentionMap[knode.id][1] / 4,
                retentionBefore: retentionMap[knode.id][0] / 4,
                reviewLayer: -1
            })
        }
        settleLearning(userId, learningTrace.id, mindtraces)
            .then(()=> {
                setSettleLearningModal(false)
                setLearningTrace(undefined)
                setSelected([])
                setSelectedStemId(0)
                setSubmitSignal(!submitSignal)
            })
    }

    const TimeBar = (props:{})=>{
        const [duration, setDuration] = useState(0)
        const [counter, setCounter] = useState(0)
        useEffect(()=>{
            let interval = setInterval(()=>{setCounter(counter + 1)}, 1000)
            return ()=>clearInterval(interval)
        })

        useEffect(()=>{
            learningTrace &&
            setDuration(calculateDuration(learningTrace))
            // eslint-disable-next-line
        }, [counter])

        return (
        <div className={classes.time_bar}>
            <FieldTimeOutlined style={{scale:"180%", color:"#666"}} />
            <span className={classes.duration}>{formatMillisecondsToHHMMSS(duration)}</span>
        </div>)
    }

    const LeafItem = (props:{leaf: Knode})=>(
        <div key={props.leaf.id}>
            <Row>
                <Col span={2}>
                    <Popover
                        arrow={false}
                        content={
                            <div>
                                <Breadcrumb items={breadcrumbStemChainMap[props.leaf.id]}/>
                            </div>}>
                        <TagOutlined/>
                    </Popover>
                </Col>
                <Col span={21} offset={1} >
                    <MdPreview>{props.leaf.title}</MdPreview>
                </Col>
            </Row>
            <Row>
                <Col span={5} offset={2} className={utils.text_vertical_center}>
                    <span className={utils.tiny_font}>before</span>
                </Col>
                <Col span={15}>
                    {retentionMap[props.leaf.id] &&
                        <Slider
                            value={retentionMap[props.leaf.id][0]}
                            onChange={(value)=>setRetentionMap({...retentionMap, [props.leaf.id]: [value, retentionMap[props.leaf.id][1]]})}
                            max={4} min={0}
                            tooltip={{
                                formatter: value =>
                                    value === 0 ? "完全没懂" :
                                    value === 1 ? "懵懵懂懂" :
                                    value === 2 ? "大致明白" :
                                    value === 3 ? "基本理解" :
                                    value === 4 ? "完全理解" : ""
                            }}/>}
                </Col>
            </Row>
            <Row>
                <Col span={5} offset={2} className={utils.text_vertical_center}>
                    <span className={utils.tiny_font}>after</span>
                </Col>
                <Col span={15}>
                    {retentionMap[props.leaf.id] &&
                        <Slider
                            value={retentionMap[props.leaf.id][1]}
                            onAfterChange={(value)=>setRetentionMap({...retentionMap, [props.leaf.id]: [retentionMap[props.leaf.id][0], value]})}
                            max={4} min={0}
                            tooltip={{
                                formatter: value =>
                                    value === 0 ? "完全没懂" :
                                    value === 1 ? "懵懵懂懂" :
                                    value === 2 ? "大致明白" :
                                    value === 3 ? "基本理解" :
                                    value === 4 ? "完全理解" : ""
                            }}/>}
                </Col>
            </Row>
        </div>
    )

    if(!learningTrace) return <div>{contextHolder}</div>
    return (
        <div className={classes.container}>
            {contextHolder}
            <Popover
                arrow={false}
                placement={"topLeft"}
                trigger={"click"}
                open={open}
                content={
                <div className={classes.content}>
                    <Row>
                        <Col span={22}>
                            <TimeBar/>
                        </Col>
                        <Col span={2} className={classes.icon_button_wrapper}>
                            {pause ?
                                <PlaySquareOutlined
                                    style={{scale: "200%"}}
                                    className={utils.icon_button}
                                    onClick={()=> {continueLearning(userId, learningTrace.id).then((data)=> {
                                        setLearningTrace(data)
                                        setPause(false)
                                    })}}/> :
                                <PauseOutlined
                                    style={{scale: "200%"}}
                                    className={utils.icon_button}
                                    onClick={()=>pauseLearning(userId, learningTrace.id).then((data)=> {
                                        setLearningTrace(data)
                                        setPause(true)
                                    })}/>
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col span={18}>
                            <EnhancerCard readonly={true} id={learningTrace.enhancerId}/>
                        </Col>
                        <Col></Col>
                    </Row>
                    <Row>
                        <Col span={22}></Col>
                        <Col span={2} className={classes.icon_button_wrapper}>
                            <CheckOutlined
                                style={{scale:"200%"}}
                                className={utils.icon_button}
                                onClick={()=>setSettleLearningModal(true)}/>
                        </Col>
                    </Row>

                </div>}>
                <FloatButton
                    className={classes.float}
                    icon={<EditOutlined/>}
                    onClick={()=>setOpen(!open)}/>
            </Popover>

            <Modal
                open={settleLearningModal}
                onCancel={()=>setSettleLearningModal(false)}
                onOk={()=>setSettleLearningModal(false)}
                footer={[
                    <Button
                        key={1}
                        type={"primary"}
                        onClick={submit}>
                        完成！
                    </Button>
                ]}>
                <div className={classes.settle_learning_modal}>
                    <Row>
                        <Col span={12}>
                            <span className={utils.title_font}>成果结算</span>
                        </Col>
                    </Row>
                    <Row className={classes.modal_header}>
                        <Col span={24}>
                            <Cascader
                                placeholder={"这次学习了 . . . "}
                                className={classes.modal_cascader}
                                bordered={false}
                                changeOnSelect={true}
                                options={ktreeCascaderOptions}
                                onChange={(value)=>{setSelectedStemId(value[value.length-1] as number)}}/>
                        </Col>
                    </Row>
                    <Divider style={{margin:" 1vh 1vh"}}/>
                    <Row className={classes.modal_content}>
                        <Col span={12} className={`${classes.modal_content_left} ${utils.custom_scrollbar} ${utils.left_scrollbar}`}>
                            {leaves.length === 0 ?
                                <div className={classes.modal_content_left_placeholder_wrapper}>
                                    <span className={classes.modal_content_left_placeholder}>
                                        No Data
                                    </span>
                                </div>:
                                leaves.map(leaf=>(
                                    <div key={leaf.id}>
                                        <LeafItem leaf={leaf}/>
                                        <Row>
                                            <Col span={3} offset={21}>
                                                <CheckOutlined
                                                    style={{scale:"100%"}}
                                                    className={utils.icon_button}
                                                    onClick={()=>setSelected([...selected, leaf])}/>
                                            </Col>
                                        </Row>
                                        <Divider style={{margin:"1vh 0"}}/>
                                    </div>
                                ))}
                        </Col>
                        <Col span={12} className={`${classes.modal_content_right} ${utils.custom_scrollbar}`}>
                            <Divider type={"vertical"} className={classes.modal_divider}/>
                            {selected.length === 0 ?
                                <div className={classes.modal_content_left_placeholder_wrapper}>
                                    <span className={classes.modal_content_left_placeholder}>
                                        No Data
                                    </span>
                                </div>:
                                selected.map(_selected=>(
                                    <div key={_selected.id}>
                                        <LeafItem leaf={_selected}/>
                                        <Row>
                                            <Col span={3} offset={21}>
                                                <MinusOutlined
                                                    style={{scale:"100%"}}
                                                    className={utils.icon_button}
                                                    onClick={()=>setSelected(selected.filter(knode=>knode.id !== _selected.id))}/>
                                            </Col>
                                        </Row>
                                        <Divider style={{margin:"1vh 0"}}/>
                                    </div>))}
                        </Col>
                    </Row>

                </div>
            </Modal>
        </div>
    );
};

export default TraceInfo;