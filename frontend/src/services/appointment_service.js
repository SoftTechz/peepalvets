import api from "@/config/axios";

// Create appointment
export const createAppointment = async (payload) => {
  const res = await api.post("/appointments", payload);
  return res.data;
};

// Get appointments
export const getAllAppointments = async (params = {}) => {
  const res = await api.get("/appointments", { params });
  return res.data;
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId) => {
  const res = await api.get(`/appointments/${appointmentId}`);
  return res.data;
};

// Update appointment
export const updateAppointment = async (appointmentId, payload) => {
  const res = await api.put(`/appointments/${appointmentId}`, payload);
  return res.data;
};

// Delete appointment
export const deleteAppointment = async (appointmentId) => {
  const res = await api.delete(`/appointments/${appointmentId}`);
  return res.data;
};

// Change only status
// export const updateAppointmentStatus = async (appointmentId, status) => {
//   const res = await api.patch(`/appointments/${appointmentId}/status`, null, {
//     params: { status },
//   });
//   return res.data;
// };

export const getAppointmentPDF = async (appointmentId) => {
  const res = await api.get(`/appointments/${appointmentId}/pdf`, {
    responseType: "blob",
  });
  return res.data;
};
