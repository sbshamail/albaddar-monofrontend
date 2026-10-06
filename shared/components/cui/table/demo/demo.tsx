"use client";

import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import {
  ActionMenuList,
  ColumnType,
  NewActionMenu,
  TableTabsType,
} from "../../../../types/table_types";
import { Import, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

// ─── Action menus ─────────────────────────────────────────────────────────────

export const demoActionMenuList = (): ActionMenuList[] => [
  {
    title: "Edit",
    Icon: Pencil,
    Component: () => <p className="text-center">This is Edit Content</p>,
    visible: "selected",
  },
  {
    title: "Create",
    Icon: Plus,
    Component: <p className="text-center">This is Create Content</p>,
    visible: "unselected",
    // modal: true,
  },
  {
    title: "Delete",
    Icon: Trash2,
    deleted: () => {},
    visible: "selected",
    multiSelected: true,
  },
];

const CreateModal = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-7 gap-1 text-xs"
        onClick={() => setOpen(true)}
      >
        <Plus size={12} />
        Create
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Entry</DialogTitle>
            <DialogDescription>
              Fill in the details below and click Create when you&apos;re done.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2 text-sm text-muted-foreground">
            <p>Form fields go here — connect your inputs.</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const demoNewActionMenu = (): NewActionMenu[] => [
  {
    dropdownMenu: [
      {
        Trigger: () => <Import size={16} />,
        contents: () => [
          { title: "Import All", Icon: Import },
          {
            title: "Import Selected",
            Icon: Import,
            visible: "selected",
            multiSelected: true,
          },
        ],
      },
    ],
    // Describes itself as an ActionMenuList entry instead of building its
    // own trigger + Sheet/Dialog — opens straight into the shared Dialog
    // (modal: true) the table already renders. Omit `modal` to open into
    // the shared Sheet instead, same as the "Edit" row action above.
    click: () => ({
      title: "Create New Entry",
      Icon: Plus,
      modal: true,
      Component: (
        <p className="py-2 text-sm text-muted-foreground">
          Form fields go here — connect your inputs.
        </p>
      ),
    }),
    render: () => <CreateModal />,
  },
];

// ─── Demo data ────────────────────────────────────────────────────────────────

export const demoData = [
  { id: 1, name: "John Doe", age: 30, email: "john.doe@example.com" },
  { id: 2, name: "Jane Smith", age: 25, email: "jane.smith@example.com" },
  {
    id: 3,
    name: "Michael Johnson",
    age: 32,
    email: "michael.johnson@example.com",
  },
  { id: 4, name: "Emily Davis", age: 28, email: "emily.davis@example.com" },
  { id: 5, name: "Sarah Wilson", age: 35, email: "sarah.wilson@example.com" },
  { id: 6, name: "David Brown", age: 40, email: "david.brown@example.com" },
  { id: 7, name: "Chris Miller", age: 29, email: "chris.miller@example.com" },
  { id: 8, name: "Daniel Lee", age: 24, email: "daniel.lee@example.com" },
  { id: 9, name: "Anna White", age: 33, email: "anna.white@example.com" },
  {
    id: 10,
    name: "Sophia Taylor",
    age: 27,
    email: "sophia.taylor@example.com",
  },
  {
    id: 11,
    name: "James Anderson",
    age: 38,
    email: "james.anderson@example.com",
  },
  {
    id: 12,
    name: "Olivia Thomas",
    age: 26,
    email: "olivia.thomas@example.com",
  },
  {
    id: 13,
    name: "Isabella Harris",
    age: 31,
    email: "isabella.harris@example.com",
  },
  { id: 14, name: "Mason Clark", age: 28, email: "mason.clark@example.com" },
  {
    id: 15,
    name: "Liam Rodriguez",
    age: 36,
    email: "liam.rodriguez@example.com",
  },
  { id: 16, name: "Zoe Lewis", age: 27, email: "zoe.lewis@example.com" },
  { id: 17, name: "Ethan Walker", age: 34, email: "ethan.walker@example.com" },
  { id: 18, name: "Madison Hall", age: 25, email: "madison.hall@example.com" },
  { id: 19, name: "Lucas Young", age: 32, email: "lucas.young@example.com" },
  { id: 20, name: "Chloe Allen", age: 30, email: "chloe.allen@example.com" },
  {
    id: 21,
    name: "Jackson Scott",
    age: 23,
    email: "jackson.scott@example.com",
  },
  { id: 22, name: "Amelia King", age: 29, email: "amelia.king@example.com" },
  { id: 23, name: "Aiden Wright", age: 31, email: "aiden.wright@example.com" },
  { id: 24, name: "Ella Green", age: 33, email: "ella.green@example.com" },
  { id: 25, name: "Logan Adams", age: 27, email: "logan.adams@example.com" },
  {
    id: 26,
    name: "Charlotte Baker",
    age: 29,
    email: "charlotte.baker@example.com",
  },
  {
    id: 27,
    name: "Gabriel Nelson",
    age: 35,
    email: "gabriel.nelson@example.com",
  },
  { id: 28, name: "Lily Carter", age: 32, email: "lily.carter@example.com" },
  { id: 29, name: "Mia Perez", age: 26, email: "mia.perez@example.com" },
  {
    id: 30,
    name: "Benjamin Evans",
    age: 34,
    email: "benjamin.evans@example.com",
  },
  {
    id: 31,
    name: "Grace Gonzalez",
    age: 30,
    email: "grace.gonzalez@example.com",
  },
  { id: 32, name: "Henry Walker", age: 28, email: "henry.walker@example.com" },
  {
    id: 33,
    name: "Abigail Moore",
    age: 25,
    email: "abigail.moore@example.com",
  },
  {
    id: 34,
    name: "William Harris",
    age: 27,
    email: "william.harris@example.com",
  },
  { id: 35, name: "Ella Clark", age: 26, email: "ella.clark@example.com" },
  {
    id: 36,
    name: "Samuel Turner",
    age: 31,
    email: "samuel.turner@example.com",
  },
  {
    id: 37,
    name: "Oliver Mitchell",
    age: 33,
    email: "oliver.mitchell@example.com",
  },
  {
    id: 38,
    name: "Amelia Wright",
    age: 30,
    email: "amelia.wright@example.com",
  },
  { id: 39, name: "Jacob Young", age: 29, email: "jacob.young@example.com" },
  { id: 40, name: "Sophie Lee", age: 24, email: "sophie.lee@example.com" },
  { id: 41, name: "Jacob Young", age: 29, email: "jacob.young@example.com" },
  { id: 42, name: "Sophie Lee", age: 24, email: "sophie.lee@example.com" },
  { id: 43, name: "Jacob Young", age: 29, email: "jacob.young@example.com" },
  { id: 44, name: "Sophie Lee", age: 24, email: "sophie.lee@example.com" },
  { id: 45, name: "Jacob Young", age: 29, email: "jacob.young@example.com" },
  { id: 46, name: "Sophie Lee", age: 24, email: "sophie.lee@example.com" },
  { id: 47, name: "Jacob Young", age: 29, email: "jacob.young@example.com" },
  { id: 48, name: "Sophie Lee", age: 24, email: "sophie.lee@example.com" },
  { id: 49, name: "Jacob Young", age: 29, email: "jacob.young@example.com" },
  { id: 50, name: "Sophie Lee", age: 24, email: "sophie.lee@example.com" },
];

export const demoData2 = [
  { id: 1, name: "John Doe 2", age: 30, email: "john.doe@example2.com" },
  { id: 2, name: "Jane Smith 2", age: 25, email: "jane.smith@example2.com" },
  {
    id: 3,
    name: "Michael Johnson 2",
    age: 32,
    email: "michael.johnson@example2.com",
  },
  { id: 4, name: "Emily Davis 2", age: 28, email: "emily.davis@example2.com" },
  {
    id: 5,
    name: "Sarah Wilson 2",
    age: 35,
    email: "sarah.wilson@example2.com",
  },
  { id: 6, name: "David Brown 2", age: 40, email: "david.brown@example2.com" },
  {
    id: 7,
    name: "Chris Miller 2",
    age: 29,
    email: "chris.miller@example2.com",
  },
  { id: 8, name: "Daniel Lee 2", age: 24, email: "daniel.lee@example2.com" },
  { id: 9, name: "Anna White 2", age: 33, email: "anna.white@example2.com" },
  {
    id: 10,
    name: "Sophia Taylor 2",
    age: 27,
    email: "sophia.taylor@example2.com",
  },
];

export const demoColumns: ColumnType[] = [
  { title: "ID", accessor: "id" },
  { title: "Name", accessor: "name", filterId: "name" },
  { title: "Age", accessor: "age", filterId: "age" },
  { title: "Email", accessor: "email", filterId: "email" },
  { title: "Email 2", accessor: "email" },
  { title: "Email 3", accessor: "email" },
  { title: "Email 4", accessor: "email" },
  { title: "Email 5", accessor: "email" },
  { title: "Email 6", accessor: "email" },
  { title: "Email 7", accessor: "email" },
  { title: "Email 8", accessor: "email" },
  { title: "Email 9", accessor: "email" },
  { title: "Email 10", accessor: "email" },
  { title: "Email 11", accessor: "email" },
];

export const demoColumns2: ColumnType[] = [
  { title: "ID", accessor: "id", filterId: "id" },
  { title: "Name", accessor: "name", filterId: "name" },
  { title: "Age", accessor: "age", filterId: "age" },
  { title: "Email", accessor: "email", filterId: "email" },
];

const ExpandingTable = (row: unknown) => (
  <div>{JSON.stringify(row)}</div>
);

export const tabs: TableTabsType[] = [
  {
    titleTable: "Demo Table",
    columns: demoColumns,
    data: demoData,
    total: demoData.length,
    actionMenuList: demoActionMenuList,
    newActionMenu: demoNewActionMenu,
    expandable: true,
    ExpandingContent: ExpandingTable,
    rowId: "id",
  },
  {
    titleTable: "Demo Table 2",
    columns: demoColumns2,
    data: demoData2,
    total: demoData2.length,
    expandable: true,
    multiExpandable: true,
    ExpandingContent: ExpandingTable,
    rowId: "id",
  },
];
