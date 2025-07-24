import { Tabs, Tab, Card, CardBody, Avatar, Chip } from "@heroui/react";
import {
  RiHomeLine,
  RiUserLine,
  RiSettingsLine,
  RiNotificationLine,
  RiMusicLine,
  RiFileLine,
  RiCodeLine,
  RiPaletteLine,
} from "react-icons/ri";

function TabView() {
  return (
    <div className="space-y-8">
      {/* Basic Tabs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Tabs</h3>
        <Card>
          <CardBody>
            <Tabs aria-label="Basic tabs">
              <Tab key="home" title="Home">
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Home Content</h4>
                  <p className="text-foreground/80">
                    Welcome to the home tab. This is where you'll find the main
                    content and overview of the application.
                  </p>
                </div>
              </Tab>
              <Tab key="about" title="About">
                <div className="p-4">
                  <h4 className="font-semibold mb-2">About Content</h4>
                  <p className="text-foreground/80">
                    Learn more about our application, its features, and the team
                    behind it.
                  </p>
                </div>
              </Tab>
              <Tab key="contact" title="Contact">
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Contact Content</h4>
                  <p className="text-foreground/80">
                    Get in touch with us through various channels. We'd love to
                    hear from you!
                  </p>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>

      {/* Tab Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tab Variants</h3>
        <div className="space-y-6">
          {/* Solid Variant */}
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Solid Variant</h4>
              <Tabs variant="solid" aria-label="Solid tabs">
                <Tab key="photos" title="Photos">
                  <div className="p-4">Photos content goes here</div>
                </Tab>
                <Tab key="music" title="Music">
                  <div className="p-4">Music content goes here</div>
                </Tab>
                <Tab key="videos" title="Videos">
                  <div className="p-4">Videos content goes here</div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>

          {/* Underlined Variant */}
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Underlined Variant</h4>
              <Tabs variant="underlined" aria-label="Underlined tabs">
                <Tab key="dashboard" title="Dashboard">
                  <div className="p-4">Dashboard content goes here</div>
                </Tab>
                <Tab key="analytics" title="Analytics">
                  <div className="p-4">Analytics content goes here</div>
                </Tab>
                <Tab key="reports" title="Reports">
                  <div className="p-4">Reports content goes here</div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>

          {/* Bordered Variant */}
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Bordered Variant</h4>
              <Tabs variant="bordered" aria-label="Bordered tabs">
                <Tab key="profile" title="Profile">
                  <div className="p-4">Profile content goes here</div>
                </Tab>
                <Tab key="settings" title="Settings">
                  <div className="p-4">Settings content goes here</div>
                </Tab>
                <Tab key="security" title="Security">
                  <div className="p-4">Security content goes here</div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>

          {/* Light Variant */}
          <Card>
            <CardBody>
              <h4 className="font-medium mb-3">Light Variant</h4>
              <Tabs variant="light" aria-label="Light tabs">
                <Tab key="general" title="General">
                  <div className="p-4">General content goes here</div>
                </Tab>
                <Tab key="advanced" title="Advanced">
                  <div className="p-4">Advanced content goes here</div>
                </Tab>
                <Tab key="developer" title="Developer">
                  <div className="p-4">Developer content goes here</div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Tabs with Icons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tabs with Icons</h3>
        <Card>
          <CardBody>
            <Tabs variant="bordered" aria-label="Tabs with icons">
              <Tab
                key="home"
                title={
                  <div className="flex items-center space-x-2">
                    <RiHomeLine />
                    <span>Home</span>
                  </div>
                }
              >
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Home Dashboard</h4>
                  <p className="text-foreground/80">
                    Your main dashboard with quick access to all features.
                  </p>
                </div>
              </Tab>
              <Tab
                key="profile"
                title={
                  <div className="flex items-center space-x-2">
                    <RiUserLine />
                    <span>Profile</span>
                  </div>
                }
              >
                <div className="p-4">
                  <h4 className="font-semibold mb-2">User Profile</h4>
                  <p className="text-foreground/80">
                    Manage your personal information and preferences.
                  </p>
                </div>
              </Tab>
              <Tab
                key="settings"
                title={
                  <div className="flex items-center space-x-2">
                    <RiSettingsLine />
                    <span>Settings</span>
                  </div>
                }
              >
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Application Settings</h4>
                  <p className="text-foreground/80">
                    Configure application behavior and appearance.
                  </p>
                </div>
              </Tab>
              <Tab
                key="notifications"
                title={
                  <div className="flex items-center space-x-2">
                    <RiNotificationLine />
                    <span>Notifications</span>
                  </div>
                }
              >
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Notification Center</h4>
                  <p className="text-foreground/80">
                    Manage your notification preferences and history.
                  </p>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>

      {/* Vertical Tabs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Vertical Tabs</h3>
        <Card>
          <CardBody>
            <Tabs
              isVertical
              variant="bordered"
              aria-label="Vertical tabs"
              className="h-[300px]"
            >
              <Tab
                key="media"
                title={
                  <div className="flex items-center space-x-2">
                    <RiMusicLine />
                    <span>Media</span>
                  </div>
                }
              >
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Media Library</h4>
                  <p className="text-foreground/80">
                    Manage your photos, videos, and audio files.
                  </p>
                </div>
              </Tab>
              <Tab
                key="documents"
                title={
                  <div className="flex items-center space-x-2">
                    <RiFileLine />
                    <span>Documents</span>
                  </div>
                }
              >
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Document Manager</h4>
                  <p className="text-foreground/80">
                    Organize and access your important documents.
                  </p>
                </div>
              </Tab>
              <Tab
                key="code"
                title={
                  <div className="flex items-center space-x-2">
                    <RiCodeLine />
                    <span>Code</span>
                  </div>
                }
              >
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Code Editor</h4>
                  <p className="text-foreground/80">
                    Write and edit your code with syntax highlighting.
                  </p>
                </div>
              </Tab>
              <Tab
                key="design"
                title={
                  <div className="flex items-center space-x-2">
                    <RiPaletteLine />
                    <span>Design</span>
                  </div>
                }
              >
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Design Tools</h4>
                  <p className="text-foreground/80">
                    Create and edit designs with our built-in tools.
                  </p>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>

      {/* Tab Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tab Colors</h3>
        <div className="space-y-4">
          {[
            { color: "primary", label: "Primary" },
            { color: "secondary", label: "Secondary" },
            { color: "success", label: "Success" },
            { color: "warning", label: "Warning" },
            { color: "danger", label: "Danger" },
          ].map(({ color, label }) => (
            <Card key={color}>
              <CardBody>
                <h4 className="font-medium mb-3">{label} Color</h4>
                <Tabs color={color as any} variant="underlined">
                  <Tab key="tab1" title="Tab 1">
                    <div className="p-4">Content for {label} tab 1</div>
                  </Tab>
                  <Tab key="tab2" title="Tab 2">
                    <div className="p-4">Content for {label} tab 2</div>
                  </Tab>
                  <Tab key="tab3" title="Tab 3">
                    <div className="p-4">Content for {label} tab 3</div>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Complex Tab Content */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Complex Tab Content</h3>
        <Card>
          <CardBody>
            <Tabs variant="bordered" aria-label="Complex content tabs">
              <Tab key="team" title="Team">
                <div className="p-4 space-y-4">
                  <h4 className="font-semibold">Team Members</h4>
                  <div className="space-y-3">
                    {[
                      {
                        name: "John Doe",
                        role: "Frontend Developer",
                        avatar: "avatar-1.png",
                      },
                      {
                        name: "Jane Smith",
                        role: "Backend Developer",
                        avatar: "avatar-2.png",
                      },
                      {
                        name: "Mike Johnson",
                        role: "UI/UX Designer",
                        avatar: "avatar-3.png",
                      },
                    ].map((member, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Avatar
                          src={`https://nextui.org/avatars/${member.avatar}`}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-small text-foreground/60">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab>
              <Tab key="projects" title="Projects">
                <div className="p-4 space-y-4">
                  <h4 className="font-semibold">Active Projects</h4>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Website Redesign",
                        status: "In Progress",
                        priority: "High",
                      },
                      {
                        name: "Mobile App",
                        status: "Planning",
                        priority: "Medium",
                      },
                      {
                        name: "API Integration",
                        status: "Completed",
                        priority: "Low",
                      },
                    ].map((project, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-small text-foreground/60">
                            {project.status}
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          color={
                            project.priority === "High"
                              ? "danger"
                              : project.priority === "Medium"
                                ? "warning"
                                : "success"
                          }
                          variant="flat"
                        >
                          {project.priority}
                        </Chip>
                      </div>
                    ))}
                  </div>
                </div>
              </Tab>
              <Tab key="analytics" title="Analytics">
                <div className="p-4 space-y-4">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">1,234</p>
                      <p className="text-small text-foreground/60">
                        Total Users
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">98.5%</p>
                      <p className="text-small text-foreground/60">Uptime</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-warning">456</p>
                      <p className="text-small text-foreground/60">
                        Active Sessions
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-secondary">78</p>
                      <p className="text-small text-foreground/60">
                        New Signups
                      </p>
                    </div>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default TabView;
