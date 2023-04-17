import React, {useEffect} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {Enhancer, Label} from "../../../../service/data/Enhancer";
import {addEnhancerToKnode, getEnhancersForKnode} from "../../../../service/api/EnhancerApi";
import {UserID} from "../../../../recoil/User";
import {Divider, Dropdown} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {EnhancerCard} from "./EnhancerCard";
import classes from "./EnhancerPanel.module.css";
import utils from "../../../../utils.module.css"
import {EnhancerLabelRepositoryAtom, EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import {addResourceToEnhancer} from "../../../../service/api/ResourceApi";
import {
    addResourceDropdownItems,
    ResourceWithData
} from "../../../../service/data/Resource";

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

    useEffect(() => {

    },[])

    const addEnhancerWithResource = (resourceWithData: ResourceWithData)=>{
        addEnhancerToKnode(userId, selectedKnodeId)
            .then((data)=>{
                setEnhancers([...enhancers, data])
                addResourceToEnhancer(userId, data.id,resourceWithData).then(()=>{})
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

            <Dropdown
                menu={{
                    items: addResourceDropdownItems(addEnhancerWithResource, userId)
                }}
                placement={"topLeft"}>
                <PlusOutlined className={utils.icon_button}/>
            </Dropdown>


        </div>
    );
};

export default EnhancerPanel;