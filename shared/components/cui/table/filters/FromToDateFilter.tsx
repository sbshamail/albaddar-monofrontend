import { CalendarDays } from "lucide-react";
import React, { FC } from "react";
import InputDatePicker from "../../InputDatePicker";

export interface FromToDateFilterTypes {
  fromDate?: Date;
  setFromDate?: React.Dispatch<React.SetStateAction<Date | undefined>>;
  toDate?: Date;
  setToDate?: React.Dispatch<React.SetStateAction<Date | undefined>>;
}
const FromToDateFilter: FC<FromToDateFilterTypes> = ({
  fromDate,
  setFromDate = () => {},
  toDate,
  setToDate = () => {},
}) => {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1 select-none">
      <div className="shrink-0 text-muted-foreground">
        <CalendarDays size={18} />
      </div>
      <InputDatePicker selectedDate={fromDate} setSelectedDate={setFromDate} />
      <span className="text-muted-foreground">-</span>
      <InputDatePicker selectedDate={toDate} setSelectedDate={setToDate} />
    </div>
  );
};

export default FromToDateFilter;
