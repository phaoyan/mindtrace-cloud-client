import React from 'react';
import classes from "../HistoryStudyRecord.module.css";
import {formatMillisecondsToHHMM} from "../../../../../../service/utils/TimeUtils";
import {Calendar} from "antd";
import {
    DEFAULT_DATE_PATTERN,
    DEFAULT_MONTH_PATTERN
} from "../../../../../../service/utils/constants";
import {useRecoilState} from "recoil";
import {CalendarDayAtom, CalendarMonthAtom, useInitCalendarData} from "./CalendarPanelHooks";

const CalendarPanel = () => {
    const [calendarDay,] = useRecoilState(CalendarDayAtom)
    const [calendarMonth,] = useRecoilState(CalendarMonthAtom)
    useInitCalendarData()

    return (
        <div>
            <Calendar
                cellRender={(date, info)=>{
                    let dateStr = date.format(DEFAULT_DATE_PATTERN)
                    let monthStr = date.format(DEFAULT_MONTH_PATTERN)
                    return info.type === "date" ?
                        (<div className={classes.date_cell_container}>
                                <span className={classes.date_cell}>{
                                    dateStr in calendarDay &&
                                    // @ts-ignore
                                    formatMillisecondsToHHMM(calendarDay[dateStr] * 1000, true)
                                }</span>
                        </div>) : info.type === "month" ?
                            (<div className={classes.date_cell_container}>
                                <span className={classes.date_cell}>{
                                    monthStr in calendarMonth &&
                                    // @ts-ignore
                                    formatMillisecondsToHHMM(calendarMonth[monthStr] * 1000, true)
                                }</span>
                            </div>) : <></>
                }}/>
        </div>
    );
};

export default CalendarPanel;