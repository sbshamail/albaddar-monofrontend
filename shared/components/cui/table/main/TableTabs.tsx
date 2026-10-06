import { TableTabsType } from "../../../../types/table_types";
import { JSX, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface TabPropsType {
  tabs?: TableTabsType[];
  activeTab?: number;
  setActiveTab?: (n: number) => void;
  setSelectedRows?: (rows: Record<string, unknown>[]) => void;
  titleTable?: string | JSX.Element;
}
interface Props extends TabPropsType {
  tableMain: () => ReactNode;
  className?: string;
  contentClassName?: string;
}
const TableTabs = ({
  tabs,
  activeTab = 0,
  setActiveTab,
  tableMain,
  titleTable,
  className,
  contentClassName,
}: Props) => {
  return (
    <div className={twMerge("", className)}>
      {tabs && tabs.length > 0 && setActiveTab ? (
        <>
          <div className="flex text-center items-center flex-none border-b border-border">
            {tabs.map((item, index) => {
              const isActive = index === activeTab;
              return (
                item.titleTable && (
                  <div
                    key={index}
                    className={`relative cursor-pointer text-center w-full font-semibold select-none transition-colors
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    onClick={() => setActiveTab(index)}
                  >
                    <div className="text-[0.7em] py-1.5">{item.titleTable}</div>
                  </div>
                )
              );
            })}
          </div>
          <div className={contentClassName}>{tableMain()}</div>
        </>
      ) : (
        <>
          {titleTable && (
            <div className="relative cursor-pointer text-center w-full border-none font-semibold select-none bg-primary/80 text-primary-foreground flex-none">
              <div className="text-[0.7em] py-1">{titleTable}</div>
            </div>
          )}
          <div className={contentClassName}>{tableMain()}</div>
        </>
      )}
    </div>
  );
};

export default TableTabs;
