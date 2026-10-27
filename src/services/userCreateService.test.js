import { apiPost } from "../helpers/httpClient.jsx";
import { createUser } from "./userService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn(), apiPost: jest.fn(), apiPatch: jest.fn(), apiDelete: jest.fn() }));

const payload = {
  name: "علی محمدی",
  username: "ali.mohammadi",
  phone: "02112345678",
  password: "secret123",
  accountType: "student",
  schoolIds: [12],
};

beforeEach(() => apiPost.mockReset());

test("posts the validated contract once and unwraps the common response", async () => {
  apiPost.mockResolvedValue({ data: { data: { id: 45, accountType: "student" } } });
  await expect(createUser(payload, { silent: true })).resolves.toEqual({ id: 45, accountType: "student" });
  expect(apiPost).toHaveBeenCalledTimes(1);
  expect(apiPost).toHaveBeenCalledWith("http://127.0.0.1:8040/users", payload, { silent: true });
});

test("blocks invalid account types before making a request", async () => {
  await expect(createUser({ ...payload, accountType: "super_adviser" })).rejects.toMatchObject({
    name: "CreateUserValidationError",
    fieldErrors: { accountType: expect.any(Array) },
  });
  expect(apiPost).not.toHaveBeenCalled();
});
