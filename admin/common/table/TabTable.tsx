"use client";
import Table from "@deep-ecommerce/shared/components/cui/table";
import { TableTabsType } from "@deep-ecommerce/shared/types/table_types";
import { FC } from "react";

interface Props {
  tabs?: TableTabsType[];
}

const TabTable: FC<Props> = ({ tabs = [{ data: [], columns: [] }] }) => (
  <Table
    tabs={tabs}
    striped
    showColumnFilter
    tableWrapperClass="max-h-[calc(100svh-330px)] overflow-auto"
  >
    <Table.Header className="min-w-0 border-b border-border p-2 font-semibold ">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <Table.Dates />
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1">
          <Table.Search />
          <Table.ColumnFilter />
          <Table.Density />
          <Table.FullScreen iconSize={16} />
        </div>
      </div>
      <Table.Action className="mt-2 flex-wrap" />
      <Table.FilterBadges />
    </Table.Header>
    <Table.Tabs className="py-0.5" />
    <Table.Pagination />
  </Table>
);

export default TabTable;
