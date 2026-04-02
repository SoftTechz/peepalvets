import api from "@/config/axios";

// Create customer
export const createCustomer = async (payload) => {
  const res = await api.post("/customers/", payload);
  console.log("Create Customer Response:", res.data);
  return res.data;
};

// Update customer
export const updateCustomer = async (customerId, payload) => {
  const res = await api.put(`/customers/${customerId}`, payload);
  console.log("Update Customer Response:", res.data);
  return res.data;
};

// Delete customer (soft delete)
export const deleteCustomer = async (customerId) => {
  const res = await api.delete(`/customers/${customerId}`);
  return res.data;
};

// Get all customers with pagination and optional server-side search
export const getAllCustomers = async (params = {}) => {
  const res = await api.get("/customers/", { params });
  return res.data;
};

// Get customer by ID
export const getCustomerById = async (customerId) => {
  const res = await api.get(`/customers/${customerId}`);
  return res.data;
};
