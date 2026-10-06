"use client";
import clsx from "clsx";
import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

import FullScreenDom from "../../../hooks/FullScreenDom";
import { ClassNameType } from "../../../types/common_types";
import {
  ActionMenuListType,
  ColumnFilterType,
  ColumnType,
  ExpandingTableType,
  NewActionMenuType,
  TableMainClassesType,
  TableTabsType,
} from "../../../types/table_types";
import { AlignJustify, Check } from "lucide-react";

import DropdownList from "../DropdownList";
import FullScreenTable from "./components/FullScreenTable";
import TableContext, {
  TableContextValue,
  TableDensity,
  useTableContext,
} from "./context";
import ColumnHideShow from "./filters/ColumnHideShow";
import ColumnManager from "./filters/ColumnManager";
import FromToDateFilter from "./filters/FromToDateFilter";
import GlobalFilter from "./filters/GlobalFilter";
import HeaderFilterList from "./filters/HeaderFilterList";
import ShowColumnFilter from "./filters/ShowColumnFilter";
import TableHeaderAction from "./headerAction";
import Pagination from "./main/Pagination";
import TableMainBody from "./main/TableMainBody";

// ─── Root props ───────────────────────────────────────────────────────────────

interface TableRootProps<
  T = Record<string, unknown>,
> extends TableMainClassesType {
  children: React.ReactNode;
  className?: ClassNameType;

  // Direct data mode
  data?: T[];
  columns?: ColumnType<T>[];
  total?: number;

  // Controlled state — omit any of these and Table manages it internally
  // (today's default behavior). Provide a value + its setter together to
  // lift that piece of state up, e.g. to coordinate a parent table's
  // selection with a nested/expanded child table's selection.
  selectedRows?: T[] | null;
  setSelectedRows?: (rows: T[]) => void;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
  dataLimit?: number;
  setDataLimit?: (limit: number) => void;

  // Tab mode — supply tabs instead of data/columns
  tabs?: TableTabsType<T>[];

  // Action menus for direct-data mode (tab mode reads them from the active tab)
  actionMenuList?: ActionMenuListType<T>;
  newActionMenu?: NewActionMenuType<T>;

  // Feature flags
  showColumnFilter?: boolean;
  rowId?: string;
  striped?: boolean;
  stripedClass?: string;
  expandable?: boolean;
  multiExpandable?: boolean;
  ExpandingContent?: ExpandingTableType<T>;
  tableWrapperClass?: ClassNameType;
  // Shown in the body in place of rows when there's no data
  emptyState?: React.ReactNode;
}

// ─── Root ─────────────────────────────────────────────────────────────────────
// T is erased to Record<string, unknown> once it reaches TableContext — the
// row type only matters for the public props (columns/actionMenuList/etc),
// which is why callers never need to cast when using <Table<Row> ...>.

