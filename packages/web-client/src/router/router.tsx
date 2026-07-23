import { lazy, Suspense } from "react";
import { BrowserRouter as AppRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./protectedRoute";


const Register = lazy(() => import("../pages/Auth/Register"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const ErrorPage = lazy(() => import("../components/ErrorPage/ErrorPage"));
const Loading = lazy(() => import("../components/Loading/Loading"));

const Router = () => {
  return (
    <AppRouter>
      <Suspense fallback={<div><Loading fullScreen={true} /></div>}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="*"
            element={
              <ErrorPage
                title="404 - Page Not Found"
                message="The page you are looking for does not exist."
              />
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </AppRouter>
  )
}

export default Router;