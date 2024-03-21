import {useEffect,} from "react";
import {getCalendarDay, getCalendarMonth} from "../../../../../../service/api/TracingApi";
import {atom, useRecoilState} from "recoil";
import {SelectedKnodeIdAtom} from "../../../../../../recoil/home/Knode";

export const CalendarDayAtom = atom({
    key: "CalendarDayAtom",
    default: {}
})

export const CalendarMonthAtom = atom({
    key: "CalendarMonthAtom",
    default: {}
})

export const useInitCalendarData = ()=>{
    const [selectedKnodeId,] = useRecoilState(SelectedKnodeIdAtom)
    const [, setCalendarDay] = useRecoilState(CalendarDayAtom)
    const [, setCalendarMonth] = useRecoilState(CalendarMonthAtom)
    useEffect(()=>{
        const effect = async ()=>{
            setCalendarDay(await getCalendarDay(selectedKnodeId))
            setCalendarMonth(await getCalendarMonth(selectedKnodeId))
        }; effect().then()
    }, [selectedKnodeId, setCalendarDay, setCalendarMonth])
}