const TableRoot = <T = Record<string, unknown>,>({
  children,
  className,
  data: dataProp = [],
  columns: columnsProp = [],
  total: totalProp,
  selectedRows: selectedRowsProp,
  setSelectedRows: setSelectedRowsProp,
  currentPage: currentPageProp,
  setCurrentPage: setCurrentPageProp,
  dataLimit: dataLimitProp,
  setDataLimit: setDataLimitProp,
  tabs,
  actionMenuList: actionMenuListProp,
  newActionMenu: newActionMenuProp,
  showColumnFilter,
  rowId,
  striped,
  stripedClass,
  expandable,
  multiExpandable,
  ExpandingContent,
  tableWrapperClass,
  emptyState,
  tableClass,
  trHeadClass,
  tHeadClass,
  thHeadClass,
  tableInsideClass,
  tBodyClass,
  trBodyClass,
  tdBodyClass,
}: TableRootProps<T>) => {
  const [activeTabState, setActiveTabState] = useState(0);
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalDataLimit, setInternalDataLimit] = useState(20);
  // Controlled-if-provided: a consumer that passes both value + setter owns
  // this state; otherwise Table falls back to managing it itself.
  const selectedRows = selectedRowsProp;
  const setSelectedRows = setSelectedRowsProp;
  const currentPage = currentPageProp ?? internalCurrentPage;
  const setCurrentPage = setCurrentPageProp ?? setInternalCurrentPage;
  const dataLimit = dataLimitProp ?? internalDataLimit;
  const setDataLimit = setDataLimitProp ?? setInternalDataLimit;
  const [fullScreen, setFullScreen] = useState(false);
  const [density, setDensity] = useState<TableDensity>("default");
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilter, setColumnFilter] = useState<ColumnFilterType[]>([]);
  const [columnFilterField, setColumnFilterFields] = useState<ColumnType<T>[]>(
    [],
  );
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  // Resolve active tab values
  const activeTabData = tabs?.[activeTabState];
  const allColumns = activeTabData?.columns ?? columnsProp;
  const rawData = activeTabData?.data ?? dataProp;
  const total = activeTabData?.total ?? totalProp ?? rawData.length;
  const actionMenuList = activeTabData?.actionMenuList ?? actionMenuListProp;
  const newActionMenu = activeTabData?.newActionMenu ?? newActionMenuProp;
  const curExpandable = activeTabData?.expandable ?? expandable;
  const curMultiExp = activeTabData?.multiExpandable ?? multiExpandable;
  const curExpContent = activeTabData?.ExpandingContent ?? ExpandingContent;
  const curRowId = activeTabData?.rowId ?? rowId;

  const [showOnlyColumns, setShowOnlyColumns] =
    useState<ColumnType<T>[]>(allColumns);

  const setActiveTab = (n: number) => {
    setActiveTabState(n);
    if (setSelectedRows) {
      setSelectedRows([]);
    }
    setCurrentPage(1);
    setShowOnlyColumns(tabs?.[n]?.columns ?? columnsProp);
    setColumnFilterFields([]);
  };

  const paginatedData = useMemo(() => {
    const skip = (currentPage - 1) * dataLimit;
    return rawData.slice(skip, skip + dataLimit);
  }, [rawData, currentPage, dataLimit]);

  // Erase T to the context's plain Record<string, unknown> shape — safe
  // because every row T is used here structurally is-a Record at runtime.
  const ctx: TableContextValue = {
    data: paginatedData as unknown as Record<string, unknown>[],
    rawData: rawData as unknown as Record<string, unknown>[],
    allColumns: allColumns as unknown as ColumnType[],
    showOnlyColumns: showOnlyColumns as unknown as ColumnType[],
    setShowOnlyColumns: setShowOnlyColumns as unknown as Dispatch<
      SetStateAction<ColumnType[]>
    >,
    total,
    tabs: tabs as unknown as TableTabsType[] | undefined,
    activeTab: activeTabState,
    setActiveTab,
    actionMenuList: actionMenuList as unknown as ActionMenuListType | undefined,
    newActionMenu: newActionMenu as unknown as NewActionMenuType | undefined,
    selectedRows: selectedRows as unknown as Record<string, unknown>[],
    setSelectedRows: setSelectedRows as unknown as (
      rows: Record<string, unknown>[],
    ) => void,
    removeSelection: () => {
      if (setSelectedRows) {
        setSelectedRows([]);
      }
    },
    currentPage,
    setCurrentPage,
    dataLimit,
    setDataLimit,
    globalFilter,
    setGlobalFilter,
    columnFilter,
    setColumnFilter,
    columnFilterField: columnFilterField as unknown as ColumnType[],
    setColumnFilterFields: setColumnFilterFields as unknown as Dispatch<
      SetStateAction<ColumnType[]>
    >,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    fullScreen,
    setFullScreen,
    density,
    setDensity,
    showColumnFilter,
    rowId: curRowId,
    striped,
    stripedClass,
    expandable: curExpandable,
    multiExpandable: curMultiExp,
    ExpandingContent: curExpContent as unknown as
      | ExpandingTableType
      | undefined,
    tableWrapperClass,
    emptyState,
    tableClass,
    trHeadClass,
    tHeadClass,
    thHeadClass,
    tableInsideClass,
    tBodyClass,
    trBodyClass,
    tdBodyClass,
  };

  return (
    <TableContext.Provider value={ctx}>
      <FullScreenDom open={fullScreen}>
        <div
          className={twMerge(
            clsx(
              "min-w-0 overflow-hidden rounded-none border border-border bg-background shadow-sm shadow-border",
              fullScreen &&
                "flex flex-col h-full rounded-none border-none shadow-none",
              className,
            ),
          )}
        >
          {children}
        </div>
      </FullScreenDom>
    </TableContext.Provider>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Header wrapper div. Use className to set your layout (flex, grid, etc.). */
const TableHeaderSlot = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: ClassNameType;
}) => {
  const { fullScreen } = useTableContext();
  return (
    <div className={twMerge(clsx(fullScreen && "flex-none"), className)}>
      {children}
    </div>
  );
};

