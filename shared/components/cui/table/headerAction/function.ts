import { ActionMenuList, ActionStateTypes } from "../../../../types/table_types";
import { Dispatch, JSX, SetStateAction } from "react";

export const filterActionMenuCondition = (
  actionMenuList: ActionMenuList[] | undefined,
  selectedRows: Record<string, unknown>[],
): ActionMenuList[] | undefined => {
  if (actionMenuList) {
    return actionMenuList.filter((item) => {
      if (selectedRows?.length === 1 && item.visible === "selected")
        return item;
      if (
        selectedRows?.length > 1 &&
        item.visible === "selected" &&
        item.multiSelected
      )
        return item;
      if (
        (!selectedRows || selectedRows.length === 0) &&
        item.visible === "unselected"
      )
        return item;
      if (!item.visible) return item;
    });
  }
};

/**
 * Takes the whole ActionMenuList item rather than picking out individual
 * fields — any new field added to ActionMenuList/ActionStateTypes (sizing,
 * classNames, etc.) flows through here automatically, no signature change.
 */
export const handleActionMenu = (
  toggle: () => void,
  setContent: Dispatch<SetStateAction<ActionStateTypes>>,
  item: ActionMenuList,
) => {
  toggle();
  setContent((prev) => ({
    ...prev,
    Component: item.Component as JSX.Element,
    title: item.title,
    multiSelected: item.multiSelected,
    resizable: item.resizable,
    width: item.width,
    height: item.height,
    className: item.className,
    resizableClassName: item.resizableClassName,
  }));
};

/**
 * Opens an ActionMenuList item's Component in the shared Sheet, or the
 * shared Dialog when item.modal is set — the same open/close plumbing
 * actionMenuContents uses below, reusable for any button (e.g. a
 * NewActionMenu.click trigger) that wants to open into one without
 * redefining its own Sheet/Dialog.
 */
export const openComponentAction = (
  item: ActionMenuList,
  toggleDrawer: () => void,
  setDrawerContent: Dispatch<SetStateAction<ActionStateTypes>>,
  toggleModal?: () => void,
  setModalContent?: Dispatch<SetStateAction<ActionStateTypes>>,
) => {
  // if item.modal is set, open into a Dialog
  if (item.modal && toggleModal && setModalContent) {
    handleActionMenu(toggleModal, setModalContent, item);
    // otherwise, open into a Sheet/Drawer
  } else {
    handleActionMenu(toggleDrawer, setDrawerContent, item);
  }
};

export const actionMenuContents = (
  listCondition: ActionMenuList[] | undefined,
  selectedRows: Record<string, unknown>[],
  setSelectedRows: (rows: Record<string, unknown>[]) => void,
  toggleDrawer: () => void,
  setDrawerContent: Dispatch<SetStateAction<ActionStateTypes>>,
  removeSelection: () => void,
  toggleModal?: () => void,
  setModalContent?: Dispatch<SetStateAction<ActionStateTypes>>,
) =>
  listCondition?.map((item, index) => ({
    key: index,
    title: item.title,
    Icon: item?.Icon,
    click: item?.action
      ? () => item.action!({ selectedRows, setSelectedRows, removeSelection })
      : item.deleted
        ? () =>
            item.deleted!({ setSelectedRows, selectedRows, removeSelection })
        : item.Component
          ? () =>
              openComponentAction(
                item,
                toggleDrawer,
                setDrawerContent,
                toggleModal,
                setModalContent,
              )
          : () => {},
  }));
