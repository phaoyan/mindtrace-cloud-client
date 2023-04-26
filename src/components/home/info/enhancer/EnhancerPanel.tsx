import React, {useEffect} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {Enhancer, Label} from "../../../../service/data/Enhancer";
import {addEnhancerToKnode, getEnhancersForKnode} from "../../../../service/api/EnhancerApi";
import {UserID} from "../../../../recoil/User";
import {Divider} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {EnhancerCard} from "./EnhancerCard";
import classes from "./EnhancerPanel.module.css";
import utils from "../../../../utils.module.css"
import {EnhancerLabelRepositoryAtom, EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
const EnhancerPanel = () => {

    const userId = useRecoilValue(UserID)
    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)

    const [enhancers, setEnhancers] = useRecoilState<Enhancer[]>(EnhancersForSelectedKnodeAtom)
    const [labelRepo, setLabelRepo] = useRecoilState<Label[]>(EnhancerLabelRepositoryAtom)

    // selectedKnodeId -> enhancers
    useEffect(() => {
        selectedKnodeId &&
        getEnhancersForKnode(userId, selectedKnodeId)
            .then((data) => {
                setEnhancers(data)
            })
        // eslint-disable-next-line
    }, [selectedKnodeId])

    const addEnhancerRaw = ()=>{
        addEnhancerToKnode(userId, selectedKnodeId)
            .then((data)=>{
                setEnhancers([...enhancers, data])
            })
    }

    return (
        <div className={classes.container}>
            <div className={classes.main}>
                {enhancers.map(enhancer=>(
                    <div key={enhancer.id}>
                        <EnhancerCard id={enhancer.id}/>
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