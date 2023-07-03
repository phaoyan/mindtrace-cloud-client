import dayjs from "dayjs";
import {DEFAULT_DATE_TIME_PATTERN} from "../../utils/constants";

export interface ExamInteract{
    id?: number,
    sessionId?: number,
    role?: string,
    message?: string,
    moment?: string
}

export const examInteractPrototype = (sessionId: number, message: object | undefined): ExamInteract=>{
    return {
        sessionId: sessionId,
        role: "learner",
        message: message ? JSON.stringify(message) : undefined,
        moment: dayjs().format(DEFAULT_DATE_TIME_PATTERN)
    }
}