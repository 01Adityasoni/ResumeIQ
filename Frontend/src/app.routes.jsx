import { createBrowserRouter } from "react-router-dom";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";
import Protected from "./features/auth/components/protected";





export const router = createBrowserRouter([
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/",
        element: <Protected><h1>Home Page</h1></Protected>
    }

])