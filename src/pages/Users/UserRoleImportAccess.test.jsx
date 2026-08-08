import React from "react";
import { render, screen } from "@testing-library/react";
import { useAuth } from "../../context/AuthContext.jsx";
import UserRoleImportAccess from "./UserRoleImportAccess.jsx";

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: jest.fn() }));

test("shows role import UI only with users.roles.import permission", () => {
  useAuth.mockReturnValue({ hasPermission: (permission) => permission === "users.roles.import" });
  const { rerender } = render(<UserRoleImportAccess><button>تخصیص گروهی نقش</button></UserRoleImportAccess>);
  expect(screen.getByRole("button", { name: "تخصیص گروهی نقش" })).toBeInTheDocument();

  useAuth.mockReturnValue({ hasPermission: () => false });
  rerender(<UserRoleImportAccess><button>تخصیص گروهی نقش</button></UserRoleImportAccess>);
  expect(screen.queryByRole("button", { name: "تخصیص گروهی نقش" })).not.toBeInTheDocument();
});
