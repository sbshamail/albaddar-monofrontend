"use client";
import { Eye, EyeOff, GripVertical, ListFilter, Tally4 } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

import { ColumnKey, ColumnType } from "../../../../types/table_types";
import DragDropArray from "../../draggable/DragDropArray";
import DropdownList from "../../DropdownList";

interface Props {
  allColumns: ColumnType[];
  showOnlyColumns?: ColumnType[];
  setShowOnlyColumns?: React.Dispatch<React.SetStateAction<ColumnType[]>>;
  columnFilterField?: ColumnType[];
  setColumnFilterFields?: React.Dispatch<React.SetStateAction<ColumnType[]>>;
  columnKey?: ColumnKey;
  iconSize?: number;
}

/**
 * Merged column manager — single dropdown with:
 *  Left  : Eye/EyeOff to toggle visibility
 *  Middle: column name (draggable for visible columns)
 *  Right : ListFilter to enable/disable column filter (only for filterable columns)
 */
const ColumnManager = ({
  allColumns,
  showOnlyColumns = [],
  setShowOnlyColumns,
  columnFilterField = [],
  setColumnFilterFields,
  columnKey = "title",
  iconSize = 16,
}: Props) => {
  const isVisible = (col: ColumnType) =>
    showOnlyColumns.some((v) => v[columnKey] === col[columnKey]);

  const isFiltered = (col: ColumnType) =>
    col.filterId
      ? columnFilterField.some((v) => v.filterId === col.filterId)
      : false;

  const toggleVisibility = (col: ColumnType) => {
    if (!setShowOnlyColumns) return;
    if (isVisible(col)) {
      setShowOnlyColumns((prev) =>
        prev.filter((v) => v[columnKey] !== col[columnKey]),
      );
    } else {
      const idx = allColumns.findIndex((v) => v[columnKey] === col[columnKey]);
      setShowOnlyColumns((prev) => {
        const updated = [...prev];
        updated.splice(idx, 0, col);
        return updated;
      });
    }
  };

  const toggleFilter = (col: ColumnType) => {
    if (!setColumnFilterFields || !col.filterId) return;
    if (isFiltered(col)) {
      setColumnFilterFields((prev) =>
        prev.filter((v) => v.filterId !== col.filterId),
      );
    } else {
      setColumnFilterFields((prev) => [...prev, col]);
    }
  };

  const hiddenColumns = allColumns.filter((col) => !isVisible(col));

  const ColumnRow = ({
    col,
    visible,
  }: {
    col: ColumnType;
    visible: boolean;
  }) => (
    <div
      className={twMerge(
        "flex items-center gap-1.5 px-2 py-1.5 w-full transition-colors hover:bg-accent/60",
        !visible && "opacity-50 hover:opacity-90",
      )}
    >
      {/* Eye toggle */}
      <button
        type="button"
        className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
        title={visible ? "Hide column" : "Show column"}
        onClick={(e) => {
          e.stopPropagation();
          toggleVisibility(col);
        }}
      >
        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>

      {/* Drag hint (visual only — the outer DragDropArray div is the draggable element) */}
      <GripVertical
        size={13}
        className={twMerge(
          "shrink-0 text-muted-foreground/40",
          visible && "cursor-grab",
        )}
      />

      {/* Column title */}
      <span
        className={twMerge(
          "flex-1 text-sm truncate select-none",
          visible ? "font-medium" : "text-muted-foreground font-normal",
        )}
      >
        {col[columnKey] as string}
      </span>

      {/* Filter toggle — only for columns with filterId */}
      {col.filterId ? (
        <button
          type="button"
          className={twMerge(
            "shrink-0 p-0.5 rounded transition-colors",
            isFiltered(col)
              ? "text-primary"
              : "text-muted-foreground/40 hover:text-muted-foreground",
          )}
          title={isFiltered(col) ? "Remove filter" : "Enable filter"}
          onClick={(e) => {
            e.stopPropagation();
            toggleFilter(col);
          }}
        >
          <ListFilter size={13} />
        </button>
      ) : (
        <span className="w-[18px]" />
      )}
    </div>
  );

  return (
    <DropdownList
      Trigger={() => <Tally4 size={iconSize} />}
      contentsWrapClass="w-52 p-0"
    >
      {/* Visible columns — draggable */}
      {showOnlyColumns.length > 0 && (
        <div className="pt-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Visible
          </p>
          <DragDropArray
            items={showOnlyColumns}
            setItems={setShowOnlyColumns}
            renderItem={(col, index) => (
              <ColumnRow key={index} col={col} visible />
            )}
          />
        </div>
      )}

      {/* Separator */}
      {showOnlyColumns.length > 0 && hiddenColumns.length > 0 && (
        <div className="my-1 border-t border-border" />
      )}

      {/* Hidden columns */}
      {hiddenColumns.length > 0 && (
        <div className="pb-1">
          {showOnlyColumns.length === 0 && (
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Columns
            </p>
          )}
          {hiddenColumns.map((col, i) => (
            <ColumnRow key={i} col={col} visible={false} />
          ))}
        </div>
      )}
    </DropdownList>
  );
};

export default ColumnManager;
