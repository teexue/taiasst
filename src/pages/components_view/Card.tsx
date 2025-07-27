import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Image,
  Chip,
  Avatar,
  Divider,
} from "@heroui/react";
import {
  RiHeartLine,
  RiShareLine,
  RiBookmarkLine,
  RiStarFill,
  RiMapPinLine,
  RiCalendarLine,
  RiUserLine,
} from "react-icons/ri";

function CardView() {
  return (
    <div className="space-y-6">
      {/* Basic Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <h4 className="font-semibold">Simple Card</h4>
            </CardHeader>
            <CardBody>
              <p className="text-small text-foreground/80">
                This is a simple card with basic content.
              </p>
            </CardBody>
          </Card>

          <Card shadow="sm">
            <CardHeader>
              <h4 className="font-semibold">Small Shadow</h4>
            </CardHeader>
            <CardBody>
              <p className="text-small text-foreground/80">
                Card with small shadow effect.
              </p>
            </CardBody>
          </Card>

          <Card shadow="lg">
            <CardHeader>
              <h4 className="font-semibold">Large Shadow</h4>
            </CardHeader>
            <CardBody>
              <p className="text-small text-foreground/80">
                Card with large shadow effect.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Card Styles */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Card Styles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-content1">
            <CardHeader>
              <h4 className="font-semibold">Default Card</h4>
            </CardHeader>
            <CardBody>
              <p className="text-small text-foreground/80">
                Default card with standard background.
              </p>
            </CardBody>
          </Card>

          <Card className="border-2 border-default-200">
            <CardHeader>
              <h4 className="font-semibold">Bordered Card</h4>
            </CardHeader>
            <CardBody>
              <p className="text-small text-foreground/80">
                Card with custom border styling.
              </p>
            </CardBody>
          </Card>

          <Card shadow="lg">
            <CardHeader>
              <h4 className="font-semibold">Shadow Card</h4>
            </CardHeader>
            <CardBody>
              <p className="text-small text-foreground/80">
                Card with large shadow effect.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
            <CardHeader>
              <h4 className="font-semibold">Gradient Card</h4>
            </CardHeader>
            <CardBody>
              <p className="text-small text-foreground/80">
                Card with gradient background.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Interactive Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Interactive Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card isPressable onPress={() => console.log("Card pressed")}>
            <CardHeader>
              <h4 className="font-semibold">Pressable Card</h4>
            </CardHeader>
            <CardBody>
              <p className="text-small text-foreground/80">
                Click me! This card responds to press events.
              </p>
            </CardBody>
          </Card>

          <Card isHoverable>
            <CardHeader>
              <h4 className="font-semibold">Hoverable Card</h4>
            </CardHeader>
            <CardBody>
              <p className="text-small text-foreground/80">
                Hover over me to see the effect!
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Product Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Product Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="max-w-[400px]">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <p className="text-tiny uppercase font-bold">Daily Mix</p>
              <small className="text-default-500">12 Tracks</small>
              <h4 className="font-bold text-large">Frontend Radio</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
              <Image
                alt="Card background"
                className="object-cover rounded-xl"
                src="https://nextui.org/images/hero-card-complete.jpeg"
                width={270}
              />
            </CardBody>
          </Card>

          <Card className="max-w-[400px]">
            <CardHeader className="justify-between">
              <div className="flex gap-5">
                <Avatar
                  isBordered
                  radius="full"
                  size="md"
                  src="https://nextui.org/avatars/avatar-1.png"
                />
                <div className="flex flex-col gap-1 items-start justify-center">
                  <h4 className="text-small font-semibold leading-none text-default-600">
                    Zoey Lang
                  </h4>
                  <h5 className="text-small tracking-tight text-default-400">
                    @zoeylang
                  </h5>
                </div>
              </div>
              <Button
                className="bg-transparent text-foreground border-default-200"
                color="primary"
                radius="full"
                size="sm"
                variant="bordered"
              >
                Follow
              </Button>
            </CardHeader>
            <CardBody className="px-3 py-0 text-small text-default-400">
              <p>
                Frontend developer and UI/UX enthusiast. Join me on this coding
                adventure!
              </p>
              <span className="pt-2">
                #FrontendWithZoey
                <span className="py-2" aria-label="computer" role="img">
                  💻
                </span>
              </span>
            </CardBody>
            <CardFooter className="gap-3">
              <div className="flex gap-1">
                <p className="font-semibold text-default-400 text-small">4</p>
                <p className="text-default-400 text-small">Following</p>
              </div>
              <div className="flex gap-1">
                <p className="font-semibold text-default-400 text-small">
                  97.1K
                </p>
                <p className="text-default-400 text-small">Followers</p>
              </div>
            </CardFooter>
          </Card>

          <Card className="max-w-[400px]">
            <CardHeader className="pb-0 pt-2 px-4">
              <div className="flex justify-between items-start w-full">
                <div>
                  <p className="text-tiny uppercase font-bold">New</p>
                  <h4 className="font-bold text-large">Acme Camera</h4>
                </div>
                <Chip color="success" variant="flat" size="sm">
                  In Stock
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
              <Image
                alt="Camera"
                className="object-cover rounded-xl"
                src="https://nextui.org/images/hero-card.jpeg"
                width={270}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                  <RiStarFill className="text-warning" />
                  <span className="text-small">4.8</span>
                  <span className="text-tiny text-default-400">(128)</span>
                </div>
                <p className="text-large font-bold">$299.99</p>
              </div>
            </CardBody>
            <CardFooter className="pt-0">
              <Button color="primary" className="w-full">
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Event Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Event Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="max-w-[400px]">
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <p className="text-md">Tech Conference 2024</p>
                <p className="text-small text-default-500">
                  Annual Developer Event
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RiCalendarLine className="text-default-400" />
                  <span className="text-small">March 15-17, 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <RiMapPinLine className="text-default-400" />
                  <span className="text-small">San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2">
                  <RiUserLine className="text-default-400" />
                  <span className="text-small">1,200+ Attendees</span>
                </div>
              </div>
            </CardBody>
            <Divider />
            <CardFooter>
              <div className="flex gap-2 w-full">
                <Button color="primary" variant="flat" className="flex-1">
                  Learn More
                </Button>
                <Button color="primary" className="flex-1">
                  Register
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="max-w-[400px]">
            <CardHeader className="flex gap-3">
              <Avatar src="https://nextui.org/avatars/avatar-2.png" size="md" />
              <div className="flex flex-col">
                <p className="text-md">Workshop: React Hooks</p>
                <p className="text-small text-default-500">by Sarah Johnson</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <p className="text-small text-default-600">
                Learn advanced React Hooks patterns and best practices in this
                hands-on workshop. Perfect for intermediate developers.
              </p>
              <div className="flex gap-2 mt-3">
                <Chip size="sm" variant="flat" color="primary">
                  React
                </Chip>
                <Chip size="sm" variant="flat" color="secondary">
                  Hooks
                </Chip>
                <Chip size="sm" variant="flat" color="success">
                  Workshop
                </Chip>
              </div>
            </CardBody>
            <Divider />
            <CardFooter>
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-2">
                  <Button isIconOnly variant="light" size="sm">
                    <RiHeartLine />
                  </Button>
                  <Button isIconOnly variant="light" size="sm">
                    <RiShareLine />
                  </Button>
                  <Button isIconOnly variant="light" size="sm">
                    <RiBookmarkLine />
                  </Button>
                </div>
                <Button color="primary" size="sm">
                  Join Workshop
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Blurred Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Blurred Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            isBlurred
            className="border-none bg-background/60 dark:bg-default-100/50"
          >
            <CardHeader>
              <h4 className="font-semibold">Blurred Background</h4>
            </CardHeader>
            <CardBody>
              <p className="text-small text-foreground/80">
                This card has a blurred background effect for a modern look.
              </p>
            </CardBody>
          </Card>

          <Card
            isBlurred
            className="border-none bg-background/60 dark:bg-default-100/50"
            shadow="sm"
          >
            <CardHeader>
              <h4 className="font-semibold">Blurred with Shadow</h4>
            </CardHeader>
            <CardBody>
              <p className="text-small text-foreground/80">
                Combining blur effect with shadow for enhanced depth.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CardView;
