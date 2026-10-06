import { Button } from "../../../ui/button";
import DropdownList from "../../DropdownList";

export interface PaginationType {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  dataLimit: number;
  setDataLimit: (limit: number) => void;
  total?: number;
}
const Pagination = ({
  currentPage = 1,
  setCurrentPage,
  dataLimit,
  setDataLimit,
  total = dataLimit,
}: PaginationType) => {
  // total pageCount for Pagination
  const pageCount = Math.ceil(total / dataLimit);
  // Change page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // Handle rows per page
  const handledataLimitChange = (size: number) => {
    setDataLimit(size);
    setCurrentPage(1); // Reset to first page with new rows per page
  };
  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages = [];
    let leftSide = currentPage - 2;
    let rightSide = currentPage + 2;

    if (leftSide <= 1) {
      rightSide = 5;
      leftSide = 1;
    }
    if (rightSide > pageCount) {
      leftSide = pageCount - 4;
      rightSide = pageCount;
      if (leftSide < 1) {
        leftSide = 1;
      }
    }

    for (let number = leftSide; number <= rightSide; number++) {
      if (number > 0 && number <= pageCount) {
        pages.push(number);
      }
    }
    return pages;
  };
  if (pageCount <= 0) return null;

  return (
    <div className="sticky right-0 bottom-0 z-10 flex w-full flex-wrap items-center justify-between gap-2 border-t border-border bg-background p-2">
      <div className="flex shrink-0 items-center gap-2">
        <span className="select-none text-sm font-bold">Total: {total}</span>
        <DropdownList
          Trigger={() => (
            <div className="select-none rounded-md border border-border px-2 py-1 text-sm transition hover:bg-accent">
              Limit {dataLimit}
            </div>
          )}
          contents={[10, 20, 50, 100, 500, 1000, total]
            .filter((size) => size <= total)
            .map((size) => ({
              title: `${size} `,
              click: () => handledataLimitChange(size),
            }))}
          contentsWrapClass="w-32"
        />
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-1 select-none">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          {"<<"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="  "
        >
          {"<"}
        </Button>
        {getPageNumbers().map((number) => (
          <Button
            key={number}
            variant={number === currentPage ? "default" : "secondary"}
            size="sm"
            onClick={() => handlePageChange(number)}
            className={
              number === currentPage ? "font-bold pointer-events-none" : ""
            }
          >
            {number}
          </Button>
        ))}
        {currentPage < pageCount - 2 && (
          <span className="mx-1 text-muted-foreground">…</span>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          {">"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(pageCount)}
          disabled={currentPage === pageCount}
        >
          {">>"}
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