/** Date-range filter. */
const TableDatesSlot = () => {
  const { fromDate, setFromDate, toDate, setToDate } = useTableContext();
  return (
    <FromToDateFilter
      fromDate={fromDate}
      setFromDate={setFromDate}
      toDate={toDate}
      setToDate={setToDate}
    />
  );
};

/** Global keyword search. */
const TableSearchSlot = () => {
  const { globalFilter, setGlobalFilter } = useTableContext();
  return (
    <GlobalFilter
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
    />
  );
};

/**
 * Column filter picker (multi-select — stays open while picking).
 * Renders nothing unless showColumnFilter is set on <Table>.
 */
const TableShowFilterSlot = () => {
  const {
    allColumns,
    showOnlyColumns,
    columnFilterField,
    setColumnFilterFields,
    showColumnFilter,
  } = useTableContext();
  if (!showColumnFilter) return null;
  return (
    <ShowColumnFilter
      columns={showOnlyColumns ?? allColumns}
      columnFilterField={columnFilterField}
      setColumnFilterFields={setColumnFilterFields}
    />
  );
};

/**
 * Column visibility toggle (drag to reorder, click to hide/show).
 * Renders nothing unless showColumnFilter is set on <Table>.
 */
const TableHideColumnsSlot = () => {
  const { allColumns, showOnlyColumns, setShowOnlyColumns, showColumnFilter } =
    useTableContext();
  if (!showColumnFilter) return null;
  return (
    <ColumnHideShow
      allColumns={allColumns}
      showOnlyColumns={showOnlyColumns}
      setShowOnlyColumns={setShowOnlyColumns}
    />
  );
};

/**
 * Merged column manager — single dropdown combining visibility toggle
 * (Eye icon, left) + drag-to-reorder (middle) + filter toggle (ListFilter, right).
 * Renders nothing unless showColumnFilter is set on Table.
 */
const TableColumnFilterSlot = ({ iconSize }: { iconSize?: number }) => {
  const {
    allColumns,
    showOnlyColumns,
    setShowOnlyColumns,
    columnFilterField,
    setColumnFilterFields,
    showColumnFilter,
  } = useTableContext();
  if (!showColumnFilter) return null;
  return (
    <ColumnManager
      iconSize={iconSize}
      allColumns={allColumns}
      showOnlyColumns={showOnlyColumns}
      setShowOnlyColumns={setShowOnlyColumns}
      columnFilterField={columnFilterField}
      setColumnFilterFields={setColumnFilterFields}
    />
  );
};

/** Active column-filter badge strip — place below your header toolbar. */
const TableFilterBadgesSlot = () => {
  const { columnFilterField, columnFilter, setColumnFilter } =
    useTableContext();
  return (
    <HeaderFilterList
      columnFilterField={columnFilterField}
      columnFilter={columnFilter}
      setColumnFilter={setColumnFilter}
    />
  );
};

