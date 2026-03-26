import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
// import ListInvoices from "../pages/invoices/ListInvoices";
// import AddInvoice from "../pages/invoices/AddInvoice";
// import UpdateInvoice from "../pages/invoices/UpdateInvoice";
import ListCustomers from "../pages/customers/ListCustomers";
import AddCustomer from "../pages/customers/AddCustomer";
import UpdateCustomer from "../pages/customers/UpdateCustomer";
import ListDrug from "../pages/drugs/ListDrug";
import AddDrug from "../pages/drugs/AddDrug";
import UpdateDrug from "../pages/drugs/UpdateDrug";
import ListAppointments from "../pages/appointments/ListAppointments";
import AddAppointment from "../pages/appointments/AddAppointment";
import UpdateAppointment from "../pages/appointments/UpdateAppointment";
import UserManagement from "../pages/user/UserManagement";
// import ListItems from "../pages/items/ListItems";
// import AddItem from "../pages/items/AddItem";
// import UpdateItem from "../pages/items/UpdateItem";

function LogoutRedirect() {
  useEffect(() => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
  }, []);

  return <Navigate to="/" replace />;
}

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/logout" element={<LogoutRedirect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<ListCustomers />} />
        <Route path="/customers/add" element={<AddCustomer />} />
        <Route path="/customers/:customerId" element={<UpdateCustomer />} />
        <Route path="/drugs" element={<ListDrug />} />
        <Route path="/drugs/add" element={<AddDrug />} />
        <Route path="/drugs/:drugId" element={<UpdateDrug />} />
        <Route path="/appointments" element={<ListAppointments />} />
        <Route path="/appointments/add" element={<AddAppointment />} />
        <Route
          path="/appointments/:appointmentId"
          element={<UpdateAppointment />}
        />
        <Route path="/user-management" element={<UserManagement />} />
      </Routes>
    </HashRouter>
  );
}
