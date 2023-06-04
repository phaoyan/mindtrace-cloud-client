import {atom} from "recoil";
import {ExamStrategy, ExamStrategyTypes} from "../../../../../service/data/mastery/ExamStrategy";
import classes from "../ExamSessionPanel.module.css";
import utils from "../../../../../utils.module.css";
import HotspotConfigs from "./HotspotConfigs/HotspotConfigs";
import React from "react";

export const ExamStrategyAtom = atom<ExamStrategy>({
    key: "ExamStrategyAtom",
    default: {type:"full check", config:{}}
})

export const useMenuItems = ()=>[
    {
        label: "全覆盖测试",
        key: ExamStrategyTypes.FULL_CHECK,
        configs: (
            <div className={classes.config_container}>
                <span className={utils.no_data}>无需配置</span>
            </div>
        )
    },
    {
        label: "采样测试",
        key: ExamStrategyTypes.SAMPLING,
        configs: (
            <div className={classes.config_container}>
                <span className={utils.no_data}>无需配置</span>
            </div>
        )
    },
    {
        label: "热点测试",
        key: ExamStrategyTypes.HOTSPOT,
        configs: <HotspotConfigs/>
    }
]