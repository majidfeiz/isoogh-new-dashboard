import { parseDownloadFilename } from "./importLogService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

describe("import log download filename", () => {
  test("parses UTF-8 and plain content disposition", () => {
    expect(parseDownloadFilename("attachment; filename*=UTF-8''%D9%84%D8%A7%DA%AF.xlsx", "fallback.xlsx")).toBe("لاگ.xlsx");
    expect(parseDownloadFilename('attachment; filename="rows.xlsx"', "fallback.xlsx")).toBe("rows.xlsx");
  });

  test("uses safe fallback", () => expect(parseDownloadFilename(null, "import-logs.xlsx")).toBe("import-logs.xlsx"));
});
