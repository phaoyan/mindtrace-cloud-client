import {ExamResult} from "./ExamResult";

export const AnalyzerTypes = {
    GPT_ANALYSIS: "gpt analysis",
    HOTSPOT_ANALYSIS: "hotspot analysis",
    STATISTICS_ANALYSIS: "statistics analysis"
}
export interface ExamAnalysis{
    result: ExamResult,
    analysis: string
}