import {atom} from "recoil";
import {ExamStrategy, ExamStrategyTypes} from "../../../../../service/data/mastery/ExamStrategy";
import HotspotConfigs from "./HotspotConfigs/HotspotConfigs";
import React from "react";
import HeuristicConfigs from "./HeuristicConfigs/HeuristicConfigs";
import RecentKnodeConfigs from "./RecentKnodeConfigs/RecentKnodeConfigs";
import FullCheckConfigs from "./FullCheckConfigs/FullCheckConfigs";
import SamplingConfigs from "./SamplingConfigs/SamplingConfigs";

export const ExamStrategyAtom = atom<ExamStrategy>({
    key: "ExamStrategyAtom",
    default: {type:"full check", config:{}}
})

export const useMenuItems = ()=>[
    {
        label: "全覆盖测试",
        key: ExamStrategyTypes.FULL_CHECK,
        configs: <FullCheckConfigs/>
    },
    {
        label: "采样测试",
        key: ExamStrategyTypes.SAMPLING,
        configs: <SamplingConfigs/>
    },
    {
        label: "热点测试",
        key: ExamStrategyTypes.HOTSPOT,
        configs: <HotspotConfigs/>
    },
    {
        label: "启发式测试",
        key: ExamStrategyTypes.HEURISTIC,
        configs: <HeuristicConfigs/>
    },
    {
        label: "近期学习测试",
        key: ExamStrategyTypes.RECENT_KNODE,
        configs: <RecentKnodeConfigs/>
    }
]