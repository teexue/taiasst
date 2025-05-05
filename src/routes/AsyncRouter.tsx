import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router";
import MainLayout from "@/layout/MainLayout";
import Home from "@/pages/home";
import Tool from "@/pages/tool";
import ToolDetail from "@/pages/tool/detail";
import NotFound from "@/pages/404";
import Settings from "@/pages/settings";
import Plugins from "@/pages/plugins";
import AiApp from "@/pages/ai";

// 将路由实例移至组件外，防止每次渲染时重建
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
