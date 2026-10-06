import { cn } from "../../../../lib/utils";
import { ClassNameType } from "../../../../types/common_types";
import { Maximize2, Minimize2 } from "lucide-react";

export interface FullScreenTableType {
  fullScreen?: boolean;
  setFullScreen?: (b: boolean) => void;
  iconSize?: number;
  className?: ClassNameType;
}
const FullScreenTable = ({
  fullScreen = false,
  setFullScreen,
  iconSize = 16,
  className,
}: FullScreenTableType) => {
  const Icon = fullScreen ? Minimize2 : Maximize2;
  return (
    setFullScreen && (
      <div>
        <Icon
          onClick={() => setFullScreen(!fullScreen)}
          className={cn("hover:scale-105 cursor-pointer", className)}
          size={iconSize}
        />
      </div>
    )
  );
};

export default FullScreenTable;
