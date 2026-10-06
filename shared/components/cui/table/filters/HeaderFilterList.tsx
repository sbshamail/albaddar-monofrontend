"use client";
import { Button } from "../../../ui/button";
import { ButtonGroup } from "../../../ui/button-group";
import { Input } from "../../../ui/input";
import { ColumnFilterType, ColumnType } from "../../../../types/table_types";
import { SearchIcon } from "lucide-react";
import React, { ChangeEvent, FC } from "react";

export interface HeaderColumnFilter {
  columnFilter?: ColumnFilterType[];
  setColumnFilter?: React.Dispatch<React.SetStateAction<ColumnFilterType[]>>;
}
interface HeaderFilterListType extends HeaderColumnFilter {
  columnFilterField?: ColumnType[];
}

const HeaderFilterList: FC<HeaderFilterListType> = ({
  columnFilterField,
  columnFilter,
  setColumnFilter,
}) => {
  const handleColumnFilter = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    if (setColumnFilter) {
      setColumnFilter((prevFilters) => {
        const filterExists = prevFilters.some((filter) => filter.id === name);

        if (value === "") {
          // Remove the filter if its value is empty
          return prevFilters.filter((filter) => filter.id !== name);
        }

        if (filterExists) {
          // Update the filter value if it already exists
          return prevFilters.map((filter) =>
            filter.id === name ? { ...filter, value } : filter,
          );
        }

        // Add a new filter if it does not exist
        return [...prevFilters, { id: name, value }];
      });
    }
  };

  // Properly map columns and apply filters
  const showFilterColumns = columnFilterField?.map((item) => {
    const matchingFilter = columnFilter?.find(
      (filterItem) => filterItem.id === item.filterId,
    );
    return {
      ...item,
      value: matchingFilter ? matchingFilter.value : "", // Provide default empty string if no matching filter
    };
  });
  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {showFilterColumns?.map((column, index) => (
        <ButtonGroup key={index} className="w-full min-w-0 sm:w-56">
          <Button variant="outline" aria-label="Search">
            <SearchIcon />
          </Button>
          <Input
            className="min-w-0"
            placeholder={column.title}
            onChange={handleColumnFilter}
            value={column.value}
          />
        </ButtonGroup>
      ))}
    </div>
  );
};

export default HeaderFilterList;
