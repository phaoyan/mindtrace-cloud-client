export interface ExamStrategy{
    type: string,
    config: any
}

export const ExamStrategyTypes = {
    FULL_CHECK: "full check",
    SAMPLING: "sampling",
    HOTSPOT: "hotspot",
    HEURISTIC: "heuristic",
    RECENT_KNODE : "recent knode"
}