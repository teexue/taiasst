import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
  ButtonGroup,
} from "@heroui/react";
import {
  RiHeartLine,
  RiShareLine,
  RiDownloadLine,
  RiPlayLine,
  RiPauseLine,
  RiStopLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiSettingsLine,
} from "react-icons/ri";

function ButtonView() {
  return (
    <div className="space-y-6">
      {/* Basic Buttons */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Basic Buttons</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button color="default">Default</Button>
            <Button color="primary">Primary</Button>
            <Button color="secondary">Secondary</Button>
            <Button color="success">Success</Button>
            <Button color="warning">Warning</Button>
            <Button color="danger">Danger</Button>
          </div>
        </CardBody>
      </Card>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Button Variants</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button variant="solid" color="primary">
                Solid
              </Button>
              <Button variant="bordered" color="primary">
                Bordered
              </Button>
              <Button variant="light" color="primary">
                Light
              </Button>
              <Button variant="flat" color="primary">
                Flat
              </Button>
              <Button variant="faded" color="primary">
                Faded
              </Button>
              <Button variant="shadow" color="primary">
                Shadow
              </Button>
              <Button variant="ghost" color="primary">
                Ghost
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Button Sizes */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Button Sizes</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" color="primary">
              Small
            </Button>
            <Button size="md" color="primary">
              Medium
            </Button>
            <Button size="lg" color="primary">
              Large
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Button States */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Button States</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button color="primary">Normal</Button>
            <Button color="primary" isLoading>
              Loading
            </Button>
            <Button color="primary" isDisabled>
              Disabled
            </Button>
            <Button color="primary" fullWidth className="max-w-xs">
              Full Width
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Icon Buttons */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Icon Buttons</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button isIconOnly color="primary" variant="solid">
                <RiHeartLine />
              </Button>
              <Button isIconOnly color="secondary" variant="bordered">
                <RiShareLine />
              </Button>
              <Button isIconOnly color="success" variant="light">
                <RiDownloadLine />
              </Button>
              <Button isIconOnly color="warning" variant="flat">
                <RiEditLine />
              </Button>
              <Button isIconOnly color="danger" variant="faded">
                <RiDeleteBinLine />
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button startContent={<RiAddLine />} color="primary">
                Add Item
              </Button>
              <Button
                startContent={<RiSearchLine />}
                color="secondary"
                variant="bordered"
              >
                Search
              </Button>
              <Button
                endContent={<RiSettingsLine />}
                color="default"
                variant="flat"
              >
                Settings
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Button Groups */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Button Groups</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground/70 mb-2">
                Default Button Group
              </p>
              <ButtonGroup>
                <Button startContent={<RiPlayLine />}>Play</Button>
                <Button startContent={<RiPauseLine />}>Pause</Button>
                <Button startContent={<RiStopLine />}>Stop</Button>
              </ButtonGroup>
            </div>

            <div>
              <p className="text-sm text-foreground/70 mb-2">
                Bordered Variant
              </p>
              <ButtonGroup variant="bordered">
                <Button>One</Button>
                <Button>Two</Button>
                <Button>Three</Button>
              </ButtonGroup>
            </div>

            <div>
              <p className="text-sm text-foreground/70 mb-2">
                Primary Color with Flat Variant
              </p>
              <ButtonGroup color="primary" variant="flat">
                <Button>Left</Button>
                <Button>Center</Button>
                <Button>Right</Button>
              </ButtonGroup>
            </div>

            <div>
              <p className="text-sm text-foreground/70 mb-2">Different Sizes</p>
              <div className="flex flex-col gap-3">
                <ButtonGroup size="sm">
                  <Button>Small</Button>
                  <Button>Group</Button>
                </ButtonGroup>
                <ButtonGroup size="md">
                  <Button>Medium</Button>
                  <Button>Group</Button>
                </ButtonGroup>
                <ButtonGroup size="lg">
                  <Button>Large</Button>
                  <Button>Group</Button>
                </ButtonGroup>
              </div>
            </div>

            <div>
              <p className="text-sm text-foreground/70 mb-2">Disabled Group</p>
              <ButtonGroup isDisabled>
                <Button>Disabled</Button>
                <Button>Button</Button>
                <Button>Group</Button>
              </ButtonGroup>
            </div>

            <div>
              <p className="text-sm text-foreground/70 mb-2">
                Full Width Group
              </p>
              <ButtonGroup fullWidth>
                <Button>Full</Button>
                <Button>Width</Button>
                <Button>Group</Button>
              </ButtonGroup>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Custom Styled Buttons */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Custom Styled Buttons</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
              radius="full"
            >
              Gradient Button
            </Button>
            <Button className="bg-black text-white" variant="solid" radius="sm">
              Custom Black
            </Button>
            <Button
              className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              variant="bordered"
              radius="lg"
            >
              Custom Border
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default ButtonView;
