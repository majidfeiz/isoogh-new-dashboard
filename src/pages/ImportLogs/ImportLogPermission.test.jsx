import React from "react";
import { render, screen } from "@testing-library/react";
import Can from "../../components/Access/Can.jsx";

let mockPermissions = [];
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    hasPermission: (permission) => mockPermissions.includes(permission),
    hasAnyPermission: (values) => values.some((value) => mockPermissions.includes(value)),
    hasAllPermissions: (values) => values.every((value) => mockPermissions.includes(value)),
  }),
}));

test("export action visibility follows import-logs.export", () => {
  const { rerender } = render(<Can permission="import-logs.export"><button>خروجی Excel</button></Can>);
  expect(screen.queryByText("خروجی Excel")).toBeNull();
  mockPermissions = ["import-logs.export"];
  rerender(<Can permission="import-logs.export"><button>خروجی Excel</button></Can>);
  expect(screen.getByText("خروجی Excel")).toBeInTheDocument();
});
