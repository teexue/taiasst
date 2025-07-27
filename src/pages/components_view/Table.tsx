import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardHeader,
  CardBody,
  Chip,
  User,
  Tooltip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  RiMoreLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
} from "react-icons/ri";

const users = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "CEO",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "https://nextui.org/avatars/avatar-1.png",
    email: "tony.reichert@example.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Technical Lead",
    team: "Development",
    status: "paused",
    age: "25",
    avatar: "https://nextui.org/avatars/avatar-2.png",
    email: "zoey.lang@example.com",
  },
  {
    id: 3,
    name: "Jane Fisher",
    role: "Senior Developer",
    team: "Development",
    status: "active",
    age: "22",
    avatar: "https://nextui.org/avatars/avatar-3.png",
    email: "jane.fisher@example.com",
  },
  {
    id: 4,
    name: "William Howard",
    role: "Community Manager",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://nextui.org/avatars/avatar-4.png",
    email: "william.howard@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    role: "Sales Manager",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://nextui.org/avatars/avatar-5.png",
    email: "kristen.copper@example.com",
  },
];

const columns = [
  { name: "NAME", uid: "name" },
  { name: "ROLE", uid: "role" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
} as const;

function TableView() {
  const renderCell = React.useCallback((user: any, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof typeof user];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.avatar }}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
            <p className="text-bold text-sm capitalize text-default-400">
              {user.team}
            </p>
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[user.status as keyof typeof statusColorMap]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <RiMoreLine className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem startContent={<RiEyeLine />} key={""}>
                  View
                </DropdownItem>
                <DropdownItem startContent={<RiEditLine />} key={""}>
                  Edit
                </DropdownItem>
                <DropdownItem
                  startContent={<RiDeleteBinLine />}
                  className="text-danger"
                  color="danger"
                  key={""}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Basic Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Table</h3>
        <Card>
          <CardBody>
            <Table aria-label="Basic table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                <TableRow key="1">
                  <TableCell>Tony Reichert</TableCell>
                  <TableCell>CEO</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
                <TableRow key="2">
                  <TableCell>Zoey Lang</TableCell>
                  <TableCell>Technical Lead</TableCell>
                  <TableCell>Paused</TableCell>
                </TableRow>
                <TableRow key="3">
                  <TableCell>Jane Fisher</TableCell>
                  <TableCell>Senior Developer</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
                <TableRow key="4">
                  <TableCell>William Howard</TableCell>
                  <TableCell>Community Manager</TableCell>
                  <TableCell>Vacation</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Dynamic Table with Custom Cells */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Dynamic Table with Custom Cells
        </h3>
        <Card>
          <CardBody>
            <Table aria-label="Dynamic table with custom cells">
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn
                    key={column.uid}
                    align={column.uid === "actions" ? "center" : "start"}
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={users}>
                {(item) => (
                  <TableRow key={item.id}>
                    {(columnKey) => (
                      <TableCell>{renderCell(item, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Striped Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Striped Table</h3>
        <Card>
          <CardBody>
            <Table
              aria-label="Striped table"
              classNames={{
                wrapper: "min-h-[222px]",
              }}
              isStriped
            >
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Compact Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Compact Table</h3>
        <Card>
          <CardBody>
            <Table aria-label="Compact table" isCompact removeWrapper>
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>TEAM</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.team}</TableCell>
                    <TableCell>
                      <Chip
                        className="capitalize"
                        color={
                          statusColorMap[
                            user.status as keyof typeof statusColorMap
                          ]
                        }
                        size="sm"
                        variant="flat"
                      >
                        {user.status}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Table with Header */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Table with Header</h3>
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Team Members</p>
              <p className="text-small text-default-500">
                Total {users.length} users
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <Table aria-label="Table with header">
              <TableHeader>
                <TableColumn>USER</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <User
                        avatarProps={{ radius: "lg", src: user.avatar }}
                        description={user.email}
                        name={user.name}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">
                          {user.role}
                        </p>
                        <p className="text-bold text-sm capitalize text-default-400">
                          {user.team}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        className="capitalize"
                        color={
                          statusColorMap[
                            user.status as keyof typeof statusColorMap
                          ]
                        }
                        size="sm"
                        variant="flat"
                      >
                        {user.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tooltip content="View details">
                          <Button isIconOnly size="sm" variant="light">
                            <RiEyeLine />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Edit user">
                          <Button isIconOnly size="sm" variant="light">
                            <RiEditLine />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete user" color="danger">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                          >
                            <RiDeleteBinLine />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Empty State Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Empty State Table</h3>
        <Card>
          <CardBody>
            <Table aria-label="Empty table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Loading State Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Loading State Table</h3>
        <Card>
          <CardBody>
            <Table aria-label="Loading table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody isLoading={true} loadingContent={"Loading..."}>
                {[]}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default TableView;
