import axios from "axios";
import { fetchCurrentValues, submitIndex } from "./api";

jest.mock("axios");

test("fetchCurrentValues calls the current values endpoint and returns data", async () => {
  axios.get.mockResolvedValueOnce({ data: { 5: 8 } });

  const data = await fetchCurrentValues();

  expect(axios.get).toHaveBeenCalledWith("/api/values/current");
  expect(data).toEqual({ 5: 8 });
});

test("submitIndex posts the index payload and returns data", async () => {
  axios.post.mockResolvedValueOnce({ data: { working: true } });

  const data = await submitIndex("7");

  expect(axios.post).toHaveBeenCalledWith("/api/values", { index: "7" });
  expect(data).toEqual({ working: true });
});
