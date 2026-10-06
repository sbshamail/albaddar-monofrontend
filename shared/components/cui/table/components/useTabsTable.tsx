import { TableTabsType } from "../../../../types/table_types";

interface UseTabType {
  tabs: TableTabsType[];
  activeTab: number;
}
export const useTableTabs = ({ tabs, activeTab }: UseTabType) => {
  const activeTabData = tabs[activeTab];
  return {
    data: activeTabData.data,
    columns: activeTabData.columns,
    rowId: activeTabData?.rowId,
    total: activeTabData?.total,
    actionMenuList: activeTabData?.actionMenuList,
    newActionMenu: activeTabData?.newActionMenu,
    expandable: activeTabData?.expandable,
    multiExpandable: activeTabData?.multiExpandable,
    ExpandingContent: activeTabData?.ExpandingContent,
  };
};

export default useTableTabs;
