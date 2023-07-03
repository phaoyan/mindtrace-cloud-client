import React from 'react';
import {useRecoilValue} from "recoil";
import {CurrentKnodeSubscribesAtom} from "../SharePanelHooks";
import KnodeShareCard from "../KnodeShareCard/KnodeShareCard";

const KnodeSubscribePanel = () => {
    const knodeSubscribes = useRecoilValue(CurrentKnodeSubscribesAtom)
    return (
        <div>{
            knodeSubscribes.map(knodeId=><KnodeShareCard key={knodeId} knodeId={knodeId}/>)
        }</div>
    );
};

export default KnodeSubscribePanel;