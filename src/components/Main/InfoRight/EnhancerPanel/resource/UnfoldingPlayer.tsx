import React, {useEffect, useState} from 'react';
import {Breadcrumb, Col, Divider, Pagination, Row, Tooltip} from "antd";
import utils from "../../../../../utils.module.css"
import classes from "./UnfoldingPlayer.module.css"
import {
    BlockOutlined,
    CheckOutlined,
    CloseOutlined, DownloadOutlined,
    HourglassOutlined,
    VerticalRightOutlined
} from "@ant-design/icons";
import {BreadcrumbItemType} from "antd/es/breadcrumb/Breadcrumb";
import MdPreview from "../../../../utils/markdown/MdPreview";
import {addDataToResource, getAllDataFromResource, getUnfoldingKnodeData} from "../../../../../service/api/ResourceApi";
import {useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../recoil/home/Knode";
import {formatMillisecondsToHHMMSS} from "../../../../../service/utils/TimeUtils";
import dayjs from "dayjs";
import {Resource, unfoldingTemplate} from "../EnhancerCard/EnhancerCardHooks";
import PlainLoading from "../../../../utils/general/PlainLoading";

export interface KnodeData{
    title: string,
    chainStyleTitle: string[],
    knodeId: number,
    stemId: number,
    tag: boolean,
    unfolded: boolean
}
interface KnodeDataTree{
    knodeData: KnodeData,
    branches: KnodeDataTree[]
}
const constructTree = (repo: KnodeData[]): KnodeDataTree => {
    let treeMap: Map<number, KnodeDataTree> = new Map<number, KnodeDataTree>();
    for (let knode of repo)
        treeMap.set(knode.knodeId, {knodeData: knode, branches: []});
    for (let [, tree] of treeMap) {
        let stemId = tree.knodeData.stemId;
        if (!stemId) continue;
        let stem = treeMap.get(stemId)
        if (!stem) continue;
        stem.branches.push(tree)
    }
    return treeMap.get(repo[0].knodeId)!
}
const _initLeft = (tree:KnodeDataTree): KnodeData[]=>{
    if(tree.knodeData.unfolded)
        return tree.branches.map(br=>_initLeft(br)).flat()
    else return [tree.knodeData]
}
const initLeft = (knodeDataList: KnodeData[])=>{
    const tree = constructTree(knodeDataList);
    return _initLeft(tree)
}
const initRight = (dataJson: KnodeData[])=>{
    let res = dataJson.filter(knode=>knode.unfolded)
    res.sort((a,b)=>(+a.tag) - (+b.tag))
    return res
}


const UnfoldingPlayer = (props:{meta: Resource, readonly? : boolean}) => {


    const [data, setData] = useState<{knodes:KnodeData[], configs:object}>(unfoldingTemplate(props.meta.id!).data)
    const [loading, setLoading] = useState(false)
    const [leftKnodes, setLeftKnodes] = useState<KnodeData[]>([])
    const [rightKnodes, setRightKnodes] = useState<KnodeData[]>([])
    useEffect(()=>{
        const init = async ()=>{
            const resp = await getAllDataFromResource(props.meta.id!);
            const dataJson = JSON.parse(resp["data.json"]);
            setData(dataJson)
            setLoading(false)
        }; init()
        //eslint-disable-next-line
    },[])
    useEffect(()=>{
        setLeftKnodes(initLeft(data.knodes))
        setRightKnodes(initRight(data.knodes))
    },[data.knodes])

    const updateKnodeData = (knode: KnodeData)=>{
        setData({...data, knodes: data.knodes.map(cur=> cur.knodeId === knode.knodeId ? knode: cur)})
    }

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const loadKnodes = async ()=>{
        const knodeDataList = await getUnfoldingKnodeData(selectedKnodeId);
        const newValue = {...data, knodes: knodeDataList}
        !props.readonly && await addDataToResource(props.meta.id!, newValue)
        setData(newValue)
        setLeftKnodes(initLeft(knodeDataList))
        setRightKnodes(initRight(knodeDataList))
    }

    const breadcrumbTitle = (chainStyleTitle: string[]):BreadcrumbItemType[] =>{
        if(chainStyleTitle)
            return chainStyleTitle
                .filter(title=>title!=="ROOT")
                .map(title=>({title: <MdPreview>{title}</MdPreview>}))
                .reverse()
                .slice(-3)
        return []
    }
    const LeftItem = (props: {data: KnodeData })=>{
        return (
            <div>
                <Row>
                    <Col span={2}>
                        <BlockOutlined
                            className={utils.icon_button_grey}
                            onClick={()=>updateKnodeData({...props.data, unfolded: true})}/>
                    </Col>
                    <Col span={21} offset={1}>
                        <Breadcrumb items={breadcrumbTitle(props.data.chainStyleTitle)}/>
                    </Col>
                </Row>
                <Divider style={{margin:"0.3em 0"}}/>
            </div>
        )
    }
    const RightItem = (props: {data: KnodeData})=>{
        return (
            <div>
                <Row>
                    <Col span={2} style={{display:"flex", justifyItems:"center", justifyContent:"center"}}>
                        {props.data.tag ?
                            <CloseOutlined
                                className={utils.icon_button_normal}
                                style={{color: "#FF9616"}}
                                onClick={()=>updateKnodeData({...props.data, tag: false})}/>:
                            <CheckOutlined
                                className={utils.icon_button_normal}
                                style={{color: "#16C8FF"}}
                                onClick={()=>updateKnodeData({...props.data, tag: true})}/>
                        }
                    </Col>
                    <Col span={19}>
                        <Breadcrumb items={breadcrumbTitle(props.data.chainStyleTitle)}/>
                    </Col>
                    <Col span={2} offset={1}>
                        <VerticalRightOutlined
                            className={utils.icon_button_grey}
                            onClick={()=>{updateKnodeData({...props.data, unfolded:false})}}/>
                    </Col>
                </Row>
                <Divider style={{margin:"0.3em 0"}}/>
            </div>
        )
    }

    const [startTime, setStartTime] = useState<any>(undefined)
    const TimeBar = ()=>{
        const [counter, setCounter] = useState(0)
        useEffect(()=>{
            let interval = setInterval(()=>{setCounter(counter + 1)}, 1000)
            return ()=>clearInterval(interval)
        })
        return (
            <div className={classes.time_bar}>
                <span className={classes.duration}>{formatMillisecondsToHHMMSS(dayjs().diff(startTime, 'millisecond'))}</span>
            </div>)
    }




    const [leftItemPage, setLeftItemPage] = useState(1)
    const leftItemPageCapacity = 10
    const [rightItemPage, setRightItemPage] = useState(1)
    const rightItemPageCapacity = 10

    if(loading) return <PlainLoading/>
    return (
        <div>
            <Row>
                <Col offset={1} span={22}>
                    <Row className={classes.options}>
                        <Col span={2}>
                            <Tooltip title={"加载知识谱系"}>
                                <DownloadOutlined
                                    className={utils.icon_button_grey}
                                    onClick={()=>loadKnodes()}/>
                            </Tooltip>
                        </Col>
                        <Col span={15}></Col>
                        <Col span={5}>
                            {startTime && <TimeBar/>}
                        </Col>
                        <Col span={2}>
                            <Tooltip title={"计时"}>
                                <HourglassOutlined
                                    className={utils.icon_button_grey}
                                    onClick={()=>{startTime ? setStartTime(undefined) : setStartTime(dayjs())}}/>
                            </Tooltip>
                        </Col>
                    </Row>
                    <Divider className={utils.bottom_margin_horizontal_divider}/>
                </Col>
            </Row>
            {data.knodes.length === 0 ?
                <div className={utils.no_data}>
                    No Data
                </div>:
                <Row>
                    <Col offset={1} span={11} className={classes.left}>
                        {leftKnodes
                            .slice((leftItemPage - 1) * leftItemPageCapacity,
                                    leftItemPage * leftItemPageCapacity)
                            .map(knodeData=>(<LeftItem data={knodeData} key={knodeData.knodeId}/>))}
                        <Pagination
                            size="small"
                            current={leftItemPage}
                            onChange={(page)=>setLeftItemPage(page)}
                            pageSize={leftItemPageCapacity}
                            total={leftKnodes.length}
                            hideOnSinglePage={true}
                            showSizeChanger={false}/>
                    </Col>
                    <Col span={11} className={classes.right}>
                        <Divider type={"vertical"} className={utils.ghost_vertical_divider}/>
                        {rightKnodes
                            .slice((rightItemPage - 1) * rightItemPageCapacity,
                                    rightItemPage * rightItemPageCapacity)
                            .map(knodeData=>(<RightItem data={knodeData} key={knodeData.knodeId}/>))}
                        <Pagination
                            size="small"
                            current={rightItemPage}
                            onChange={(page)=>setRightItemPage(page)}
                            pageSize={rightItemPageCapacity}
                            total={rightKnodes.length}
                            hideOnSinglePage={true}
                            showSizeChanger={false}/>
                    </Col>
                </Row>

            }
        </div>
    );
};

export default UnfoldingPlayer;