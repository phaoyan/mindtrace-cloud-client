import React, {useEffect, useState} from 'react';
import {Resource} from "../../EnhancerCard/EnhancerCardHooks";
import {addDataToResource, getAllDataFromResource} from "../../../../../../service/api/ResourceApi";
import {base64DecodeUtf8} from "../../../../../../service/utils/JsUtils";
import PlainLoading from "../../../../../utils/general/PlainLoading";
import {Breadcrumb, Col, Divider, Input, Row} from "antd";
import classes from "./KnodeLinkPlayer.module.css";
import utils from "../../../../../../utils.module.css"
import {useSearchKnodes} from "./KnodeLinkPlayerHooks";
import {EditOutlined, LinkOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import {Knode, useBreadcrumbTitleForJump} from "../../../../../../service/data/Knode";
import {getAncestors} from "../../../../../../service/api/KnodeApi";

const KnodeLinkPlayer = (props: {meta: Resource, readonly: boolean}) => {
    const [data, setData ] = useState<{remark: string, knodeIds: number[]}>({remark: "", knodeIds: []})
    const [knodeInfo, setKnodeInfo] = useState<Knode[][]>([])
    const [loading, setLoading] = useState(true)
    const [searchMode, setSearchMode] = useState(false)
    const [searchTxt, setSearchTxt] = useState("")
    const [searchResults, setSearchResults] = useState<Knode[][]>([])
    const searchKnodes = useSearchKnodes()
    const breadcrumbTitleForJump = useBreadcrumbTitleForJump()
    useEffect(()=>{
        const effect = async ()=>{
            let resp = await getAllDataFromResource(props.meta.id!)
            try {
                setData(JSON.parse(base64DecodeUtf8(resp["data.json"])))
            }catch (err){
                await addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))
                resp = await getAllDataFromResource(props.meta.id!)
                setData(JSON.parse((base64DecodeUtf8(resp["data.json"]))))
                setSearchMode(true)
            }
            setLoading(false)
        }; effect().then()
        //eslint-disable-next-line
    }, [])
    useEffect(()=>{
        const effect = async ()=>{
            const temp = []
            for(let knodeId of data.knodeIds)
                temp.push(await getAncestors(knodeId))
            setKnodeInfo(temp)
        }; effect().then()
    }, [data])

    if(loading) return <PlainLoading/>
    return (
        <div onBlur={()=>!props.readonly && addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))}>
            <Row>
                <Col span={2} className={classes.option}>{
                    searchMode ?
                    <SearchOutlined
                        className={utils.icon_button}
                        onClick={()=>setSearchMode(false)}/>:
                    <EditOutlined
                        className={utils.icon_button}
                        onClick={()=>setSearchMode(true)}/>
                }</Col>
                <Col span={22}>{
                    props.readonly ?
                        <span className={classes.readonly_remark}>
                        {data.remark}
                    </span>:(
                    searchMode ?
                        <Input
                            value={searchTxt}
                            disabled={props.readonly}
                            onChange={({target: {value}})=>setSearchTxt(value)}
                            onBlur={async ()=>setSearchResults(await searchKnodes(searchTxt))}
                            bordered={false}
                            placeholder={". . . "}/> :
                        <Input
                            value={data.remark}
                            disabled={props.readonly}
                            onChange={({target: {value}})=>{!props.readonly && setData({...data, remark: value})}}
                            onBlur={async ()=>await addDataToResource(props.meta.id!, "data.json", data)}
                            bordered={false}
                            placeholder={". . . "}/>
                    )
                }</Col>
            </Row>
            <Row>
                <Col span={21} offset={2}>
                    <Divider className={utils.ghost_horizontal_divider}/>
                </Col>
            </Row>{
            searchMode ?
            <Row>
                <Col span={22} offset={2}>{
                    searchResults.map((result)=>(
                        <div key={result[result.length-1].id} className={classes.search_item}>
                            <PlusOutlined
                                className={utils.icon_button_normal}
                                onClick={()=>{
                                    setData({...data, knodeIds: [...data.knodeIds, result[result.length-1].id]})
                                    setSearchMode(false)
                                }}/>
                            <Breadcrumb items={breadcrumbTitleForJump(result)}/>
                        </div>
                    ))
                }</Col>
            </Row> :
            <Row>
                <Col span={22} offset={2}>{
                    knodeInfo.map((result)=>(
                        <div key={result[result.length-1].id} className={classes.search_item}>
                            <LinkOutlined/>
                            <Breadcrumb items={breadcrumbTitleForJump(result)}/>
                        </div>
                    ))
                }</Col>
            </Row>
        }</div>
    );
};

export default KnodeLinkPlayer;