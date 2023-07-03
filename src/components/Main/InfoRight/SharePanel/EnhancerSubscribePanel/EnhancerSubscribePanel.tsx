import React, {useEffect, useState} from 'react';
import {useRecoilState} from "recoil";
import {CurrentEnhancerSubscribesAtom} from "../SharePanelHooks";
import EnhancerShareCard from "../EnhancerShareCard/EnhancerShareCard";
import {EnhancerShare} from "../../../../../service/data/share/EnhancerShare";
import {getEnhancerShare} from "../../../../../service/api/ShareApi";

const EnhancerSubscribePanel = () => {
    const [enhancerSubscribes,] = useRecoilState(CurrentEnhancerSubscribesAtom)
    const [enhancerShares, setEnhancerShares] = useState<EnhancerShare[]>([])
    useEffect(()=>{
        const effect = async ()=>{
            const temp = []
            for(let enhancerId of enhancerSubscribes)
                temp.push(await getEnhancerShare(enhancerId))
            setEnhancerShares(temp)
        }; effect()
    }, [enhancerSubscribes])
    return (
        <div>{
            enhancerShares.map(share=><EnhancerShareCard key={share.enhancerId} enhancerShare={share}/>)
        }</div>
    );
};

export default EnhancerSubscribePanel;