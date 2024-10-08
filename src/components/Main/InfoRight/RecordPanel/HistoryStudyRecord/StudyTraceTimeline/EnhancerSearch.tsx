import React, {useEffect, useState} from 'react';
import {Breadcrumb, Col, Divider, Input, Row, Tooltip} from "antd";
import {
    EnhancerSearchTxtAtom,
    useAddEnhancerRel, useAddEnhancerRelByGroup,
} from "./StudyTraceRecordHooks";
import {StudyTrace} from "../../../../../../service/data/Tracing";
import {useRecoilState, useRecoilValue} from "recoil";
import {PlusOutlined, SearchOutlined} from "@ant-design/icons";
import classes from "./EnhancerSearch.module.css";
import utils from "../../../../../../utils.module.css"
import {Enhancer} from "../../../../../../service/data/Enhancer";
import {LoginUserIdSelector} from "../../../../../Login/LoginHooks";
import {getEnhancersByLike, getKnodesByEnhancerId} from "../../../../../../service/api/EnhancerApi";
import {getChainStyleTitle} from "../../../../../../service/api/KnodeApi";
import {breadcrumbTitle} from "../../../../../../service/data/Knode";
import MdPreview from "../../../../../utils/markdown/MdPreview";

const EnhancerSearch = (props:{traces:StudyTrace[]}) => {
    const loginUserId = useRecoilValue(LoginUserIdSelector)
    const addEnhancerRelOnce = useAddEnhancerRel(props.traces[0])
    const addEnhancerRelByGroup = useAddEnhancerRelByGroup()
    const [searchTxt, setSearchTxt] = useRecoilState(EnhancerSearchTxtAtom)
    const [resultEnhancers, setResultEnhancers] = useState<Enhancer[]>([])
    const [enhancerRelatedKnodeDataList, setEnhancerRelatedKnodeDataList] = useState<{enhancerId: number, knodeChainTitle: string[]}[]>([])
    useEffect(()=>{
        const effect = async ()=>{
            for(let enhancer of resultEnhancers){
                const knodes = await getKnodesByEnhancerId(enhancer.id);
                if(knodes.length === 0) return
                const titles = await getChainStyleTitle(knodes[0].id);
                setEnhancerRelatedKnodeDataList((list)=>[...new Set([...list, {enhancerId: enhancer.id, knodeChainTitle: titles}])])
            }
        }; effect().then()
    }, [resultEnhancers])
    return (
        <div className={classes.container}>
            <Row>
                <Col span={2} style={{display:"flex", justifyContent:"center", alignItems: "center"}}>
                    <SearchOutlined/>
                </Col>
                <Col span={22}>
                    <Input
                        bordered={false}
                        placeholder={"搜索笔记名称 . . . "}
                        value={searchTxt}
                        onChange={({target: {value}})=>setSearchTxt(value)}
                        onBlur={async ()=>{
                            setResultEnhancers(await getEnhancersByLike(loginUserId, searchTxt || ""))
                        }}/>
                    <Divider className={utils.ghost_horizontal_divider}/>
                </Col>
            </Row>
            <div>{
                resultEnhancers.map((enhancer)=>{
                    const data = enhancerRelatedKnodeDataList.find(data=>data.enhancerId === enhancer.id)
                    if(!data) return <div key={enhancer.id}></div>
                    return (
                        <Row key={enhancer.id}>
                            <Col span={2}>
                                <Tooltip title={"添加笔记"}>
                                    <PlusOutlined
                                        className={utils.icon_button_normal}
                                        onClick={()=> props.traces.length === 1 ?
                                            addEnhancerRelOnce(props.traces[0].id, enhancer.id) :
                                            addEnhancerRelByGroup(enhancer.id, props.traces)}
                                    />
                                </Tooltip>
                            </Col>
                            <Col span={22}>
                                <Breadcrumb items={[
                                    ...breadcrumbTitle(data!.knodeChainTitle, true), {
                                        title:
                                            <MdPreview>
                                                {enhancer.title}
                                            </MdPreview>
                                    }]}/>
                            </Col>
                        </Row>
                    )
                })
            }</div>
        </div>
    );
};

export default EnhancerSearch;