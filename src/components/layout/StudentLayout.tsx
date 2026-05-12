import React from "react";
import DashboardLayout from "./DashboardLayout";
import { Outlet } from "react-router-dom";

const StudentLayout = () => {
  return (
    <DashboardLayout role="student">
      <Outlet />
    </DashboardLayout>
  );
};

export default StudentLayout;
