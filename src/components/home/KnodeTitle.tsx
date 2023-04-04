import React from 'react';
import {Input} from "antd";
import {useRecoilState, useRecoilValue} from "recoil";
import {KnodeSelectorFamily} from "../../recoil/knode/Knode";

const KnodeTitle = (props:{knodeId: number}) => {

    const knode = useRecoilValue(KnodeSelectorFamily(props.knodeId))

    return (
        <Input
            value={knode.title}
            bordered={false}/>
    );
};

export default KnodeTitle;