import React, {useEffect, useState} from 'react';
import {Divider} from "antd";
import classes from "../FullCheckExamMain/FullCheckExamMain.module.css";
import {formatMillisecondsToHHMMSS} from "../../../../../../service/utils/TimeUtils";
import dayjs from "dayjs";
import {FieldTimeOutlined} from "@ant-design/icons";
import utils from "../../../../../../utils.module.css";
import {atomFamily, useRecoilState} from "recoil";

export const DividerTimerKeyFamily = atomFamily({
    key: "DividerTimerKeyFamily",
    default: 0
})
const DividerTimer = (props:{startTime: string, id: number}) => {
    const [dividerKey, setDividerKey] = useRecoilState<number>(DividerTimerKeyFamily(props.id))
    const [displayTimer, setDisplayTimer] = useState<boolean>(true)
    useEffect(()=>{
        setTimeout(()=>{
            setDividerKey(dividerKey + 1)
        }, 1000)
        //eslint-disable-next-line
    }, [dividerKey])
    return (
        <Divider key={dividerKey}>
            {
                displayTimer ?
                <span
                    className={classes.timer}
                    style={{cursor:"pointer"}}
                    onClick={()=>{setDisplayTimer(false)}}>
                    {formatMillisecondsToHHMMSS(dayjs().diff(props.startTime))}
                </span> :
                <FieldTimeOutlined
                    className={utils.icon_button}
                    style={{color:"#666", padding:"0 1em"}}
                    onClick={()=>setDisplayTimer(true)}/>
            }
        </Divider>
    );
};

export default DividerTimer;