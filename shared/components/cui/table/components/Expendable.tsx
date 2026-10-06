import { ColumnType, ExpandingTableType } from "../../../../types/table_types";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ExtendableArrowType {
  openExpandableRow: number | number[];
  index: number;
  setOpenExpandableRow: (index: number | number[]) => void;
  multiExpandable?: boolean;
  expandingContent?: unknown;
}
export const ExtendableArrow = ({
  openExpandableRow,
  setOpenExpandableRow,
  index,
  multiExpandable,
  expandingContent,
}: ExtendableArrowType) => {
  // Expanding/collapsing a row's detail is independent of row selection —
  // it must not touch setSelectAll/setSelectedRows.
  const handleExpandRow = (index: number) => {
    const toggleSingleExpand = () => {
      setOpenExpandableRow(index === openExpandableRow ? -1 : index);
    };
    const toggleMultiExpand = () => {
      if (
        Array.isArray(openExpandableRow) &&
        openExpandableRow.includes(index)
      ) {
        setOpenExpandableRow(openExpandableRow.filter((v) => v !== index));
        return;
      }

      setOpenExpandableRow(
        Array.isArray(openExpandableRow)
          ? [...openExpandableRow, index]
          : [index],
      );
    };

    if (multiExpandable) {
      toggleMultiExpand();
    } else {
      toggleSingleExpand();
    }
  };
  const expanded = isExpandable(
    openExpandableRow,
    index,
    multiExpandable,
    expandingContent,
  );
  return (
    <td className="relative h-0 cursor-pointer">
      <span className="" onClick={() => handleExpandRow(index)}>
        {expanded ? <ChevronDown /> : <ChevronRight />}
      </span>
    </td>
  );
};

interface ExtentableContentType {
  item: Record<string, unknown>;
  data: Record<string, unknown>[];
  index: number;
  columns: ColumnType[];
  ExpandingContent?: ExpandingTableType;
  expandableWidth?: string | number;
}
export const ExtentableContent = ({
  item,
  data,
  index,
  columns,
  expandableWidth,
  ExpandingContent,
}: ExtentableContentType) => {
  return (
    <tr className="" key={index}>
      <td colSpan={columns.length + 2}>
        <div
          style={{
            width: `${expandableWidth}px`,
          }}
        >
          {ExpandingContent && ExpandingContent(item, index, data)}
        </div>
      </td>
    </tr>
  );
};

export const isExpandable = (
  openExpandableRow: number | number[],
  index: number,
  multiExpandable?: boolean,
  expandingContent?: unknown,
) => {
  if (!expandingContent) return false;

  return multiExpandable
    ? Array.isArray(openExpandableRow) && openExpandableRow.includes(index)
    : openExpandableRow === index;
};
