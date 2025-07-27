import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Card,
  CardBody,
  Input,
  Textarea,
  Select,
  SelectItem,
  Checkbox,
  Avatar,
  Chip,
} from "@heroui/react";
import {
  RiCheckLine,
  RiAlertLine,
  RiInformationLine,
  RiDeleteBinLine,
  RiEditLine,
  RiUserAddLine,
} from "react-icons/ri";

function ModalView() {
  const {
    isOpen: isBasicOpen,
    onOpen: onBasicOpen,
    onOpenChange: onBasicOpenChange,
  } = useDisclosure();
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onOpenChange: onFormOpenChange,
  } = useDisclosure();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onOpenChange: onConfirmOpenChange,
  } = useDisclosure();
  const {
    isOpen: isScrollOpen,
    onOpen: onScrollOpen,
    onOpenChange: onScrollOpenChange,
  } = useDisclosure();
  const {
    isOpen: isCustomOpen,
    onOpen: onCustomOpen,
    onOpenChange: onCustomOpenChange,
  } = useDisclosure();

  return (
    <div className="space-y-6">
      {/* Basic Modals */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Modals</h3>
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-3">
              <Button onPress={onBasicOpen} color="primary">
                Open Basic Modal
              </Button>
              <Button onPress={onFormOpen} color="secondary">
                Open Form Modal
              </Button>
              <Button onPress={onConfirmOpen} color="warning">
                Open Confirmation
              </Button>
              <Button onPress={onScrollOpen} color="success">
                Open Scrollable Modal
              </Button>
              <Button onPress={onCustomOpen} color="danger">
                Open Custom Modal
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Modal Sizes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Modal Sizes</h3>
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-3">
              {[
                "xs",
                "sm",
                "md",
                "lg",
                "xl",
                "2xl",
                "3xl",
                "4xl",
                "5xl",
                "full",
              ].map((size) => (
                <SizeModal key={size} size={size} />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Modal Placements */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Modal Placements</h3>
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-3">
              {["auto", "top", "center", "bottom"].map((placement) => (
                <PlacementModal key={placement} placement={placement} />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Basic Modal */}
      <Modal isOpen={isBasicOpen} onOpenChange={onBasicOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <RiInformationLine className="text-primary" />
                  Basic Modal
                </div>
              </ModalHeader>
              <ModalBody>
                <p>
                  This is a basic modal example. It contains simple content and
                  demonstrates the default modal behavior.
                </p>
                <p className="text-small text-foreground/60">
                  You can add any content here including text, images, forms, or
                  other components.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onOpenChange={onFormOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <RiUserAddLine className="text-secondary" />
                  Add New User
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    autoFocus
                    label="Name"
                    placeholder="Enter user name"
                    variant="bordered"
                  />
                  <Input
                    label="Email"
                    placeholder="Enter email address"
                    type="email"
                    variant="bordered"
                  />
                  <Select
                    label="Role"
                    placeholder="Select user role"
                    variant="bordered"
                  >
                    <SelectItem key="admin">Administrator</SelectItem>
                    <SelectItem key="user">User</SelectItem>
                    <SelectItem key="moderator">Moderator</SelectItem>
                  </Select>
                  <Textarea
                    label="Bio"
                    placeholder="Enter user bio"
                    variant="bordered"
                  />
                  <Checkbox defaultSelected>Send welcome email</Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Create User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmOpen} onOpenChange={onConfirmOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <RiAlertLine className="text-warning" />
                  Confirm Action
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                      <RiDeleteBinLine className="text-warning text-xl" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Delete User Account</p>
                    <p className="text-small text-foreground/60 mt-1">
                      Are you sure you want to delete this user account? This
                      action cannot be undone and will permanently remove all
                      associated data.
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={onClose}>
                  Delete Account
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Scrollable Modal */}
      <Modal
        isOpen={isScrollOpen}
        onOpenChange={onScrollOpenChange}
        scrollBehavior="inside"
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Scrollable Content Modal
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <p>
                    This modal demonstrates scrollable content. When the content
                    exceeds the modal height, it becomes scrollable.
                  </p>
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className="p-4 border border-divider rounded-lg"
                    >
                      <h4 className="font-medium">Section {i + 1}</h4>
                      <p className="text-small text-foreground/60 mt-1">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris.
                      </p>
                    </div>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Custom Modal */}
      <Modal
        isOpen={isCustomOpen}
        onOpenChange={onCustomOpenChange}
        backdrop="blur"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <RiEditLine className="text-danger" />
                  Custom Styled Modal
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src="https://nextui.org/avatars/avatar-1.png"
                      size="lg"
                    />
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-small text-foreground/60">
                        Software Engineer
                      </p>
                      <div className="flex gap-1 mt-1">
                        <Chip size="sm" color="primary" variant="flat">
                          React
                        </Chip>
                        <Chip size="sm" color="secondary" variant="flat">
                          TypeScript
                        </Chip>
                      </div>
                    </div>
                  </div>
                  <p className="text-small text-foreground/80">
                    This modal has custom styling with a blurred backdrop and
                    enhanced visual elements. It demonstrates how you can
                    customize the appearance of modals to match your design
                    system.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={onClose}
                  startContent={<RiCheckLine />}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

// Helper component for size modals
function SizeModal({ size }: { size: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen} size="sm" variant="flat">
        {size}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size={size as any}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Size: {size}</ModalHeader>
              <ModalBody>
                <p>This modal demonstrates the {size} size variant.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

// Helper component for placement modals
function PlacementModal({ placement }: { placement: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen} size="sm" variant="bordered">
        {placement}
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement={placement as any}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Placement: {placement}</ModalHeader>
              <ModalBody>
                <p>This modal is positioned at {placement}.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default ModalView;
