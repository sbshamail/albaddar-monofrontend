"use client";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

export interface DragHandleProps {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
  isDragging: boolean;
}

interface SortableItemProps {
  id: string | number;
  children: (dragHandleProps: DragHandleProps) => React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {children({ attributes, listeners, isDragging })}
    </div>
  );
};

interface SortableListProps<T extends { id: string | number }> {
  items: T[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  renderItem: (
    item: T,
    index: number,
    dragHandleProps: DragHandleProps,
  ) => React.ReactNode;
  className?: string;
  /** dnd-kit's sorting strategy — defaults to vertical-list (stacked rows).
   * Pass `rectSortingStrategy` for a wrapping grid/box layout instead. */
  strategy?: SortingStrategy;
}

/**
 * Generic drag-to-reorder list (dnd-kit). Drag affordance is opt-in per item
 * via `dragHandleProps` — spread it onto a small handle element (e.g. a
 * GripVertical icon), not the whole row, so inputs/buttons inside each item
 * stay normally clickable.
 */
const SortableList = <T extends { id: string | number }>({
  items,
  onReorder,
  renderItem,
  className,
  strategy = verticalListSortingStrategy,
}: SortableListProps<T>) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = items.findIndex((item) => item.id === active.id);
    const toIndex = items.findIndex((item) => item.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;

    onReorder(fromIndex, toIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={strategy}>
        <div className={className}>
          {items.map((item, index) => (
            <SortableItem key={item.id} id={item.id}>
              {(dragHandleProps) => renderItem(item, index, dragHandleProps)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableList;
