import { ConfigProvider, App as AntdApp } from "antd";
import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "@/constants/paths";
import Login from "./pages/Login";
import Layout from "./components/Layout/Layout";
import AiComposer from "./pages/AiComposer/AiComposer";
import Dashboard from "./pages/Dashboard/Dashboard";
import Scheduler from "./pages/Scheduler/Scheduler";
import Account from "./pages/Account/Account";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Montserrat', sans-serif",
          colorPrimary: "#dc2626", // Vibrant Red to make the difference obvious
          borderRadius: 10,
        },
      }}
    >
      <AntdApp>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={ROUTES.DASHBOARD} replace />}
          />
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<Account />} />
            <Route path="/ai-composer" element={<AiComposer />} />
            <Route path="/scheduler" element={<Scheduler />} />
          </Route>
        </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}
