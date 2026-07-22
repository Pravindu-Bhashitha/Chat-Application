import { lazy, Suspense } from "react";
import { BrowserRouter as AppRouter, Navigate, Route, Routes } from "react-router-dom";


const Register = lazy(() => import("../pages/Auth/Register"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));

const Router = () => {
  return (
    <AppRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </AppRouter>
  )
}

export default Router;