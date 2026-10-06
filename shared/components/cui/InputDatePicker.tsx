import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import React from "react";
interface InputDatePickerTypes {
  selectedDate: Date | undefined;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}
const InputDatePicker = ({
  selectedDate,
  setSelectedDate,
}: InputDatePickerTypes) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className="w-32 justify-start overflow-hidden font-normal"
        >
          <span className="truncate">
            {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          captionLayout="dropdown"
          onSelect={(date) => {
            setSelectedDate(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default InputDatePicker;
