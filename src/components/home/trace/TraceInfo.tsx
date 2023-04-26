import React, {useEffect, useState} from 'react';
import classes from "./TraceInfo.module.css";
import {Breadcrumb, Button, Cascader, Col, FloatButton, message, Modal, Popover, Row, Slider, Tag, Tooltip} from "antd";
import {
    CheckOutlined, CloseOutlined,
    EditOutlined,
    FieldTimeOutlined,
    MinusOutlined,
    PauseOutlined,
    PlaySquareOutlined, PlusOutlined,
    TagOutlined
} from "@ant-design/icons";
import {formatMillisecondsToHHMMSS} from "../../../service/utils/TimeUtils";
import {useRecoilState, useRecoilValue} from "recoil";
import {LearningTraceAtom} from "../../../recoil/LearningTrace";
import {checkNow, continueLearning, pauseLearning, settleLearning} from "../../../service/api/TracingApi";
import {UserID} from "../../../recoil/User";
import {EnhancerCard} from "../info/enhancer/EnhancerCard";
import utils from "../../../utils.module.css"
import {getKnode, KtreeAtom, SelectedKnodeSelector} from "../../../recoil/home/Knode";
import {getStemChain, Knode, Ktree} from "../../../service/data/Knode";
import {Divider} from "antd/lib";
import {CascaderOption} from "../../../service/utils/AntdUtils";
import {getLeaves} from "../../../service/api/KnodeApi";
import MdPreview from "../../utils/markdown/MdPreview";
import {BreadcrumbItemType} from "antd/es/breadcrumb/Breadcrumb";
import {calculateDuration, masteryDesc, Mindtrace} from "../../../service/data/Mindtrace";
import {LearningTraceSubmitSignalAtom, SelectedLeafIdsAtom} from "../../../recoil/home/Mindtrace";
import InfoRightCss from "../info/InfoRight.module.css"
import LearningTraceTimeLineCss from "../info/record/LearningTraceTimeline.module.css"


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
        // eslint-disable-next-line
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
        //eslint-disable-next-line
    }, [ktree])

    // modal右半框已被选中的leaf节点
    const [selectedLeafIds, setSelectedLeafIds] = useRecoilState<number[]>(SelectedLeafIdsAtom)

    // signal用于告知record页面刷新
    const [submitSignal, setSubmitSignal] = useRecoilState(LearningTraceSubmitSignalAtom)
    const [messageApi, contextHolder] = message.useMessage()
    const submit = ()=>{
        if(!learningTrace) return 0
        messageApi.info("学习完成！（在相关知识点的“记录”页面查看）")

        let mindtraces: Mindtrace[] = []
        for(let id of selectedLeafIds){
            mindtraces.push({
                id: -1,
                enhancerId: learningTrace.enhancerId,
                knodeId: id,
                createBy: userId,
                createTime: "",
                retentionAfter: retentionMap[id][1],
                retentionBefore: retentionMap[id][0],
                reviewLayer: -1
            })
        }
        settleLearning(userId, learningTrace.id, mindtraces)
            .then(()=> {
                setSettleLearningModal(false)
                setLearningTrace(undefined)
                setSelectedLeafIds([])
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
                            max={1} min={0}
                            step={0.25}
                            tooltip={{
                                formatter: value => masteryDesc(value)
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
                            tooltip={{formatter: value => masteryDesc(value)}}/>
                    }
                </Col>
            </Row>
        </div>
    )

    const selectedKnode = useRecoilValue(SelectedKnodeSelector)
    // 链式标题
    const [selectedKnodeStemChain, setSelectedKnodeStemChain] = useState<Knode[]>([])
    useEffect(()=>{
        selectedKnode &&
        setSelectedKnodeStemChain(getStemChain(ktree, selectedKnode))
        //eslint-disable-next-line
    }, [selectedKnode])

    const addSelectedKnodeToSelectedLeaves = ()=>{
        selectedKnode?.branchIds.length === 0 &&
        setSelectedLeafIds([...selectedLeafIds, selectedKnode.id])
    }


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
                        <Col span={10}>
                            <TimeBar/>
                        </Col>
                        <Col span={12}>
                            <div className={classes.selected_knode_title_wrapper}>
                                {
                                    // 当这个knode不是叶子，或这个knode已经被选中后，不显示这个加号
                                    selectedKnode?.branchIds.length === 0 &&
                                    !selectedLeafIds.includes(selectedKnode.id) &&
                                    <Tooltip title={"加入本次学习"}>
                                        <PlusOutlined
                                            className={utils.icon_button}
                                            onClick={()=>addSelectedKnodeToSelectedLeaves()}/>
                                    </Tooltip>}
                                <Popover
                                    placement={"topLeft"}
                                    arrow={false}
                                    content={<div>
                                        <Breadcrumb items={selectedKnodeStemChain}/>
                                    </div>}>
                                    <span className={InfoRightCss.title} style={{cursor: "default"}}>
                                        <MdPreview>{selectedKnode?.title}</MdPreview>
                                    </span>
                                </Popover>
                            </div>
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
                        <Col span={24}>
                            <EnhancerCard readonly={true} id={learningTrace.enhancerId}/>
                            <Divider className={utils.bottom_margin_horizontal_divider}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={22}>
                            <div>
                                {selectedLeafIds.map(id=>(
                                    <Tag
                                        key={id}
                                        className={LearningTraceTimeLineCss.knode_tag}
                                        bordered={false}>
                                        <div className={classes.selected_leaf_wrapper}>
                                            <div>
                                                <MdPreview>{getKnode(ktree, id)?.title}</MdPreview>
                                            </div>
                                            <CloseOutlined 
                                                className={utils.icon_button} style={{scale:"100%"}}
                                                onClick={()=>setSelectedLeafIds(selectedLeafIds.filter(_id=>_id !== id))}/>
                                        </div>
                                    </Tag>
                                ))}
                            </div>
                        </Col>
                        <Col span={2} className={classes.icon_button_wrapper}>
                            <CheckOutlined
                                style={{scale:"200%"}}
                                className={utils.icon_button}
                                onClick={()=>setSettleLearningModal(true)}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={22}></Col>

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
                    (
                        selectedLeafIds.length !== 0 &&
                        <Button
                            key={1}
                            type={"primary"}
                            onClick={submit}>
                            完成！
                        </Button>
                    )
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
                                                    onClick={()=>setSelectedLeafIds([...selectedLeafIds, leaf.id])}/>
                                            </Col>
                                        </Row>
                                        <Divider style={{margin:"1vh 0"}}/>
                                    </div>
                                ))}
                        </Col>
                        <Col span={12} className={`${classes.modal_content_right} ${utils.custom_scrollbar}`}>
                            <Divider type={"vertical"} className={classes.modal_divider}/>
                            {selectedLeafIds.length === 0 ?
                                <div className={classes.modal_content_left_placeholder_wrapper}>
                                    <span className={classes.modal_content_left_placeholder}>
                                        No Data
                                    </span>
                                </div>:
                                selectedLeafIds.map(id=>(
                                    <div key={id}>
                                        <LeafItem leaf={getKnode(ktree, id)!}/>
                                        <Row>
                                            <Col span={3} offset={21}>
                                                <MinusOutlined
                                                    style={{scale:"100%"}}
                                                    className={utils.icon_button}
                                                    onClick={()=>setSelectedLeafIds(selectedLeafIds.filter(_id=>_id !== id))}/>
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