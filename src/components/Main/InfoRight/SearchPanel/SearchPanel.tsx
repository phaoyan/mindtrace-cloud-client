import React, {useState} from 'react';
import {Checkbox, Col, Divider, Input, Pagination, Row, Spin, Tooltip} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import utils from "../../../../utils.module.css"
import {
    SearchOptionsAtom,
    SearchPanelSearchingAtom,
    SimilarResourcesRelatedEnhancerIdsAtom,
    useSearchResourcesBySimilar, useSetResourceTypeLimit
} from "./SearchPanelHooks";
import {useRecoilState} from "recoil";
import {EnhancerCard} from "../EnhancerPanel/EnhancerCard/EnhancerCard";
import {ResourceType} from "../EnhancerPanel/EnhancerCard/EnhancerCardHooks";
import classes from "./SearchPanel.module.css";

const SearchPanel = () => {
    const [searching, ] = useRecoilState(SearchPanelSearchingAtom)
    const [options, setOptions] = useRecoilState(SearchOptionsAtom)
    const [searchTxt, setSearchTxt] = useState("")
    const searchResource = useSearchResourcesBySimilar()
    const setResourceTypeLimit = useSetResourceTypeLimit();
    const [enhancerIds, ] = useRecoilState(SimilarResourcesRelatedEnhancerIdsAtom)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 8
    return (
        <div className={classes.container}>
            <Row>
                <Col span={1}>{
                    searching ?
                    <Tooltip title={"较慢，若长时间不响应可能是openai寄了"}>
                        <Spin/>
                    </Tooltip>:
                    <SearchOutlined
                        className={utils.icon_button}
                        style={{color: "#79bbff", position:"relative", left:"1em", top:"0.8em"}}
                        onClick={()=>searchTxt && searchTxt !== "" && searchResource(searchTxt, 0.8)}/>
                }</Col>
                <Col span={23}>
                    <Input
                        size={"large"}
                        bordered={false}
                        placeholder={"输入关键词 . . . "}
                        onChange={({target: {value}})=>setSearchTxt(value)}/>
                    <Divider className={utils.ghost_horizontal_divider}/>
                </Col>
            </Row>
            <Row>
                <Col span={22} offset={1} className={classes.options}>
                    <Checkbox
                        checked={options.showMineOnly}
                        onChange={(e)=>setOptions({...options, showMineOnly: e.target.checked})}>
                        只看自己
                    </Checkbox>
                    <Checkbox
                        checked={options.resourceTypeLimits.includes(ResourceType.MARKDOWN)}
                        onChange={({target: {checked}})=>setResourceTypeLimit(ResourceType.MARKDOWN, checked)}>
                        知识概述
                    </Checkbox>
                    <Checkbox
                        checked={options.resourceTypeLimits.includes(ResourceType.QUIZCARD)}
                        onChange={({target: {checked}})=>setResourceTypeLimit(ResourceType.QUIZCARD, checked)}>
                        知识卡片
                    </Checkbox>
                    <Checkbox
                        checked={options.resourceTypeLimits.includes(ResourceType.LINKOUT)}
                        onChange={({target: {checked}})=>setResourceTypeLimit(ResourceType.LINKOUT, checked)}>
                        资源链接
                    </Checkbox>
                    <Checkbox
                        checked={options.resourceTypeLimits.includes(ResourceType.MINDTRACE_HUB_RESOURCE)}
                        onChange={({target: {checked}})=>setResourceTypeLimit(ResourceType.MINDTRACE_HUB_RESOURCE, checked)}>
                        云端资源
                    </Checkbox>
                </Col>
            </Row>
            <br/>
            <div>{
                enhancerIds
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((enhancerId)=><EnhancerCard id={enhancerId} key={enhancerId}/>)
            }</div>
            <Pagination
                pageSize={pageSize}
                onChange={(page)=>setCurrentPage(page)}
                current={currentPage}
                hideOnSinglePage={true}
                total={enhancerIds.length}/>
        </div>
    );
};

export default SearchPanel;