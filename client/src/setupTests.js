// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

jest.mock("axios", () => ({
  get: jest.fn((url) => {
    if (typeof url === "string" && url.includes("/values/all")) {
      return Promise.resolve({ data: [] });
    }
    if (typeof url === "string" && url.includes("/values/current")) {
      return Promise.resolve({ data: {} });
    }
    return Promise.resolve({ data: {} });
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));
