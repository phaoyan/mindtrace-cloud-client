import React, {useEffect} from 'react';
import {useRecoilState, useRecoilValue} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../recoil/home/Knode";
import {Enhancer} from "../../../../service/data/Enhancer";
import {addEnhancerToKnode, getEnhancersForKnode, scissorEnhancer} from "../../../../service/api/EnhancerApi";
import {Divider} from "antd";
import {PlusOutlined, ScissorOutlined} from "@ant-design/icons";
import classes from "./EnhancerPanel.module.css";
import utils from "../../../../utils.module.css"
import {EnhancerCardIdClipboardAtom, EnhancersForSelectedKnodeAtom} from "../../../../recoil/home/Enhancer";
import EnhancerCardWrapper from "./EnhancerCardWrapper";
import {EnhancerPanelKeyAtom} from "../../../../recoil/utils/DocumentData";
const EnhancerPanel = () => {

    const selectedKnodeId = useRecoilValue(SelectedKnodeIdAtom)
    const [enhancers, setEnhancers] = useRecoilState<Enhancer[]>(EnhancersForSelectedKnodeAtom)
    const [enhancerPanelKey, setEnhancerPanelKey] = useRecoilState(EnhancerPanelKeyAtom)
    const [enhancerIdClipboard, setEnhancerIdClipboard] = useRecoilState(EnhancerCardIdClipboardAtom)

    // selectedKnodeId -> enhancers
    useEffect(() => {
        selectedKnodeId &&
        getEnhancersForKnode(selectedKnodeId)
            .then((data) => {
                setEnhancers(data)
            })
        // eslint-disable-next-line
    }, [selectedKnodeId, enhancerPanelKey])

    const addEnhancerRaw = ()=>{
        addEnhancerToKnode(selectedKnodeId)
            .then((data)=>{
                setEnhancers([...enhancers, data])
            })
    }




    return (
        <div className={classes.container} key={enhancerPanelKey}>
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
                {enhancerIdClipboard &&
                    <ScissorOutlined
                        className={utils.icon_button}
                        onClick={ async ()=>{
                            await scissorEnhancer(enhancerIdClipboard[0],enhancerIdClipboard[1],selectedKnodeId)
                            setEnhancerPanelKey(enhancerPanelKey+1)
                            setEnhancerIdClipboard(undefined)
                        }}/>
                }
                <span className={classes.placeholder}>在这里添加笔记 . . . </span>
            </div>


        </div>
    );
};

export default EnhancerPanel;