/** Fullscreen toggle button. */
const TableFullScreenSlot = ({
  className,
  iconSize,
}: { className?: ClassNameType; iconSize?: number } = {}) => {
  const { fullScreen, setFullScreen } = useTableContext();
  return (
    <FullScreenTable
      className={className}
      fullScreen={fullScreen}
      setFullScreen={setFullScreen}
      iconSize={iconSize}
    />
  );
};

/**
 * Action menus (export, row actions, custom dropdowns).
 * In tab mode the active tab's actionMenuList/newActionMenu are used automatically.
 * Pass props to override for a specific instance.
 */
const TableActionSlot = ({
  actionMenuList,
  newActionMenu,
  className,
}: {
  actionMenuList?: ActionMenuListType;
  newActionMenu?: NewActionMenuType;
  className?: ClassNameType;
} = {}) => {
  const c = useTableContext();
  return (
    <TableHeaderAction
      data={c.rawData}
      columns={c.allColumns}
      selectedRows={c.selectedRows}
      setSelectedRows={c.setSelectedRows}
      removeSelection={c.removeSelection}
      actionMenuList={actionMenuList ?? c.actionMenuList}
      newActionMenu={newActionMenu ?? c.newActionMenu}
      className={className}
    />
  );
};

const densityInsideClass: Record<TableDensity, string> = {
  compact:
    "border border-card-foreground/10 shadow-sm shadow-accent text-[0.8em] text-left px-2 py-1",
  default:
    "border border-card-foreground/10 shadow-sm shadow-accent text-[0.9em] text-left p-3",
  comfortable:
    "border border-card-foreground/10 shadow-sm shadow-accent text-[0.95em] text-left px-4 py-4",
};

// Shared table renderer used by both Body and Tabs slots
const BodyRenderer = () => {
  const c = useTableContext();
  return (
    <TableMainBody
      data={c.data}
      columns={c.showColumnFilter ? c.showOnlyColumns : c.allColumns}
      selectedRows={c.selectedRows}
      setSelectedRows={c.setSelectedRows}
      rowId={c.rowId}
      striped={c.striped}
      stripedClass={c.stripedClass}
      expandable={c.expandable}
      multiExpandable={c.multiExpandable}
      ExpandingContent={c.ExpandingContent}
      tableWrapperClass={
        c.fullScreen ? "h-full overflow-auto" : c.tableWrapperClass
      }
      wrapperClass={c.fullScreen ? "h-full" : undefined}
      emptyState={c.emptyState}
      tableClass={c.tableClass}
      trHeadClass={c.trHeadClass}
      tHeadClass={c.tHeadClass}
      thHeadClass={c.thHeadClass}
      tableInsideClass={c.tableInsideClass ?? densityInsideClass[c.density]}
      tBodyClass={c.tBodyClass}
      trBodyClass={c.trBodyClass}
      tdBodyClass={c.tdBodyClass}
    />
  );
};

/** Plain table body — use when there are no tabs. */
const TableBodySlot = ({ className }: { className?: ClassNameType } = {}) => {
  const { fullScreen } = useTableContext();
  return (
    <div
      className={twMerge(
        clsx("min-w-0", fullScreen && "flex-1 min-h-0 overflow-hidden"),
        className,
      )}
    >
      <BodyRenderer />
    </div>
  );
};

