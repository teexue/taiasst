import { useState } from "react";
import {
  Input,
  Textarea,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  Card,
  CardHeader,
  CardBody,
  Divider,
} from "@heroui/react";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiSearchLine,
  RiMailLine,
  RiLockLine,
  RiUserLine,
  RiPhoneLine,
} from "react-icons/ri";

const animals = [
  { key: "cat", label: "Cat" },
  { key: "dog", label: "Dog" },
  { key: "elephant", label: "Elephant" },
  { key: "lion", label: "Lion" },
  { key: "tiger", label: "Tiger" },
  { key: "giraffe", label: "Giraffe" },
  { key: "dolphin", label: "Dolphin" },
  { key: "penguin", label: "Penguin" },
  { key: "zebra", label: "Zebra" },
  { key: "shark", label: "Shark" },
];

function InputView() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="space-y-6">
      {/* Basic Inputs */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Basic Inputs</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default Input"
              placeholder="Enter your text"
              variant="flat"
            />
            <Input
              label="Bordered Input"
              placeholder="Enter your text"
              variant="bordered"
            />
            <Input
              label="Underlined Input"
              placeholder="Enter your text"
              variant="underlined"
            />
            <Input
              label="Faded Input"
              placeholder="Enter your text"
              variant="faded"
            />
          </div>
        </CardBody>
      </Card>

      {/* Input with Icons */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Inputs with Icons</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              placeholder="you@example.com"
              startContent={<RiMailLine className="text-default-400" />}
              variant="bordered"
            />
            <Input
              label="Search"
              placeholder="Search..."
              startContent={<RiSearchLine className="text-default-400" />}
              variant="bordered"
            />
            <Input
              label="Username"
              placeholder="Enter username"
              startContent={<RiUserLine className="text-default-400" />}
              variant="bordered"
            />
            <Input
              label="Phone"
              placeholder="+1 (555) 000-0000"
              startContent={<RiPhoneLine className="text-default-400" />}
              variant="bordered"
            />
          </div>
        </CardBody>
      </Card>

      {/* Password Input */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Password Input</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <Input
            label="Password"
            variant="bordered"
            placeholder="Enter your password"
            startContent={<RiLockLine className="text-default-400" />}
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={toggleVisibility}
              >
                {isVisible ? (
                  <RiEyeOffLine className="text-default-400" />
                ) : (
                  <RiEyeLine className="text-default-400" />
                )}
              </button>
            }
            type={isVisible ? "text" : "password"}
          />
        </CardBody>
      </Card>

      {/* Input States */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Input States</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default"
              placeholder="Default state"
              variant="bordered"
            />
            <Input
              label="Disabled"
              placeholder="Disabled state"
              variant="bordered"
              isDisabled
            />
            <Input
              label="Invalid"
              placeholder="Invalid state"
              variant="bordered"
              isInvalid
              errorMessage="Please enter a valid value"
            />
            <Input
              label="Required"
              placeholder="Required field"
              variant="bordered"
              isRequired
            />
          </div>
        </CardBody>
      </Card>

      {/* Textarea */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Textarea</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Description"
              placeholder="Enter your description"
              variant="bordered"
            />
            <Textarea
              label="Comments"
              placeholder="Enter your comments"
              variant="faded"
              minRows={3}
            />
          </div>
        </CardBody>
      </Card>

      {/* Select */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Select</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Favorite Animal"
              placeholder="Select an animal"
              variant="bordered"
            >
              {animals.map((animal) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="Multiple Selection"
              placeholder="Select animals"
              variant="bordered"
              selectionMode="multiple"
            >
              {animals.map((animal) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Autocomplete */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Autocomplete</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Autocomplete
              label="Search Animal"
              placeholder="Type to search..."
              variant="bordered"
              defaultItems={animals}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
              )}
            </Autocomplete>
            <Autocomplete
              label="Search with Custom Filter"
              placeholder="Type to search..."
              variant="bordered"
              defaultItems={animals}
              startContent={<RiSearchLine className="text-default-400" />}
            >
              {(item) => (
                <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
              )}
            </Autocomplete>
          </div>
        </CardBody>
      </Card>

      {/* Input Sizes */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Input Sizes</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="space-y-3">
            <Input
              size="sm"
              label="Small"
              placeholder="Small input"
              variant="bordered"
            />
            <Input
              size="md"
              label="Medium"
              placeholder="Medium input"
              variant="bordered"
            />
            <Input
              size="lg"
              label="Large"
              placeholder="Large input"
              variant="bordered"
            />
          </div>
        </CardBody>
      </Card>

      {/* Input Colors */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Input Colors</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              color="default"
              label="Default"
              placeholder="Default color"
              variant="bordered"
            />
            <Input
              color="primary"
              label="Primary"
              placeholder="Primary color"
              variant="bordered"
            />
            <Input
              color="secondary"
              label="Secondary"
              placeholder="Secondary color"
              variant="bordered"
            />
            <Input
              color="success"
              label="Success"
              placeholder="Success color"
              variant="bordered"
            />
            <Input
              color="warning"
              label="Warning"
              placeholder="Warning color"
              variant="bordered"
            />
            <Input
              color="danger"
              label="Danger"
              placeholder="Danger color"
              variant="bordered"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default InputView;
