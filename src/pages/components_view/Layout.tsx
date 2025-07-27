import {
  Card,
  CardBody,
  Divider,
  Spacer,
  Code,
  Snippet,
  Image,
  ScrollShadow,
  Accordion,
  AccordionItem,
  Listbox,
  ListboxItem,
} from "@heroui/react";
import {
  RiCodeLine,
  RiCropLine,
  RiImageLine,
  RiSettings4Line,
  RiUserLine,
  RiNotificationLine,
  RiShieldLine,
} from "react-icons/ri";

function LayoutView() {
  return (
    <div className="space-y-6">
      {/* Divider */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Divider</h3>
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Basic Dividers</h4>
                <div>
                  <p>Content above divider</p>
                  <Divider className="my-4" />
                  <p>Content below divider</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Vertical Divider</h4>
                <div className="flex h-20 items-center space-x-4">
                  <div>Left content</div>
                  <Divider orientation="vertical" />
                  <div>Right content</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Spacer */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Spacer</h3>
        <Card>
          <CardBody>
            <div>
              <p>Content before spacer</p>
              <Spacer y={4} />
              <p>Content after spacer (with y=4 spacing)</p>
              <Spacer y={8} />
              <p>Content after larger spacer (with y=8 spacing)</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Code */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Code</h3>
        <div className="space-y-4">
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Inline Code</h4>
              <p>
                Use the <Code>useState</Code> hook to manage component state in
                React. You can also use <Code color="primary">useEffect</Code>{" "}
                for side effects.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Code Colors</h4>
              <div className="space-y-2">
                <p>
                  Default: <Code>console.log("Hello")</Code>
                </p>
                <p>
                  Primary: <Code color="primary">const value = true</Code>
                </p>
                <p>
                  Secondary: <Code color="secondary">let count = 0</Code>
                </p>
                <p>
                  Success: <Code color="success">// Success message</Code>
                </p>
                <p>
                  Warning: <Code color="warning">// Warning comment</Code>
                </p>
                <p>
                  Danger: <Code color="danger">throw new Error()</Code>
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Code Sizes</h4>
              <div className="space-y-2">
                <p>
                  Small: <Code size="sm">npm install</Code>
                </p>
                <p>
                  Medium: <Code size="md">yarn add package</Code>
                </p>
                <p>
                  Large: <Code size="lg">pnpm install</Code>
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Snippet */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Snippet</h3>
        <div className="space-y-4">
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Basic Snippet</h4>
              <Snippet>npm install @heroui/react</Snippet>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Snippet Variants</h4>
              <div className="space-y-3">
                <Snippet variant="flat">npm install @heroui/react</Snippet>
                <Snippet variant="solid">yarn add @heroui/react</Snippet>
                <Snippet variant="bordered">pnpm add @heroui/react</Snippet>
                <Snippet variant="shadow">bun add @heroui/react</Snippet>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Snippet Colors</h4>
              <div className="space-y-3">
                <Snippet color="primary">git clone repository</Snippet>
                <Snippet color="secondary">cd project-folder</Snippet>
                <Snippet color="success">npm run build</Snippet>
                <Snippet color="warning">npm run dev</Snippet>
                <Snippet color="danger">rm -rf node_modules</Snippet>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Multi-line Snippet</h4>
              <Snippet>
                {`npm install @heroui/react framer-motion
npm install @heroui/theme
npm install tailwindcss`}
              </Snippet>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Custom Copy Icon</h4>
              <Snippet
                symbol=""
                copyIcon={<RiCropLine />}
                checkIcon={<RiCodeLine />}
              >
                custom-command --flag value
              </Snippet>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Image */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Image</h3>
        <div className="space-y-4">
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Basic Images</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Image
                  width={200}
                  alt="NextUI hero"
                  src="https://nextui.org/images/hero-card-complete.jpeg"
                />
                <Image
                  width={200}
                  alt="NextUI hero"
                  src="https://nextui.org/images/hero-card.jpeg"
                />
                <Image
                  width={200}
                  alt="NextUI album cover"
                  src="https://nextui.org/images/album-cover.png"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Image with Fallback</h4>
              <Image
                width={200}
                alt="Broken image"
                src="https://broken-link.jpg"
                fallbackSrc="https://via.placeholder.com/200x200?text=Fallback"
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Loading State</h4>
              <Image
                width={200}
                height={200}
                alt="Loading image"
                src="https://nextui.org/images/hero-card-complete.jpeg"
                isLoading
              />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ScrollShadow */}
      <div>
        <h3 className="text-lg font-semibold mb-4">ScrollShadow</h3>
        <Card>
          <CardBody>
            <h4 className="font-medium mb-3">Scrollable Content with Shadow</h4>
            <ScrollShadow className="w-[400px] h-[200px]">
              <div className="space-y-4 p-4">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="p-3 bg-default-100 rounded-lg">
                    <h5 className="font-medium">Item {i + 1}</h5>
                    <p className="text-sm text-foreground/60">
                      This is a scrollable item with some content that
                      demonstrates the scroll shadow effect when scrolling
                      through the list.
                    </p>
                  </div>
                ))}
              </div>
            </ScrollShadow>
          </CardBody>
        </Card>
      </div>

      {/* Accordion */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Accordion</h3>
        <div className="space-y-4">
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Basic Accordion</h4>
              <Accordion>
                <AccordionItem
                  key="1"
                  aria-label="Accordion 1"
                  title="What is NextUI?"
                >
                  NextUI is a modern React UI library that provides a set of
                  accessible, reusable, and beautiful components by default.
                </AccordionItem>
                <AccordionItem
                  key="2"
                  aria-label="Accordion 2"
                  title="How to install?"
                >
                  You can install NextUI via npm, yarn, or pnpm. Run the
                  command: npm install @nextui-org/react framer-motion
                </AccordionItem>
                <AccordionItem
                  key="3"
                  aria-label="Accordion 3"
                  title="Is it free?"
                >
                  Yes, NextUI is completely free and open source. You can use it
                  in both personal and commercial projects.
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Accordion with Icons</h4>
              <Accordion>
                <AccordionItem
                  key="1"
                  aria-label="General"
                  startContent={<RiSettings4Line className="text-primary" />}
                  title="General Settings"
                >
                  Configure general application settings including language,
                  timezone, and default preferences.
                </AccordionItem>
                <AccordionItem
                  key="2"
                  aria-label="Account"
                  startContent={<RiUserLine className="text-secondary" />}
                  title="Account Settings"
                >
                  Manage your account information, password, and profile
                  settings.
                </AccordionItem>
                <AccordionItem
                  key="3"
                  aria-label="Notifications"
                  startContent={<RiNotificationLine className="text-warning" />}
                  title="Notification Settings"
                >
                  Control how and when you receive notifications from the
                  application.
                </AccordionItem>
                <AccordionItem
                  key="4"
                  aria-label="Security"
                  startContent={<RiShieldLine className="text-success" />}
                  title="Security Settings"
                >
                  Configure security options including two-factor authentication
                  and login preferences.
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Accordion Variants</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/60 mb-2">
                    Light Variant
                  </p>
                  <Accordion variant="light">
                    <AccordionItem key="1" title="Light Accordion">
                      This is a light variant accordion item.
                    </AccordionItem>
                    <AccordionItem key="2" title="Another Item">
                      Content for the second item.
                    </AccordionItem>
                  </Accordion>
                </div>

                <div>
                  <p className="text-sm text-foreground/60 mb-2">
                    Shadow Variant
                  </p>
                  <Accordion variant="shadow">
                    <AccordionItem key="1" title="Shadow Accordion">
                      This is a shadow variant accordion item.
                    </AccordionItem>
                    <AccordionItem key="2" title="Another Item">
                      Content for the second item.
                    </AccordionItem>
                  </Accordion>
                </div>

                <div>
                  <p className="text-sm text-foreground/60 mb-2">
                    Bordered Variant
                  </p>
                  <Accordion variant="bordered">
                    <AccordionItem key="1" title="Bordered Accordion">
                      This is a bordered variant accordion item.
                    </AccordionItem>
                    <AccordionItem key="2" title="Another Item">
                      Content for the second item.
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Listbox */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Listbox</h3>
        <Card>
          <CardBody>
            <h4 className="font-medium mb-3">Basic Listbox</h4>
            <div className="w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
              <Listbox aria-label="Actions">
                <ListboxItem key="new" startContent={<RiUserLine />}>
                  New file
                </ListboxItem>
                <ListboxItem key="copy" startContent={<RiCropLine />}>
                  Copy link
                </ListboxItem>
                <ListboxItem key="edit" startContent={<RiCodeLine />}>
                  Edit file
                </ListboxItem>
                <ListboxItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<RiImageLine />}
                >
                  Delete file
                </ListboxItem>
              </Listbox>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default LayoutView;
