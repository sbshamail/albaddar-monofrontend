import { Button } from "../../../ui/button";
import { ButtonGroup } from "../../../ui/button-group";
import { Input } from "../../../ui/input";
import { SearchIcon } from "lucide-react";
import { ChangeEvent } from "react";

export interface GlobalFilterType {
  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
}
const GlobalFilter = ({ globalFilter, setGlobalFilter }: GlobalFilterType) => {
  const handleGlobalFilter = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (setGlobalFilter) {
      setGlobalFilter(value);
    }
  };
  return (
    <ButtonGroup className="w-full min-w-0 sm:w-64">
      <Button variant="outline" aria-label="Search">
        <SearchIcon />
      </Button>
      <Input
        className="min-w-0"
        placeholder="Search..."
        onChange={handleGlobalFilter}
        value={globalFilter}
      />
    </ButtonGroup>
  );
};

export default GlobalFilter;
