import {
  Card,
  CardBody,
  Chip,
  Progress,
  CircularProgress,
  Spinner,
  Skeleton,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Avatar,
  Divider,
} from "@heroui/react";
import {
  RiInformationLine,
  RiCheckLine,
  RiAlertLine,
  RiCloseLine,
  RiStarFill,
} from "react-icons/ri";

function FeedbackView() {
  return (
    <div className="space-y-6">
      {/* Chips */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Chips</h3>
        <div className="space-y-4">
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Basic Chips</h4>
              <div className="flex flex-wrap gap-2">
                <Chip>Default</Chip>
                <Chip color="primary">Primary</Chip>
                <Chip color="secondary">Secondary</Chip>
                <Chip color="success">Success</Chip>
                <Chip color="warning">Warning</Chip>
                <Chip color="danger">Danger</Chip>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Chip Variants</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-foreground/60 mb-2">Solid</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="solid" color="primary">
                      Solid
                    </Chip>
                    <Chip variant="solid" color="secondary">
                      Solid
                    </Chip>
                    <Chip variant="solid" color="success">
                      Solid
                    </Chip>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 mb-2">Bordered</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="bordered" color="primary">
                      Bordered
                    </Chip>
                    <Chip variant="bordered" color="secondary">
                      Bordered
                    </Chip>
                    <Chip variant="bordered" color="success">
                      Bordered
                    </Chip>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 mb-2">Light</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="light" color="primary">
                      Light
                    </Chip>
                    <Chip variant="light" color="secondary">
                      Light
                    </Chip>
                    <Chip variant="light" color="success">
                      Light
                    </Chip>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 mb-2">Flat</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="flat" color="primary">
                      Flat
                    </Chip>
                    <Chip variant="flat" color="secondary">
                      Flat
                    </Chip>
                    <Chip variant="flat" color="success">
                      Flat
                    </Chip>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 mb-2">Faded</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="faded" color="primary">
                      Faded
                    </Chip>
                    <Chip variant="faded" color="secondary">
                      Faded
                    </Chip>
                    <Chip variant="faded" color="success">
                      Faded
                    </Chip>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 mb-2">Shadow</p>
                  <div className="flex flex-wrap gap-2">
                    <Chip variant="shadow" color="primary">
                      Shadow
                    </Chip>
                    <Chip variant="shadow" color="secondary">
                      Shadow
                    </Chip>
                    <Chip variant="shadow" color="success">
                      Shadow
                    </Chip>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Chips with Icons</h4>
              <div className="flex flex-wrap gap-2">
                <Chip
                  startContent={<RiCheckLine />}
                  color="success"
                  variant="flat"
                >
                  Completed
                </Chip>
                <Chip
                  startContent={<RiAlertLine />}
                  color="warning"
                  variant="flat"
                >
                  Warning
                </Chip>
                <Chip
                  startContent={<RiCloseLine />}
                  color="danger"
                  variant="flat"
                >
                  Error
                </Chip>
                <Chip
                  startContent={<RiInformationLine />}
                  color="primary"
                  variant="flat"
                >
                  Info
                </Chip>
                <Chip
                  startContent={<RiStarFill />}
                  color="warning"
                  variant="flat"
                >
                  Featured
                </Chip>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Closeable Chips</h4>
              <div className="flex flex-wrap gap-2">
                <Chip onClose={() => console.log("close")} variant="flat">
                  Closeable
                </Chip>
                <Chip
                  onClose={() => console.log("close")}
                  color="primary"
                  variant="flat"
                >
                  Primary
                </Chip>
                <Chip
                  onClose={() => console.log("close")}
                  color="success"
                  variant="flat"
                >
                  Success
                </Chip>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Chip Sizes</h4>
              <div className="flex flex-wrap items-center gap-2">
                <Chip size="sm" color="primary">
                  Small
                </Chip>
                <Chip size="md" color="primary">
                  Medium
                </Chip>
                <Chip size="lg" color="primary">
                  Large
                </Chip>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Progress */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Progress</h3>
        <div className="space-y-4">
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Linear Progress</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2">Default Progress</p>
                  <Progress
                    value={65}
                    className="max-w-md"
                    aria-label="默认进度条 65%"
                  />
                </div>
                <div>
                  <p className="text-sm mb-2">With Label</p>
                  <Progress
                    label="Loading..."
                    value={65}
                    className="max-w-md"
                  />
                </div>
                <div>
                  <p className="text-sm mb-2">With Value Label</p>
                  <Progress
                    label="Loading..."
                    value={65}
                    showValueLabel={true}
                    className="max-w-md"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Progress Colors</h4>
              <div className="space-y-3">
                <Progress
                  value={60}
                  color="primary"
                  className="max-w-md"
                  aria-label="主色进度条 60%"
                />
                <Progress
                  value={70}
                  color="secondary"
                  className="max-w-md"
                  aria-label="次色进度条 70%"
                />
                <Progress
                  value={80}
                  color="success"
                  className="max-w-md"
                  aria-label="成功色进度条 80%"
                />
                <Progress
                  value={50}
                  color="warning"
                  className="max-w-md"
                  aria-label="警告色进度条 50%"
                />
                <Progress
                  value={40}
                  color="danger"
                  className="max-w-md"
                  aria-label="危险色进度条 40%"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Progress Sizes</h4>
              <div className="space-y-3">
                <Progress
                  value={65}
                  size="sm"
                  className="max-w-md"
                  aria-label="小尺寸进度条 65%"
                />
                <Progress
                  value={65}
                  size="md"
                  className="max-w-md"
                  aria-label="中尺寸进度条 65%"
                />
                <Progress
                  value={65}
                  size="lg"
                  className="max-w-md"
                  aria-label="大尺寸进度条 65%"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Indeterminate Progress</h4>
              <Progress
                size="sm"
                isIndeterminate
                aria-label="Loading..."
                className="max-w-md"
              />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Circular Progress */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Circular Progress</h3>
        <div className="space-y-4">
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Basic Circular Progress</h4>
              <div className="flex gap-4">
                <CircularProgress value={70} aria-label="圆形进度条 70%" />
                <CircularProgress
                  value={70}
                  showValueLabel={true}
                  aria-label="带标签圆形进度条 70%"
                />
                <CircularProgress
                  value={70}
                  color="success"
                  showValueLabel={true}
                  aria-label="成功色圆形进度条 70%"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Circular Progress Colors</h4>
              <div className="flex gap-4">
                <CircularProgress value={60} color="primary" />
                <CircularProgress value={70} color="secondary" />
                <CircularProgress value={80} color="success" />
                <CircularProgress value={50} color="warning" />
                <CircularProgress value={40} color="danger" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Circular Progress Sizes</h4>
              <div className="flex items-center gap-4">
                <CircularProgress value={65} size="sm" />
                <CircularProgress value={65} size="md" />
                <CircularProgress value={65} size="lg" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">
                Indeterminate Circular Progress
              </h4>
              <CircularProgress aria-label="Loading..." color="primary" />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Spinner */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Spinner</h3>
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Spinner Colors</h4>
                <div className="flex gap-4">
                  <Spinner />
                  <Spinner color="primary" />
                  <Spinner color="secondary" />
                  <Spinner color="success" />
                  <Spinner color="warning" />
                  <Spinner color="danger" />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Spinner Sizes</h4>
                <div className="flex items-center gap-4">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Spinner with Label</h4>
                <Spinner label="Loading..." />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Skeleton */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Skeleton</h3>
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Basic Skeleton</h4>
                <div className="space-y-3">
                  <Skeleton className="rounded-lg">
                    <div className="h-3 rounded-lg bg-default-200"></div>
                  </Skeleton>
                  <Skeleton className="w-4/5 rounded-lg">
                    <div className="h-3 rounded-lg bg-default-200"></div>
                  </Skeleton>
                  <Skeleton className="w-2/5 rounded-lg">
                    <div className="h-3 rounded-lg bg-default-300"></div>
                  </Skeleton>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Card Skeleton</h4>
                <Card className="w-[200px] space-y-5 p-4" radius="lg">
                  <Skeleton className="rounded-lg">
                    <div className="h-24 rounded-lg bg-default-300"></div>
                  </Skeleton>
                  <div className="space-y-3">
                    <Skeleton className="w-3/5 rounded-lg">
                      <div className="h-3 rounded-lg bg-default-200"></div>
                    </Skeleton>
                    <Skeleton className="w-4/5 rounded-lg">
                      <div className="h-3 rounded-lg bg-default-200"></div>
                    </Skeleton>
                    <Skeleton className="w-2/5 rounded-lg">
                      <div className="h-3 rounded-lg bg-default-300"></div>
                    </Skeleton>
                  </div>
                </Card>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tooltip */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tooltip</h3>
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Basic Tooltips</h4>
                <div className="flex gap-4">
                  <Tooltip content="I am a tooltip">
                    <Button variant="flat">Hover me</Button>
                  </Tooltip>
                  <Tooltip content="Tooltip with arrow" showArrow={true}>
                    <Button variant="flat">With Arrow</Button>
                  </Tooltip>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Tooltip Colors</h4>
                <div className="flex gap-2">
                  <Tooltip content="Primary tooltip" color="primary">
                    <Button size="sm">Primary</Button>
                  </Tooltip>
                  <Tooltip content="Secondary tooltip" color="secondary">
                    <Button size="sm">Secondary</Button>
                  </Tooltip>
                  <Tooltip content="Success tooltip" color="success">
                    <Button size="sm">Success</Button>
                  </Tooltip>
                  <Tooltip content="Warning tooltip" color="warning">
                    <Button size="sm">Warning</Button>
                  </Tooltip>
                  <Tooltip content="Danger tooltip" color="danger">
                    <Button size="sm">Danger</Button>
                  </Tooltip>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Tooltip Placements</h4>
                <div className="flex gap-2">
                  <Tooltip content="Top tooltip" placement="top">
                    <Button size="sm">Top</Button>
                  </Tooltip>
                  <Tooltip content="Bottom tooltip" placement="bottom">
                    <Button size="sm">Bottom</Button>
                  </Tooltip>
                  <Tooltip content="Left tooltip" placement="left">
                    <Button size="sm">Left</Button>
                  </Tooltip>
                  <Tooltip content="Right tooltip" placement="right">
                    <Button size="sm">Right</Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Popover */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Popover</h3>
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Basic Popover</h4>
                <Popover placement="bottom" showArrow={true}>
                  <PopoverTrigger>
                    <Button>Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="px-1 py-2">
                      <div className="text-small font-bold">
                        Popover Content
                      </div>
                      <div className="text-tiny">
                        This is the popover content
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <h4 className="font-medium mb-3">Rich Popover Content</h4>
                <Popover placement="bottom" showArrow={true}>
                  <PopoverTrigger>
                    <Button>User Info</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="px-1 py-2 w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar
                          src="https://nextui.org/avatars/avatar-1.png"
                          size="sm"
                        />
                        <div>
                          <div className="text-small font-bold">John Doe</div>
                          <div className="text-tiny text-default-500">
                            @johndoe
                          </div>
                        </div>
                      </div>
                      <Divider className="my-2" />
                      <div className="text-tiny">
                        Software Engineer at Acme Corp. Passionate about
                        creating amazing user experiences.
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default FeedbackView;
