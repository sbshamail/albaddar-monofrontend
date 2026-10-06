import type { ReactNode } from "react";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

export type TableDensity = "compact" | "default" | "comfortable";

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

export interface TableContextValue extends TableMainClassesType {
  // Paginated data for the current table body render
  data: Record<string, unknown>[];
  // Full unsliced dataset (active tab or direct prop) — for export, counts
  rawData: Record<string, unknown>[];
  // All columns before visibility filtering
  allColumns: ColumnType[];
  // Columns after ColumnHideShow; same as allColumns when showColumnFilter is off
  showOnlyColumns: ColumnType[];
  setShowOnlyColumns: Dispatch<SetStateAction<ColumnType[]>>;
  total: number;

  // Tabs
  tabs?: TableTabsType[];
  activeTab: number;
  setActiveTab: (n: number) => void;

  // Action menus — resolved from active tab or direct Table prop
  actionMenuList?: ActionMenuListType;
  newActionMenu?: NewActionMenuType;

  // Row selection
  selectedRows: Record<string, unknown>[];
  setSelectedRows: (rows: Record<string, unknown>[]) => void;
  removeSelection: () => void;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  dataLimit: number;
  setDataLimit: (limit: number) => void;

  // Filters
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  columnFilter: ColumnFilterType[];
  setColumnFilter: Dispatch<SetStateAction<ColumnFilterType[]>>;
  columnFilterField: ColumnType[];
  setColumnFilterFields: Dispatch<SetStateAction<ColumnType[]>>;
  fromDate: Date | undefined;
  setFromDate: Dispatch<SetStateAction<Date | undefined>>;
  toDate: Date | undefined;
  setToDate: Dispatch<SetStateAction<Date | undefined>>;

  // Fullscreen
  fullScreen: boolean;
  setFullScreen: Dispatch<SetStateAction<boolean>>;

  // Density
  density: TableDensity;
  setDensity: Dispatch<SetStateAction<TableDensity>>;

  // Table config flags
  showColumnFilter?: boolean;
  rowId?: string;
  striped?: boolean;
  stripedClass?: string;
  expandable?: boolean;
  multiExpandable?: boolean;
  ExpandingContent?: ExpandingTableType;
  tableWrapperClass?: ClassNameType;
  emptyState?: ReactNode;
}

const TableContext = createContext<TableContextValue | null>(null);

export const useTableContext = (): TableContextValue => {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error("useTableContext must be used inside <Table>");
  return ctx;
};

export default TableContext;
