"use client";
import React, { useCallback, useState } from "react";

import { twMerge } from "tailwind-merge";

import { Checkbox } from "../../../ui/checkbox";
import useDivDimensions from "../../../../hooks/useDivDimensions";
import { cn } from "../../../../lib/utils";
import { ClassNameType } from "../../../../types/common_types";
import {
  ColumnType,
  ExpandingTableType,
  TableMainClassesType,
} from "../../../../types/table_types";
import {
  ExtendableArrow,
  ExtentableContent,
  isExpandable,
} from "../components/Expendable";
import { renderCell } from "../components/renderCell";
import { ToggleRowSelection } from "../components/ToggleRowSelection";

export interface TableMainBodyTypes extends TableMainClassesType {
  data: Record<string, unknown>[];
  columns: ColumnType[];
  selectedRows?: Record<string, unknown>[] | null;
  setSelectedRows?: (rows: Record<string, unknown>[]) => void;
  rowId?: "id" | "_id" | string;

  expandable?: boolean;
  multiExpandable?: boolean;
  ExpandingContent?: ExpandingTableType;
  //styles
  striped?: boolean;
  stripedClass?: ClassNameType;
  tableWrapperClass?: ClassNameType;
  wrapperClass?: ClassNameType;
  // Shown as a single full-width row in place of the body when data is empty
  emptyState?: React.ReactNode;
}
const TableMainBody = ({
  data,
  columns,
  rowId = "id",
  selectedRows,
  setSelectedRows = () => {},
  expandable,
  multiExpandable,
  ExpandingContent,
  //style
  striped,
  stripedClass = "bg-accent",
  tableWrapperClass,
  wrapperClass,
  emptyState,
  // tables classes
  tableClass,
  trHeadClass,
  tHeadClass,
  thHeadClass,
  tableInsideClass = "border border-card-foreground/10 shadow-sm shadow-accent text-[0.9em] text-left p-3",
  tBodyClass,
  trBodyClass,
  tdBodyClass,
}: TableMainBodyTypes) => {
  const selectAll = Boolean(
    data?.length && selectedRows?.length === data.length,
  );
  // expendable states

  const [openExpandableRow, setOpenExpandableRow] = useState<number | number[]>(
    [-1],
  );
  // ref width , this divRef is use for nested table width
  const { dimension, divRef } = useDivDimensions(["resize"]);

  const toggle = useCallback(() => {
    setSelectedRows(selectAll ? [] : data);
  }, [selectAll, setSelectedRows, data]);

  const TableHead = () => (
    <thead className={twMerge(`border-none `, `${tHeadClass} `)}>
      <tr
        className={twMerge(`z-10  sticky top-0 bg-accent`, ` ${trHeadClass} `)}
      >
        {(expandable || multiExpandable) && (
          <th
            className={twMerge(
              `   select-none`,
              ` ${tableInsideClass}`,
              ` ${thHeadClass} w-10`,
            )}
          ></th>
        )}
        {selectedRows && (
          <th
            className={twMerge(
              `   ${tableInsideClass} select-none`,
              ` ${thHeadClass} w-10`,
            )}
          >
            <Checkbox onCheckedChange={toggle} checked={selectAll} />
          </th>
        )}
        {columns &&
          columns.length &&
          columns?.map((item, index) => {
            return (
              <th
                key={index}
                className={cn(
                  `   px-5 ${tableInsideClass} whitespace-nowrap`,
                  `  ${thHeadClass}`,
                  item?.headerClassName,
                )}
              >
                {item?.renderTitle ? (
                  item.renderTitle({ column: item, index })
                ) : (
                  <span className="font-bold ">{item?.title}</span>
                )}
              </th>
            );
          })}
      </tr>
    </thead>
  );
  const colSpan =
    (columns?.length ?? 0) +
    (expandable || multiExpandable ? 1 : 0) +
    (selectedRows ? 1 : 0);

  const TableBody = () => (
    <tbody className={twMerge(`text-sm font-medium`, ` ${tBodyClass} `)}>
      {!data?.length ? (
        <tr>
          <td colSpan={colSpan || 1} className={`${tableInsideClass}`}>
            {emptyState ?? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                No records found
              </div>
            )}
          </td>
        </tr>
      ) : (
        data?.map((item, index: number) => {
        const expanded = isExpandable(
          openExpandableRow,
          index,
          multiExpandable,
          ExpandingContent,
        );
        return (
          <React.Fragment key={index}>
            <tr
              key={index}
              className={twMerge(
                `border-none hover:bg-accent ${striped && index % 2 !== 0 && stripedClass}`,
                expanded &&
                  `bg-accent/70 hover:bg-accent/70 [&>td]:border-r-0 [&>td]:border-y-2  [&>td]:border-foreground/50  ${!expanded && `opacity-50`}`,

                `${trBodyClass}`,
              )}
            >
              {/* for expenadle td arrow show*/}

              {(expandable || multiExpandable) &&
                ExtendableArrow({
                  setOpenExpandableRow,
                  index,
                  openExpandableRow,
                  multiExpandable,
                  expandingContent: ExpandingContent,
                })}

              {/* for selection single td */}
              {selectedRows && setSelectedRows && (
                <td
                  className={twMerge(
                    `${tableInsideClass} `,
                    `  ${tdBodyClass}  `,
                  )}
                >
                  {ToggleRowSelection(
                    item,
                    rowId,
                    selectedRows,
                    setSelectedRows,
                  )}
                </td>
              )}

              {columns &&
                columns.length &&
                columns?.map((column, idx) => (
                  <td
                    key={idx}
                    className={cn(
                      `relative p-0 m-0 px-5 overflow-hidden ${tableInsideClass}  whitespace-nowrap`,
                      ` ${tdBodyClass} ${column?.className} `,
                    )}
                  >
                    {renderCell(item, column, index, data)}
                  </td>
                ))}
            </tr>
            {expanded && (
              <ExtentableContent
                index={index}
                item={item}
                columns={columns}
                data={data}
                ExpandingContent={ExpandingContent}
                expandableWidth={dimension?.offsetWidth}
              />
            )}
          </React.Fragment>
        );
        })
      )}
    </tbody>
  );
  return (
    <div className={twMerge("min-w-0", wrapperClass)}>
      <main
        className={twMerge(
          "theme-table-scroll relative min-w-0 overflow-auto",
          tableWrapperClass,
        )}
      >
        <div ref={divRef} className="min-w-max select-none">
          <table
            className={twMerge(
              `m-0 w-max min-w-full table-auto border-separate border-spacing-0 p-0 select-text`,
              ` ${tableClass} `,
            )}
          >
            {TableHead()}

            {TableBody()}
          </table>
        </div>
      </main>
    </div>
  );
};

export default TableMainBody;
