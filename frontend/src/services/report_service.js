import api from "@/config/axios";

export const getAppointmentsReport = async (params = {}) => {
  const res = await api.get("/reports/appointments", { params });
  return res.data;
};

export const exportAppointmentsReportExcel = async (params = {}) => {
  const res = await api.get("/reports/appointments/export/excel", {
    params,
    responseType: "blob",
  });
  return res.data;
};

export const exportAppointmentsReportPdf = async (params = {}) => {
  const res = await api.get("/reports/appointments/export/pdf", {
    params,
    responseType: "blob",
  });
  return res.data;
};
