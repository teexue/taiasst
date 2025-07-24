import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Card,
  CardBody,
  Breadcrumbs,
  BreadcrumbItem,
  Pagination,
} from "@heroui/react";
import {
  RiHomeLine,
  RiUserLine,
  RiSettingsLine,
  RiNotificationLine,
  RiLogoutBoxLine,
  RiDashboardLine,
  RiTeamLine,
  RiFileListLine,
  RiBarChartLine,
} from "react-icons/ri";

function NavigationView() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];

  return (
    <div className="space-y-6">
      {/* Basic Navbar */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Navbar</h3>
        <Card>
          <CardBody className="p-0">
            <Navbar>
              <NavbarBrand>
                <p className="font-bold text-inherit">ACME</p>
              </NavbarBrand>
              <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem>
                  <Link color="foreground" href="#">
                    Features
                  </Link>
                </NavbarItem>
                <NavbarItem isActive>
                  <Link href="#" aria-current="page">
                    Customers
                  </Link>
                </NavbarItem>
                <NavbarItem>
                  <Link color="foreground" href="#">
                    Integrations
                  </Link>
                </NavbarItem>
              </NavbarContent>
              <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                  <Link href="#">Login</Link>
                </NavbarItem>
                <NavbarItem>
                  <Button as={Link} color="primary" href="#" variant="flat">
                    Sign Up
                  </Button>
                </NavbarItem>
              </NavbarContent>
            </Navbar>
          </CardBody>
        </Card>
      </div>

      {/* Navbar with Menu */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Navbar with Mobile Menu</h3>
        <Card>
          <CardBody className="p-0">
            <Navbar onMenuOpenChange={setIsMenuOpen}>
              <NavbarContent>
                <NavbarMenuToggle
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                  className="sm:hidden"
                />
                <NavbarBrand>
                  <RiDashboardLine className="mr-2" />
                  <p className="font-bold text-inherit">Dashboard</p>
                </NavbarBrand>
              </NavbarContent>

              <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem>
                  <Link color="foreground" href="#">
                    <RiHomeLine className="mr-1" />
                    Home
                  </Link>
                </NavbarItem>
                <NavbarItem isActive>
                  <Link href="#" aria-current="page">
                    <RiBarChartLine className="mr-1" />
                    Analytics
                  </Link>
                </NavbarItem>
                <NavbarItem>
                  <Link color="foreground" href="#">
                    <RiTeamLine className="mr-1" />
                    Team
                  </Link>
                </NavbarItem>
              </NavbarContent>

              <NavbarContent justify="end">
                <NavbarItem>
                  <Button isIconOnly variant="light">
                    <RiNotificationLine />
                  </Button>
                </NavbarItem>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Avatar
                      isBordered
                      as="button"
                      className="transition-transform"
                      color="secondary"
                      name="Jason Hughes"
                      size="sm"
                      src="https://nextui.org/avatars/avatar-1.png"
                    />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownItem key="profile" className="h-14 gap-2">
                      <p className="font-semibold">Signed in as</p>
                      <p className="font-semibold">zoey@example.com</p>
                    </DropdownItem>
                    <DropdownItem
                      key="settings"
                      startContent={<RiSettingsLine />}
                    >
                      My Settings
                    </DropdownItem>
                    <DropdownItem
                      key="team_settings"
                      startContent={<RiTeamLine />}
                    >
                      Team Settings
                    </DropdownItem>
                    <DropdownItem
                      key="analytics"
                      startContent={<RiBarChartLine />}
                    >
                      Analytics
                    </DropdownItem>
                    <DropdownItem
                      key="help_and_feedback"
                      startContent={<RiFileListLine />}
                    >
                      Help & Feedback
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      color="danger"
                      startContent={<RiLogoutBoxLine />}
                    >
                      Log Out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarContent>

              <NavbarMenu>
                {menuItems.map((item, index) => (
                  <NavbarMenuItem key={`${item}-${index}`}>
                    <Link
                      color={
                        index === 2
                          ? "primary"
                          : index === menuItems.length - 1
                            ? "danger"
                            : "foreground"
                      }
                      className="w-full"
                      href="#"
                      size="lg"
                    >
                      {item}
                    </Link>
                  </NavbarMenuItem>
                ))}
              </NavbarMenu>
            </Navbar>
          </CardBody>
        </Card>
      </div>

      {/* Breadcrumbs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Breadcrumbs</h3>
        <div className="space-y-4">
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Basic Breadcrumbs</h4>
              <Breadcrumbs>
                <BreadcrumbItem>Home</BreadcrumbItem>
                <BreadcrumbItem>Music</BreadcrumbItem>
                <BreadcrumbItem>Artist</BreadcrumbItem>
                <BreadcrumbItem>Album</BreadcrumbItem>
                <BreadcrumbItem>Song</BreadcrumbItem>
              </Breadcrumbs>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Breadcrumbs with Icons</h4>
              <Breadcrumbs>
                <BreadcrumbItem startContent={<RiHomeLine />}>
                  Home
                </BreadcrumbItem>
                <BreadcrumbItem startContent={<RiDashboardLine />}>
                  Dashboard
                </BreadcrumbItem>
                <BreadcrumbItem startContent={<RiUserLine />}>
                  Users
                </BreadcrumbItem>
                <BreadcrumbItem>Profile</BreadcrumbItem>
              </Breadcrumbs>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Breadcrumbs Variants</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-foreground/60 mb-2">Solid</p>
                  <Breadcrumbs variant="solid">
                    <BreadcrumbItem>Home</BreadcrumbItem>
                    <BreadcrumbItem>Library</BreadcrumbItem>
                    <BreadcrumbItem>Data</BreadcrumbItem>
                  </Breadcrumbs>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 mb-2">Bordered</p>
                  <Breadcrumbs variant="bordered">
                    <BreadcrumbItem>Home</BreadcrumbItem>
                    <BreadcrumbItem>Library</BreadcrumbItem>
                    <BreadcrumbItem>Data</BreadcrumbItem>
                  </Breadcrumbs>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 mb-2">Light</p>
                  <Breadcrumbs variant="light">
                    <BreadcrumbItem>Home</BreadcrumbItem>
                    <BreadcrumbItem>Library</BreadcrumbItem>
                    <BreadcrumbItem>Data</BreadcrumbItem>
                  </Breadcrumbs>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Pagination */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Pagination</h3>
        <div className="space-y-4">
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Basic Pagination</h4>
              <div className="flex justify-center">
                <Pagination total={10} initialPage={1} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Pagination Variants</h4>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-foreground/60 mb-2">Flat</p>
                  <Pagination total={5} initialPage={3} variant="flat" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground/60 mb-2">Bordered</p>
                  <Pagination total={5} initialPage={3} variant="bordered" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground/60 mb-2">Light</p>
                  <Pagination total={5} initialPage={3} variant="light" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground/60 mb-2">Faded</p>
                  <Pagination total={5} initialPage={3} variant="faded" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Pagination Colors</h4>
              <div className="space-y-4">
                {["primary", "secondary", "success", "warning", "danger"].map(
                  (color) => (
                    <div key={color} className="text-center">
                      <p className="text-sm text-foreground/60 mb-2 capitalize">
                        {color}
                      </p>
                      <Pagination
                        total={5}
                        initialPage={3}
                        color={color as any}
                      />
                    </div>
                  ),
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Pagination Sizes</h4>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-foreground/60 mb-2">Small</p>
                  <Pagination total={5} initialPage={3} size="sm" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground/60 mb-2">Medium</p>
                  <Pagination total={5} initialPage={3} size="md" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground/60 mb-2">Large</p>
                  <Pagination total={5} initialPage={3} size="lg" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Pagination with Controls</h4>
              <div className="text-center">
                <Pagination
                  total={10}
                  initialPage={1}
                  showControls
                  showShadow
                  color="primary"
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Link Examples */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Links</h3>
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Link Colors</h4>
                <div className="flex flex-wrap gap-4">
                  <Link href="#">Default Link</Link>
                  <Link color="primary" href="#">
                    Primary Link
                  </Link>
                  <Link color="secondary" href="#">
                    Secondary Link
                  </Link>
                  <Link color="success" href="#">
                    Success Link
                  </Link>
                  <Link color="warning" href="#">
                    Warning Link
                  </Link>
                  <Link color="danger" href="#">
                    Danger Link
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Link Variants</h4>
                <div className="flex flex-wrap gap-4">
                  <Link href="#" underline="none">
                    No Underline
                  </Link>
                  <Link href="#" underline="hover">
                    Hover Underline
                  </Link>
                  <Link href="#" underline="always">
                    Always Underline
                  </Link>
                  <Link href="#" underline="active">
                    Active Underline
                  </Link>
                  <Link href="#" underline="focus">
                    Focus Underline
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Link Sizes</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="#" size="sm">
                    Small Link
                  </Link>
                  <Link href="#" size="md">
                    Medium Link
                  </Link>
                  <Link href="#" size="lg">
                    Large Link
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">External Links</h4>
                <div className="flex flex-wrap gap-4">
                  <Link href="#" isExternal showAnchorIcon>
                    External Link
                  </Link>
                  <Link href="#" isExternal showAnchorIcon color="primary">
                    Primary External
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Block Links</h4>
                <Link href="#" isBlock showAnchorIcon color="primary">
                  This is a block link that spans the full width
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default NavigationView;
