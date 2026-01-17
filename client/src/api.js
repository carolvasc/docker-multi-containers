import axios from "axios";

export const fetchCurrentValues = async () => {
  const response = await axios.get("/api/values/current");
  return response.data;
};

export const fetchAllIndexes = async () => {
  const response = await axios.get("/api/values/all");
  return response.data;
};

export const submitIndex = async (index) => {
  const response = await axios.post("/api/values", { index });
  return response.data;
};
