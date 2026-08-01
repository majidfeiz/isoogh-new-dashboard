import {
  mergeOutboundTagOptions,
  parseOutboundCallQuery,
  serializeOutboundCallQuery,
} from "./outboundCallHistoryFilterUtils.js";

test("preserves independent SSN and tag filters in the URL", () => {
  const query = parseOutboundCallQuery(new URLSearchParams(
    "page=3&type=StudentName&q=علی&ssn=001&tagId=12&disposition=ANSWERED&sort_by=id&sort_order=DESC&start_date=2026-08-01"
  ));
  expect(query).toEqual(expect.objectContaining({ page: 3, ssn: "001", tagId: "12", disposition: "ANSWERED" }));
  const params = serializeOutboundCallQuery(query);
  expect(params.get("ssn")).toBe("001");
  expect(params.get("tagId")).toBe("12");
  expect(params.get("page")).toBe("3");
});

test("trims SSN, removes cleared tag and deduplicates appended tags", () => {
  const params = serializeOutboundCallQuery({
    page: 1, type: "", q: "", ssn: " 001 ", tagId: "", disposition: "ALL",
    sortBy: "", sortOrder: "", startDate: "", endDate: "",
  });
  expect(params.get("ssn")).toBe("001");
  expect(params.has("tagId")).toBe(false);
  expect(mergeOutboundTagOptions([{ id: 1, name: "قدیم" }], [
    { id: 1, name: "جدید" }, { id: 2, name: "دوم" },
  ])).toEqual([{ id: 1, name: "جدید" }, { id: 2, name: "دوم" }]);
});
