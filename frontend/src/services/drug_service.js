import api from "@/config/axios";

// Create drug
export const createDrug = async (payload) => {
  const res = await api.post("/drugs", payload);
  return res.data;
};

// Get all drugs
export const getAllDrugs = async () => {
  const res = await api.get("/drugs");
  return res.data;
};

// Get drug by ID
export const getDrugById = async (drugId) => {
  const res = await api.get(`/drugs/${drugId}`);
  return res.data;
};

// Add stock/history entry to drug
export const updateDrug = async (drugId, payload) => {
  const res = await api.post(`/drugs/${drugId}/entries`, payload);
  return res.data;
};

// Update drug name
export const updateDrugName = async (drugId, name) => {
  const res = await api.put(`/drugs/${drugId}/name`, { name });
  return res.data;
};

// Delete one history entry
export const deleteDrugHistoryEntry = async (drugId, entryId) => {
  const res = await api.delete(`/drugs/${drugId}/entries/${entryId}`);
  return res.data;
};

// Delete drug
export const deleteDrug = async (drugId) => {
  const res = await api.delete(`/drugs/${drugId}`);
  return res.data;
};

// Save a prescription template
export const createDrugTemplate = async (payload) => {
  const res = await api.post("/drugs/manage/templates", payload);
  return res.data;
};

// Get all prescription templates
export const getAllDrugTemplates = async () => {
  const res = await api.get("/drugs/manage/templates");
  return res.data;
};

// Get one prescription template
export const getDrugTemplateById = async (templateId) => {
  const res = await api.get(`/drugs/manage/templates/${templateId}`);
  return res.data;
};

// Delete a prescription template
export const deleteDrugTemplate = async (templateId) => {
  const res = await api.delete(`/drugs/manage/templates/${templateId}`);
  return res.data;
};
