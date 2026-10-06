import { JSX } from "react";

// component
import { ColumnType } from "../../../../types/table_types";
import { hasObjectValues } from "../../../../utility/helpers";
import FullScreenTable, {
  FullScreenTableType,
} from "../components/FullScreenTable";
import ColumnHideShow from "../filters/ColumnHideShow";
import FromToDateFilter, {
  FromToDateFilterTypes,
} from "../filters/FromToDateFilter";
import GlobalFilter, { GlobalFilterType } from "../filters/GlobalFilter";
import HeaderFilterList, {
  HeaderColumnFilter,
} from "../filters/HeaderFilterList";
import ShowColumnFilter, {
  ColumnFilterFieldsType,
} from "../filters/ShowColumnFilter";

export interface HeaderType {
  headerAction?: () => JSX.Element;
  dates?: FromToDateFilterTypes;
  globalFilters?: GlobalFilterType;
  showOnlyColumns?: ColumnType[];
  showColumnFilterFields?: ColumnFilterFieldsType;
  columnsFilter?: HeaderColumnFilter;
  setShowOnlyColumns?: React.Dispatch<React.SetStateAction<ColumnType[]>>;
  showFullScreen?: FullScreenTableType;
}

interface Props extends HeaderType {
  columns: ColumnType[];
}
const TableHeader = ({
  dates,
  headerAction,
  globalFilters,
  columns,
  showOnlyColumns,
  showColumnFilterFields,
  columnsFilter,
  setShowOnlyColumns,
  showFullScreen,
}: Props) => {
  const { fromDate, setFromDate, toDate, setToDate } = dates || {};

  const { setGlobalFilter, globalFilter } = globalFilters || {};
  const { columnFilterField, setColumnFilterFields } =
    showColumnFilterFields || {};
  const { columnFilter, setColumnFilter } = columnsFilter || {};
  return (
    <div>
      <div className=" flex flex-col gap-2 font-semibold">
        <div className="flex items-center justify-between">
          {dates && hasObjectValues(dates) && setFromDate && setToDate && (
            <FromToDateFilter
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
            />
          )}
          <div className="flex items-center space-x-2">
            {setGlobalFilter && (
              <GlobalFilter
                setGlobalFilter={setGlobalFilter}
                globalFilter={globalFilter}
              />
            )}
            {setColumnFilterFields && (
              <ShowColumnFilter
                columns={showOnlyColumns ?? columns}
                columnFilterField={columnFilterField}
                setColumnFilterFields={setColumnFilterFields}
              />
            )}
            {setShowOnlyColumns && (
              <ColumnHideShow
                allColumns={columns}
                showOnlyColumns={showOnlyColumns}
                setShowOnlyColumns={setShowOnlyColumns}
              />
            )}
            {showFullScreen && (
              <FullScreenTable
                fullScreen={showFullScreen?.fullScreen}
                setFullScreen={showFullScreen?.setFullScreen}
              />
            )}
          </div>
        </div>
        {headerAction && <div className="">{headerAction()}</div>}
        <HeaderFilterList
          columnFilterField={columnFilterField}
          columnFilter={columnFilter}
          setColumnFilter={setColumnFilter}
        />
      </div>
    </div>
  );
};

export default TableHeader;
