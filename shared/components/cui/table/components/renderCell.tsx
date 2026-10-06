import { ColumnType } from "../../../../types/table_types";
import { utility } from "../../../../utility/helpers";
import React from "react";

export const renderCell = (
  item: Record<string, unknown> | null,
  column: ColumnType,
  index: number,
  data: Record<string, unknown>[],
) => {
  // Access nested properties using a function
  const accessors = column?.accessor?.split(".");
  let value: string | number | Record<string, unknown> | null = item;

  accessors?.forEach((accessor: string) => {
    if (
      value &&
      typeof value === "object" &&
      // value.hasOwnProperty(accessor)
      Object.prototype.hasOwnProperty.call(value, accessor)
    ) {
      value = (value as Record<string, unknown>)[accessor] as
        | string
        | number
        | Record<string, unknown>
        | null;
    } else {
      value = null;
    }
  });
  // Check if the final value is still an object, which should be handled specially
  if (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !React.isValidElement(value)
  ) {
    // If it's an object and not handled by column.render, format it as a JSON string or handle otherwise
    value = `${JSON.stringify(value)}`;
    // Optionally, customize this to render specific properties or provide a more user-friendly display
  }

  // Check if the column has a render function
  if (column?.render && typeof column.render === "function") {
    const renderResult = column?.render({
      row: item,
      index,
      data,
      cell: value,
    });

    // Ensure renderResult is a valid React node
    if (React.isValidElement(renderResult)) {
      return renderResult;
    }

    // Handle common render function return types
    if (typeof renderResult === "string" || typeof renderResult === "number") {
      return renderResult;
    }

    return <span className="text-orange-400">Invalid Render Result</span>;
  }
  if (Array.isArray(value)) {
    // Skip rendering this cell if the value is an array
    return null;
  }

  if (value === null || value === undefined) {
    return <span className="text-orange-400">N/A</span>;
  }

  switch (column.type) {
    case "date":
      return utility.formatDate(value as string | Date);
    case "currency":
      return utility.currencyFormatter(
        value as unknown as number,
        column.currency,
        column.format,
      );
    // case "chip":
    //   return chip(value);
    default:
      return value;
  }
};
