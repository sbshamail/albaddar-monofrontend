import { Checkbox } from "../../../ui/checkbox";
import { getNestedProperty } from "../../../../utility/helpers";

// Function to toggle selection of a single row
export const ToggleRowSelection = (
  row: Record<string, unknown>,
  idProperty: string,
  selectedRows: Record<string, unknown>[] | [],
  setSelectedRows: (rows: Record<string, unknown>[]) => void,
) => {
  const id = getNestedProperty(row, idProperty);
  const toggle = () => {
    if (selectedRows?.some((s) => getNestedProperty(s, idProperty) === id)) {
      setSelectedRows(
        selectedRows?.filter(
          (item) => getNestedProperty(item, idProperty) !== id,
        ),
      );
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  return (
    <Checkbox
      onCheckedChange={toggle}
      checked={selectedRows.some(
        (s) => getNestedProperty(s, idProperty) === id,
      )}
      // checked={selectedRows?.some((s) => s[idProperty] === id)}
    />
  );
};
