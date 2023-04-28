import React, {useEffect, useState} from 'react';
import classes from "./TraceInfo.module.css";
import {
    Breadcrumb,
    Cascader,
    Col,
    FloatButton,
    message,
    Pagination,
    Popover,
    Row,
    Slider, Tabs,
    Tooltip
} from "antd";
import {
    CheckOutlined, CloseOutlined,
    EditOutlined,
    FieldTimeOutlined,
    MinusOutlined, NumberOutlined, PaperClipOutlined,
    PauseOutlined,
    PlaySquareOutlined, PlusOutlined,
    TagOutlined
} from "@ant-design/icons";
import {formatMillisecondsToHHMMSS} from "../../../service/utils/TimeUtils";
import {useRecoilState, useRecoilValue} from "recoil";
import {LearningTraceAtom} from "../../../recoil/LearningTrace";
import {checkNow, continueLearning, dropLearning, pauseLearning, settleLearning} from "../../../service/api/TracingApi";
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


    const [selectedStemId, setSelectedStemId] = useState<number>(0)
    // 左半框待选leaf节点
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

    // settle右半框已被选中的leaf节点
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
                            max={1} min={0} step={0.25}
                            tooltip={{formatter: value => masteryDesc(value)}}/>
                    }
                </Col>
            </Row>
        </div>
    )

    const SettlePanel = ()=>{
        if(!open) return <></>
        return (
            <div className={classes.settle_learning}>
                <Row>
                    <Col span={12}>
                        <span className={utils.title_font}>成果结算</span>
                    </Col>
                </Row>
                <Row className={classes.settle_header}>
                    <Col span={24}>
                        <Cascader
                            placeholder={"这次学习了 . . . "}
                            className={classes.settle_cascader}
                            bordered={false}
                            expandTrigger={"hover"}
                            changeOnSelect={true}
                            options={ktreeCascaderOptions}
                            onChange={(value)=>{setSelectedStemId(value[value.length-1] as number)}}/>
                    </Col>
                </Row>
                <Divider style={{margin:" 1vh 1vh"}}/>
                <Row className={classes.settle_content}>
                    <Col span={12} className={`${classes.settle_content_left} ${utils.custom_scrollbar} ${utils.left_scrollbar}`}>
                        {leaves.length === 0 ?
                            <div className={classes.settle_content_left_placeholder_wrapper}>
                                            <span className={classes.settle_content_left_placeholder}>
                                                No Data
                                            </span>
                            </div>:
                            leaves.slice(
                                (leftLeavesPage-1) * leftLeavesPageCapacity,
                                leftLeavesPage * leftLeavesPageCapacity)
                                .map(leaf=>(
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
                        <Pagination
                            size="small"
                            current={leftLeavesPage}
                            onChange={(page)=>setLeftLeavesPage(page)}
                            pageSize={leftLeavesPageCapacity}
                            total={leaves.length}
                            hideOnSinglePage={true}
                            showSizeChanger={false}/>
                    </Col>
                    <Col span={12} className={`${classes.settle_content_right} ${utils.custom_scrollbar}`}>
                        <Divider type={"vertical"} className={classes.settle_divider}/>
                        {selectedLeafIds.length === 0 ?
                            <div className={classes.settle_content_left_placeholder_wrapper}>
                                    <span className={classes.settle_content_left_placeholder}>
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
        )
    }

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

    const [leftLeavesPage, setLeftLeavesPage] = useState(1)
    const [leftLeavesPageCapacity, setLeftLeavesPageCapacity] = useState(20)

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
                            <Divider className={utils.top_margin_horizontal_divider}/>
                            <Tabs
                                defaultActiveKey={"info"}
                                tabPosition={"left"}
                                items={[
                                    {
                                        label: <PaperClipOutlined style={{scale:"150%"}}/>,
                                        key: "info",
                                        children: (
                                            <EnhancerCard readonly={true} id={learningTrace.enhancerId}/>
                                        )
                                    },
                                    {
                                        label: <NumberOutlined style={{scale:"150%"}}/>,
                                        key: "settle",
                                        children: <SettlePanel/>
                                    }
                                ]}/>
                            <Divider className={utils.bottom_margin_horizontal_divider}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={22} offset={1}>

                        </Col>
                    </Row>
                    <Row>
                        <Col span={22}>

                        </Col>
                        <Col span={2} className={classes.icon_button_wrapper}>
                            {
                                selectedLeafIds.length !== 0 ?
                                <CheckOutlined
                                    className={utils.icon_button}
                                    style={{scale:"200%"}}
                                    onClick={submit}/> :
                                <CloseOutlined
                                    className={utils.icon_button}
                                    style={{scale:"200%"}}
                                    onClick={()=> {
                                        dropLearning(userId, learningTrace?.id)
                                            .then((success)=>{
                                                success && setLearningTrace(undefined)
                                            })
                                    }}/>
                            }
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
        </div>
    );
};

export default TraceInfo;