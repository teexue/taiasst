import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/home";

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
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default AsyncRouter;
