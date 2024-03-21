import React, {useEffect, useState} from 'react';
import {Tree} from "antd";
import {useRecoilState, useRecoilValue} from "recoil";
import {SelectedKtreeSelector} from "../../../../../../recoil/home/Knode";
import {TimeDistributionAntdAtom, useInitKnodeDistributionData} from "./KnodeDistributionPanelHooks";

const KnodeDistributionPanel = () => {
    const selectedKtree = useRecoilValue(SelectedKtreeSelector)
    const [timeDistribution, ] = useRecoilState(TimeDistributionAntdAtom)
    const [timeDistributionExpandedKeys, setTimeDistributionExpandedKeys] = useState<number[]>([])
    useInitKnodeDistributionData()
    useEffect(()=>{
        if(!selectedKtree) return
        setTimeDistributionExpandedKeys([selectedKtree.knode.id, ...selectedKtree.branches.map(branch=>branch.knode.id)])
    }, [selectedKtree])

    return (
        <div>{
            timeDistribution &&
            <Tree
                showLine={true}
                treeData={[timeDistribution]}
                expandedKeys={timeDistributionExpandedKeys}
                onExpand={(expandedKeys: any) => setTimeDistributionExpandedKeys(expandedKeys)}/>
        }</div>
    );
};

export default KnodeDistributionPanel;