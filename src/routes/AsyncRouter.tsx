import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router";

// 页面组件
import MainLayout from "@/layout/MainLayout";
import Home from "@/pages/home";
import Tool from "@/pages/tool";
import ToolDetail from "@/pages/tool/detail";
import NotFound from "@/pages/404";
import Settings from "@/pages/settings";
import Plugins from "@/pages/plugins";
import AiApp from "@/pages/ai";
import PasswordManager from "@/pages/passwords";
import WorkflowCenter from "@/pages/workflow";
import ComponentsView from "@/pages/components_view";

// 简化的路由配置，移除认证相关功能
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/tool",
        element: <Tool />,
      },
      {
        path: "/tool/detail/:id",
        element: <ToolDetail />,
      },
      {
        path: "/ai",
        element: <AiApp />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/plugins",
        element: <Plugins />,
      },
      {
        path: "/passwords",
        element: <PasswordManager />,
      },
      {
        path: "/workflow",
        element: <WorkflowCenter />,
      },
      {
        path: "/components",
        element: <ComponentsView />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function AsyncRouter() {
  return <RouterProvider router={router} />;
}

export default AsyncRouter;