/** Tab bar + table body — requires tabs prop on <Table>. */
const TableTabsSlot = ({ className }: { className?: ClassNameType } = {}) => {
  const { tabs, activeTab, setActiveTab, fullScreen } = useTableContext();
  const hasTabs = tabs && tabs.length > 1 && tabs.some((t) => t.titleTable);

  return (
    <div
      className={twMerge(
        clsx(
          "min-w-0",
          fullScreen && "flex flex-1 min-h-0 flex-col overflow-hidden",
        ),
      )}
    >
      {hasTabs && (
        <div className="flex flex-none items-center overflow-x-auto border-b border-border text-center">
          {tabs!.map((tab, index) =>
            tab.titleTable ? (
              <div
                key={index}
                className={twMerge(
                  "relative min-w-32 flex-1 cursor-pointer select-none text-center text-[0.7em] font-semibold transition-colors",
                  className,
                  index === activeTab
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                onClick={() => setActiveTab(index)}
              >
                {tab.titleTable as React.ReactNode}
              </div>
            ) : null,
          )}
        </div>
      )}
      <div className={fullScreen ? "min-h-0 min-w-0 flex-1" : "min-w-0"}>
        <BodyRenderer />
      </div>
    </div>
  );
};

/**
 * Density toggle — compact / default / comfortable.
 * Places a small dropdown in your header toolbar.
 */
const TableDensitySlot = ({ iconSize = 16 }: { iconSize?: number } = {}) => {
  const { density, setDensity } = useTableContext();
  return (
    <DropdownList
      Trigger={() => <AlignJustify size={iconSize} />}
      contentsWrapClass="w-40"
      contents={[
        {
          title: "Compact",
          click: () => setDensity("compact"),
          Icon: density === "compact" ? Check : undefined,
        },
        {
          title: "Default",
          click: () => setDensity("default"),
          Icon: density === "default" ? Check : undefined,
        },
        {
          title: "Comfortable",
          click: () => setDensity("comfortable"),
          Icon: density === "comfortable" ? Check : undefined,
        },
      ]}
    />
  );
};

/** Pagination bar. Wrap in any flex div for custom left/right positioning. */
const TablePaginationSlot = ({
  className,
}: { className?: ClassNameType } = {}) => {
  const {
    currentPage,
    setCurrentPage,
    dataLimit,
    setDataLimit,
    total,
    fullScreen,
  } = useTableContext();
  return (
    <div className={twMerge(clsx(fullScreen && "flex-none"), className)}>
      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        dataLimit={dataLimit}
        setDataLimit={setDataLimit}
        total={total}
      />
    </div>
  );
};

// ─── Compound component export ────────────────────────────────────────────────

// Object.assign loses TableRoot's generic call signature, so it's restated
// here explicitly — this is what makes `<Table<Row> data={rows} .../>` type
// the columns/actionMenuList/newActionMenu props without callers casting.
interface TableComponent {
  <T = Record<string, unknown>>(
    props: TableRootProps<T> & { ref?: React.Ref<HTMLDivElement> },
  ): React.ReactElement;
  Header: typeof TableHeaderSlot;
  Dates: typeof TableDatesSlot;
  Search: typeof TableSearchSlot;
  ShowFilter: typeof TableShowFilterSlot;
  HideColumns: typeof TableHideColumnsSlot;
  ColumnFilter: typeof TableColumnFilterSlot;
  FilterBadges: typeof TableFilterBadgesSlot;
  FullScreen: typeof TableFullScreenSlot;
  Density: typeof TableDensitySlot;
  Action: typeof TableActionSlot;
  Body: typeof TableBodySlot;
  Tabs: typeof TableTabsSlot;
  Pagination: typeof TablePaginationSlot;
}

const Table = Object.assign(TableRoot, {
  Header: TableHeaderSlot,
  Dates: TableDatesSlot,
  Search: TableSearchSlot,
  /** Column filter picker (multi-select, stays open on click) */
  ShowFilter: TableShowFilterSlot,
  /** Column visibility toggle + drag-to-reorder */
  HideColumns: TableHideColumnsSlot,
  /** Shorthand: ShowFilter + HideColumns together */
  ColumnFilter: TableColumnFilterSlot,
  FilterBadges: TableFilterBadgesSlot,
  FullScreen: TableFullScreenSlot,
  /** Row density toggle: compact / default / comfortable */
  Density: TableDensitySlot,
  Action: TableActionSlot,
  Body: TableBodySlot,
  Tabs: TableTabsSlot,
  Pagination: TablePaginationSlot,
}) as unknown as TableComponent;

export { useTableContext };
export default Table;
