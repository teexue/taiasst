import ButtonView from "./Button";
import InputView from "./Input";
import CardView from "./Card";
import TabView from "./Tab";
import ModalView from "./Modal";
import TableView from "./Table";
import FormView from "./Form";
import NavigationView from "./Navigation";
import FeedbackView from "./Feedback";
import LayoutView from "./Layout";
import { Tab, Tabs, Card, CardBody, Button } from "@heroui/react";
import { useTheme } from "@heroui/use-theme";
import { RiPaletteLine } from "react-icons/ri";

const tabs = [
  { key: "button", title: "Button", component: ButtonView },
  { key: "input", title: "Input", component: InputView },
  { key: "card", title: "Card", component: CardView },
  { key: "tab", title: "Tab", component: TabView },
  { key: "modal", title: "Modal", component: ModalView },
  { key: "table", title: "Table", component: TableView },
  { key: "form", title: "Form", component: FormView },
  { key: "navigation", title: "Navigation", component: NavigationView },
  { key: "feedback", title: "Feedback", component: FeedbackView },
  { key: "layout", title: "Layout", component: LayoutView },
];

const themes = [
  "light",
  "dark",
  "purple",
  "darkPurple",
  "blue",
  "darkBlue",
  "green",
  "darkGreen",
  "pink",
  "orange",
  "red",
];

function ComponentsView() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      {/* Theme Switcher */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-3 mb-4">
            <RiPaletteLine className="text-primary text-xl" />
            <h2 className="text-lg font-semibold">Theme Switcher</h2>
            <span className="text-sm text-foreground/70">Current: {theme}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {themes.map((themeName) => (
              <Button
                key={themeName}
                size="sm"
                variant={theme === themeName ? "solid" : "bordered"}
                color="primary"
                onPress={() => setTheme(themeName)}
              >
                {themeName}
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Component Tabs */}
      <Tabs
        variant="underlined"
        color="primary"
        className="flex flex-col gap-4"
      >
        {tabs.map((tab) => {
          const Component = tab.component;
          return (
            <Tab key={tab.key} title={tab.title}>
              <Component />
            </Tab>
          );
        })}
      </Tabs>
    </div>
  );
}

export default ComponentsView;
