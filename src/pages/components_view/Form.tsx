import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Checkbox,
  CheckboxGroup,
  RadioGroup,
  Radio,
  Switch,
  Slider,
  Button,
  Divider,
  DatePicker,
  Chip,
} from "@heroui/react";
import {
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCalendarLine,
} from "react-icons/ri";

function FormView() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState(3);
  const [notifications, setNotifications] = useState(true);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="space-y-6">
      {/* Basic Form */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Form</h3>
        <Card>
          <CardHeader>
            <h4 className="font-semibold">User Registration</h4>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Enter your first name"
                variant="bordered"
                startContent={<RiUserLine className="text-default-400" />}
                isRequired
              />
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                variant="bordered"
                startContent={<RiUserLine className="text-default-400" />}
                isRequired
              />
            </div>
            <Input
              label="Email"
              placeholder="Enter your email"
              type="email"
              variant="bordered"
              startContent={<RiMailLine className="text-default-400" />}
              isRequired
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              variant="bordered"
              startContent={<RiPhoneLine className="text-default-400" />}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              variant="bordered"
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
              isRequired
            />
          </CardBody>
          <Divider />
          <CardFooter>
            <div className="flex gap-2 w-full">
              <Button color="danger" variant="flat" className="flex-1">
                Cancel
              </Button>
              <Button color="primary" className="flex-1">
                Register
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Advanced Form */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Advanced Form</h3>
        <Card>
          <CardHeader>
            <h4 className="font-semibold">Job Application</h4>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            {/* Personal Information */}
            <div>
              <h5 className="font-medium mb-3">Personal Information</h5>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    variant="bordered"
                  />
                  <Select
                    label="Gender"
                    placeholder="Select gender"
                    variant="bordered"
                  >
                    <SelectItem key="male">Male</SelectItem>
                    <SelectItem key="female">Female</SelectItem>
                    <SelectItem key="other">Other</SelectItem>
                    <SelectItem key="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePicker
                    label="Date of Birth"
                    variant="bordered"
                    startContent={
                      <RiCalendarLine className="text-default-400" />
                    }
                  />
                  <Input
                    label="Nationality"
                    placeholder="Enter your nationality"
                    variant="bordered"
                  />
                </div>
              </div>
            </div>

            <Divider />

            {/* Professional Information */}
            <div>
              <h5 className="font-medium mb-3">Professional Information</h5>
              <div className="space-y-4">
                <Select
                  label="Position Applied For"
                  placeholder="Select position"
                  variant="bordered"
                >
                  <SelectItem key="frontend">Frontend Developer</SelectItem>
                  <SelectItem key="backend">Backend Developer</SelectItem>
                  <SelectItem key="fullstack">Full Stack Developer</SelectItem>
                  <SelectItem key="designer">UI/UX Designer</SelectItem>
                  <SelectItem key="manager">Project Manager</SelectItem>
                </Select>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Years of Experience: {experience}
                  </label>
                  <Slider
                    size="sm"
                    step={1}
                    maxValue={20}
                    minValue={0}
                    value={experience}
                    onChange={(value) => setExperience(value as number)}
                    className="max-w-md"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Skills
                  </label>
                  <CheckboxGroup
                    value={selectedSkills}
                    onValueChange={setSelectedSkills}
                    orientation="horizontal"
                  >
                    <Checkbox value="javascript">JavaScript</Checkbox>
                    <Checkbox value="typescript">TypeScript</Checkbox>
                    <Checkbox value="react">React</Checkbox>
                    <Checkbox value="vue">Vue.js</Checkbox>
                    <Checkbox value="node">Node.js</Checkbox>
                    <Checkbox value="python">Python</Checkbox>
                  </CheckboxGroup>
                </div>

                <RadioGroup
                  label="Preferred Work Mode"
                  orientation="horizontal"
                  defaultValue="hybrid"
                >
                  <Radio value="remote">Remote</Radio>
                  <Radio value="onsite">On-site</Radio>
                  <Radio value="hybrid">Hybrid</Radio>
                </RadioGroup>

                <Textarea
                  label="Cover Letter"
                  placeholder="Tell us why you're interested in this position..."
                  variant="bordered"
                  minRows={4}
                />
              </div>
            </div>

            <Divider />

            {/* Preferences */}
            <div>
              <h5 className="font-medium mb-3">Preferences</h5>
              <div className="space-y-4">
                <Switch
                  isSelected={notifications}
                  onValueChange={setNotifications}
                >
                  Email notifications about application status
                </Switch>

                <div className="flex items-center gap-2">
                  <Checkbox defaultSelected>
                    I agree to the terms and conditions
                  </Checkbox>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox>Subscribe to newsletter</Checkbox>
                </div>
              </div>
            </div>
          </CardBody>
          <Divider />
          <CardFooter>
            <div className="flex gap-2 w-full">
              <Button color="danger" variant="flat" className="flex-1">
                Save as Draft
              </Button>
              <Button color="primary" className="flex-1">
                Submit Application
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Form Validation */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Form with Validation</h3>
        <Card>
          <CardHeader>
            <h4 className="font-semibold">Contact Form</h4>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <Input
              label="Name"
              placeholder="Enter your name"
              variant="bordered"
              isRequired
              errorMessage="Name is required"
            />
            <Input
              label="Email"
              placeholder="Enter your email"
              type="email"
              variant="bordered"
              isRequired
              isInvalid
              errorMessage="Please enter a valid email address"
            />
            <Input
              label="Subject"
              placeholder="Enter subject"
              variant="bordered"
              isRequired
            />
            <Textarea
              label="Message"
              placeholder="Enter your message"
              variant="bordered"
              isRequired
              minRows={3}
            />
          </CardBody>
          <Divider />
          <CardFooter>
            <Button color="primary" className="w-full">
              Send Message
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Inline Form */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Inline Form</h3>
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-end gap-3">
              <Input
                label="Search"
                placeholder="Enter search term"
                variant="bordered"
                className="flex-1 min-w-[200px]"
              />
              <Select
                label="Category"
                placeholder="All"
                variant="bordered"
                className="w-[150px]"
              >
                <SelectItem key="all">All</SelectItem>
                <SelectItem key="products">Products</SelectItem>
                <SelectItem key="services">Services</SelectItem>
                <SelectItem key="support">Support</SelectItem>
              </Select>
              <Button color="primary">Search</Button>
              <Button variant="flat">Reset</Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Multi-step Form Preview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Multi-step Form</h3>
        <Card>
          <CardHeader>
            <div className="w-full">
              <h4 className="font-semibold mb-2">Setup Wizard</h4>
              <div className="flex items-center gap-2">
                <Chip size="sm" color="success" variant="flat">
                  Step 1
                </Chip>
                <div className="flex-1 h-1 bg-default-200 rounded">
                  <div className="h-full w-1/3 bg-primary rounded"></div>
                </div>
                <span className="text-sm text-default-500">1 of 3</span>
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <h5 className="font-medium">Basic Information</h5>
            <Input
              label="Company Name"
              placeholder="Enter company name"
              variant="bordered"
            />
            <Input
              label="Website"
              placeholder="https://example.com"
              variant="bordered"
            />
            <Select
              label="Industry"
              placeholder="Select industry"
              variant="bordered"
            >
              <SelectItem key="tech">Technology</SelectItem>
              <SelectItem key="finance">Finance</SelectItem>
              <SelectItem key="healthcare">Healthcare</SelectItem>
              <SelectItem key="education">Education</SelectItem>
            </Select>
          </CardBody>
          <Divider />
          <CardFooter>
            <div className="flex gap-2 w-full">
              <Button variant="flat" className="flex-1" isDisabled>
                Previous
              </Button>
              <Button color="primary" className="flex-1">
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default FormView;
