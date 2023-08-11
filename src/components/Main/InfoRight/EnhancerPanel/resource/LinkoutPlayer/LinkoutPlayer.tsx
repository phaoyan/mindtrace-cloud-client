import React, {useEffect, useState} from 'react';
import {Col, Divider, Input, Row} from "antd";
import utils from "../../../../../../utils.module.css"
import classes from "./LinkoutPlayer.module.css"
import { LinkOutlined} from "@ant-design/icons";
import {Resource} from "../../EnhancerCard/EnhancerCardHooks";
import PlainLoading from "../../../../../utils/general/PlainLoading";
import {addDataToResource, getAllDataFromResource} from "../../../../../../service/api/ResourceApi";
import {base64DecodeUtf8} from "../../../../../../service/utils/JsUtils";


const LinkoutPlayer = (props:{meta: Resource, readonly?: boolean}) => {

    const [data, setData ] = useState<any>({url: "https://www.bing.com", remark:""})
    const [loading, setLoading] = useState(true)
    useEffect(()=>{
        const effect = async ()=>{
            let resp = await getAllDataFromResource(props.meta.id!)
            try {
                setData(JSON.parse(base64DecodeUtf8(resp["data.json"])))
            }catch (err){
                await addDataToResource(props.meta.id!, "data.json", JSON.stringify(data))
                resp = await getAllDataFromResource(props.meta.id!)
                setData(JSON.parse((base64DecodeUtf8(resp["data.json"]))))
            }
            setLoading(false)
        }; effect().then()
        //eslint-disable-next-line
    }, [])

    if(loading) return <PlainLoading/>
    return (
        <div className={classes.container}>
            <Row>
                <Col span={22} offset={2}>{
                    props.readonly ?
                    <span className={classes.readonly_remark}>
                        {data.remark}
                    </span>:
                    <Input
                        value={data.remark}
                        disabled={props.readonly}
                        onChange={({target: {value}})=>{!props.readonly && setData({...data, remark: value})}}
                        onBlur={async ()=>await addDataToResource(props.meta.id!, "data.json", data)}
                        bordered={false}
                        placeholder={". . . "}/>
                }</Col>
            </Row>
            <Row>
                <Col span={1} offset={1}>
                </Col>
                <Col span={20}>
                    <Row>
                        <Col span={22}>{
                            props.readonly ?
                                <span className={classes.readonly_url}>
                                    {data.url}
                                </span>:
                                <Input
                                    bordered={false}
                                    disabled={props.readonly}
                                    placeholder={"输入资源的网址 . . ."}
                                    value={data.url}
                                    onChange={ async ({target: {value}})=>{
                                        const newValue = {...data, url: value}
                                        setData(newValue)
                                        await addDataToResource(props.meta.id!, "data.json", newValue)
                                    }}/>
                        }</Col>
                        <Col span={2}>
                            <LinkOutlined
                                className={`${utils.icon_button} ${utils.grey}`}
                                onClick={()=>window.open(data.url, "_blank")}/>
                        </Col>
                    </Row>
                    <Divider className={utils.ghost_horizontal_divider}/>
                </Col>
            </Row>
        </div>
    )
};

export default LinkoutPlayer;