"use client";
import React, { useState } from "react";

interface Props<T> {
  items?: T[];
  setItems?: React.Dispatch<React.SetStateAction<T[]>>;
  itemKey?: string;
  renderItem?: (item: T, index: number) => React.ReactNode;
}
const DragDropArray = <T,>({
  items = [] as T[],
  setItems,
  itemKey = "title",
  renderItem,
}: Props<T>) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null); // Index of the dragged item
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null); // Index of the hovered item

  // Handle the drag start event
  const handleDragStart = (index: number): void => {
    setDraggedIndex(index);
  };

  // Handle drag over event (when dragging an item over another item)
  const handleDragOver = (
    index: number,
    e: React.DragEvent<HTMLElement>,
  ): void => {
    e.preventDefault();
    setHoveredIndex(index);
  };

  // Handle drop event (when an item is dropped)
  const handleDrop = (): void => {
    if (
      draggedIndex !== null &&
      hoveredIndex !== null &&
      draggedIndex !== hoveredIndex
    ) {
      const updatedItems = [...items];
      const draggedItem = updatedItems[draggedIndex];
      updatedItems.splice(draggedIndex, 1); // Remove the dragged item
      updatedItems.splice(hoveredIndex, 0, draggedItem); // Insert it at the new index
      if (setItems) {
        setItems(updatedItems);
      }
    }
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  // Handle drag end event (clean up)
  const handleDragEnd = (): void => {
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(index, e)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        >
          {renderItem
            ? renderItem(item, index)
            : String((item as Record<string, unknown>)[itemKey])}
        </div>
      ))}
    </div>
  );
};

export default DragDropArray;
