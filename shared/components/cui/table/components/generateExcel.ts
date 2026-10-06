import { ColumnType } from "../../../../types/table_types";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { utility } from "../../../../utility/helpers";

export type ExportCsvRow = Record<
  string,
  string | number | boolean | null | undefined
>;

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

export const handleExportCsv = (data: ExportCsvRow[]) => {
  const csv = generateCsv(csvConfig)(data);
  download(csvConfig)(csv);
};

export const handleArrangeCsvData = async (
  rows: Record<string, unknown>[],
  columns: ColumnType[],
) => {
  const formattedData = rows.map<ExportCsvRow>((row, index) => {
    return columns.reduce<ExportCsvRow>((acc, column) => {
      const accessor = column.accessor;
      if (!accessor || !column.title) return acc; // Skip if no accessor or title

      // Extract raw value
      const rawValue = accessor.split(".").reduce<unknown>((r, key) => {
        if (r && typeof r === "object") {
          return (r as Record<string, unknown>)[key];
        }
        return null;
      }, row);

      let formattedValue: string | number | boolean | null | undefined =
        rawValue != null && typeof rawValue === "object"
          ? JSON.stringify(rawValue)
          : (rawValue as string | number | boolean | null | undefined);

      // Apply column render function if available
      if (column.render && typeof column.render === "function") {
        const renderResult = column.render({
          row,
          index,
          data: rows,
          cell: rawValue as string | number | Record<string, unknown> | null,
        });

        if (
          typeof renderResult === "string" ||
          typeof renderResult === "number" ||
          typeof renderResult === "boolean"
        ) {
          formattedValue = renderResult;
        } else if ((renderResult as unknown) instanceof Date) {
          formattedValue = utility.formatDate(renderResult as unknown as Date);
        }
      }

      // Format value based on column type (with safe type checking)
      switch (column.type) {
        case "date":
          formattedValue =
            typeof rawValue === "string" || rawValue instanceof Date
              ? utility.formatDate(rawValue)
              : (rawValue as string | number | boolean | null | undefined);
          break;

        case "currency":
          formattedValue =
            typeof rawValue === "number"
              ? utility.currencyFormatter(
                  rawValue,
                  column.currency,
                  column.format,
                )
              : (rawValue as string | number | boolean | null | undefined);
          break;
      }

      acc[column.title] = formattedValue;
      return acc;
    }, {});
  });

  if (formattedData.length > 0) {
    handleExportCsv(formattedData);
  }
};
