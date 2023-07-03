import React, {useEffect, useState} from 'react';
import {useRecoilValue} from "recoil";
import {CurrentChainStyleTitleAtom, SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";
import {getLeaves} from "../../../../../../service/api/KnodeApi";
import {Breadcrumb, Col, Row} from "antd";
import classes from "../FullCheckConfigs/FullCheckConfigs.module.css";
import {breadcrumbTitle} from "../../../../../../service/data/Knode";

const CurrentKnodeInfo = () => {
    const chainStyleTitle = useRecoilValue(CurrentChainStyleTitleAtom)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [leafCount, setLeafCount] = useState<number>()
    useEffect(()=>{
        const effect = async ()=>{
            setLeafCount((await getLeaves(selectedKnodeId)).length)
        }; effect()
    }, [selectedKnodeId])

    return (
        <div>
            <Row>
                <Col span={20} offset={2}>
                    <Breadcrumb className={classes.title} items={breadcrumbTitle(chainStyleTitle, true)}/>
                </Col>
            </Row>
            <br/>
            <Row>
                <Col span={12} offset={2}>
                    <span className={classes.info}>
                        知识容量：{leafCount}
                    </span>
                </Col>
            </Row>
        </div>
    );
};

export default CurrentKnodeInfo;