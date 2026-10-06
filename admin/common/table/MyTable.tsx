"use client";
import Table from "@deep-ecommerce/shared/components/cui/table";
import { demoColumns, demoData } from "@deep-ecommerce/shared/components/cui/table/demo/demo";

const MyTable = () => (
  <Table
    data={demoData}
    columns={demoColumns}
    striped
    showColumnFilter
    tableWrapperClass="max-h-[calc(100svh-330px)] overflow-auto"
  >
    <Table.Header className="min-w-0 border-b border-border p-2 font-semibold">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <Table.Dates />
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1">
          <Table.Search />
          <Table.ColumnFilter />
          <Table.FullScreen />
        </div>
      </div>
      <Table.FilterBadges />
    </Table.Header>
    <Table.Body />
    <Table.Pagination />
  </Table>
);

export default MyTable;
