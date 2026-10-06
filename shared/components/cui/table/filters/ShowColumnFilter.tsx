import { ColumnType } from "../../../../types/table_types";
import { Check, ListFilter } from "lucide-react";
import React from "react";
import DropdownList, { ContentItem } from "../../DropdownList";

export interface ColumnFilterFieldsType {
  columnFilterField?: ColumnType[];
  setColumnFilterFields?: React.Dispatch<React.SetStateAction<ColumnType[]>>;
}
interface Props extends ColumnFilterFieldsType {
  columns: ColumnType[];
}

const ShowColumnFilter = ({
  columns,
  columnFilterField,
  setColumnFilterFields,
}: Props) => {
  const handleShowsFilter = (item: ColumnType) => {
    if (setColumnFilterFields) {
      if (columnFilterField?.some((v) => v.filterId === item.filterId)) {
        setColumnFilterFields((prev) =>
          prev.filter((v) => v.filterId !== item.filterId),
        );
      } else {
        setColumnFilterFields((prev) => [...prev, item]);
      }
    }
  };

  const contents: ContentItem[] = columns
    .filter((column) => column.filterId)
    .map((column) => {
      const isSelected = columnFilterField?.some(
        (v) => v.filterId === column.filterId,
      );
      return {
        title: column.title,
        click: () => handleShowsFilter(column),
        Icon: isSelected ? Check : undefined,
        className: isSelected ? "bg-accent text-accent-foreground font-medium" : "",
      };
    });

  return (
    <DropdownList
      Trigger={() => <ListFilter size={16} />}
      contents={contents}
      closeOnSelect={false}
    />
  );
};

export default ShowColumnFilter;
