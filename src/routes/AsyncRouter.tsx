import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router";
import MainLayout from "@/layout/MainLayout";
import Home from "@/pages/home";
import Tool from "@/pages/tool";
import ToolDetail from "@/pages/tool/ToolDetail";
import NotFound from "@/pages/404";
import Settings from "@/pages/settings";

function AsyncRouter() {
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
          path: "/tool/:path",
          element: <ToolDetail />,
        },
        {
          path: "/settings",
          element: <Settings />,
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default AsyncRouter;
