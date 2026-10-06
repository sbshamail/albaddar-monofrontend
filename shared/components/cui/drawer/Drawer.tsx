"use client";
import useClickOutside from "../../../hooks/useClickOutside";
import { X } from "lucide-react";
import React, { FC, ReactNode } from "react";

interface Props {
  position?: "left" | "right";
  open: boolean;
  close: (b: boolean) => void;
  size?: string;
  title?: string;
  className?: React.ComponentProps<"div">["className"];
  children?: ReactNode;
}

const Drawer: FC<Props> = ({
  position = "right",
  open,
  close,
  size,
  className,
  title,
  children,
}) => {
  const toggle = () => {
    close(false);
  };

  const drawerRef = useClickOutside(toggle);

  const positionClass = position === "left" ? "left-0 " : "right-0";
  const widthClass: { [key: string]: string } = {
    "1": "md:w-1/4",
    "2": "md:w-2/4",
    "3": "md:w-3/4",
    "4": "md:w-4/4",
  };

  const getWidthClass = () => {
    return size ? widthClass[size] : "md:w-1/2 lg:w-1/3 xl:w-1/4";
  };
  return (
    <div>
      <div className="relative z-drawer ">
        {open ? (
          <div className={`fixed inset-0 top-0 `}>
            <div className="absolute inset-0 bg-background opacity-80"></div>
            <div className="absolute inset-0 backdrop-blur-sm"></div>
            <div
              className={`fixed  h-screen w-11/12 sm:w-10/12 ${getWidthClass()} ${positionClass}`}
            >
              <div className="absolute inset-0 top-0 ">
                <div
                  ref={drawerRef}
                  className={`h-full inset-0  bg-accent/90 text-card-foreground shadow shadow-border ${className}`}
                >
                  <div className="absolute top-0 right-0 p-2 " onClick={toggle}>
                    <X className="hover:text-red-600 text-muted-foreground Transition" />
                  </div>
                  {title ? (
                    <h1 className="text-center text-2xl p-2">{title}</h1>
                  ) : null}
                  {children}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Drawer;
