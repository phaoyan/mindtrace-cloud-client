import React, {useEffect} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {Enhancer} from "../../../../service/data/Enhancer";
import {addEnhancerToKnode, getEnhancersForKnode} from "../../../../service/api/EnhancerApi";
import {Divider} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import classes from "./EnhancerPanel.module.css";
import utils from "../../../../utils.module.css"
import {EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import EnhancerCardWrapper from "./EnhancerCardWrapper";
const EnhancerPanel = () => {

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)

    const [enhancers, setEnhancers] = useRecoilState<Enhancer[]>(EnhancersForSelectedKnodeAtom)

    // selectedKnodeId -> enhancers
    useEffect(() => {
        selectedKnodeId &&
        getEnhancersForKnode(selectedKnodeId)
            .then((data) => {
                setEnhancers(data)
            })
        // eslint-disable-next-line
    }, [selectedKnodeId])

    const addEnhancerRaw = ()=>{
        addEnhancerToKnode(selectedKnodeId)
            .then((data)=>{
                setEnhancers([...enhancers, data])
            })
    }

    return (
        <div className={classes.container}>
            <div className={classes.main}>
                {enhancers.map(enhancer=>(
                    <div key={enhancer.id}>
                        <EnhancerCardWrapper id={enhancer.id}/>
                        <Divider/>
                    </div>
                ))}
            </div>

            <div className={classes.add_card_wrapper}>
                <PlusOutlined
                    className={utils.icon_button}
                    onClick={()=>addEnhancerRaw()}/>
                <span className={classes.placeholder}>在这里添加笔记 . . . </span>
            </div>


        </div>
    );
};

export default EnhancerPanel;