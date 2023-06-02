import {Exam} from "./Exam";
import {ExamInteract} from "./ExamInteract";

export interface ExamSession{
    id: number,
    interacts: ExamInteract[],
    exam: Exam,
    startTime: string,
    endTime: string

}