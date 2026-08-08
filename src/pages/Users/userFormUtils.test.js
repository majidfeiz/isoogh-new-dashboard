import { buildUserPayload } from "./userFormUtils.js";

test("builds an allowlisted user payload without status or form-only fields", () => {
  expect(buildUserPayload({
    name: "سارا هاشم آبادی",
    email: "iderun10111@gmail.com",
    username: "",
    ssn: "",
    phone: "09194826176",
    status: "active",
    confirmPassword: "secret",
    mobile: "09190000000",
  })).toEqual({
    name: "سارا هاشم آبادی",
    email: "iderun10111@gmail.com",
    username: "",
    ssn: "",
    phone: "09194826176",
  });
});

test("includes password only when the user entered one", () => {
  expect(buildUserPayload({ password: "" })).not.toHaveProperty("password");
  expect(buildUserPayload({ password: "new-secret" })).toHaveProperty("password", "new-secret");
});
