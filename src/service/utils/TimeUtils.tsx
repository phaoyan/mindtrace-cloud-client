import {Dayjs} from "dayjs";

export const formatMillisecondsToHHMMSS = (milliseconds: number, noPadding?: boolean)=> {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if(!noPadding)
        return `${paddedHours} : ${paddedMinutes} : ${paddedSeconds}`;
    else return `${hours} : ${minutes} : ${seconds}`
}

export const formatMillisecondsToHHMM = (milliseconds: number, noPadding?: boolean)=>{
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    if(!noPadding)
        return `${paddedHours} : ${paddedMinutes}`
    else return `${hours} : ${minutes}`
}

export const sameDay = (day1: Dayjs, day2: Dayjs)=>{
    return day1.format("YYYY-MM-DD") === day2.format("YYYY-MM-DD")
}
export const sameMonth = (day1: Dayjs, day2: Dayjs)=>{
    return day1.format("YYYY-MM") === day2.format("YYYY-MM")
}