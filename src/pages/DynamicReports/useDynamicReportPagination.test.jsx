import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import useDynamicReportPagination, { normalizeDynamicReportMeta } from "./useDynamicReportPagination.js";

const Harness = ({ mode, request, definitionHash = "", reportId = "7", widgetId }) => {
  const pagination = useDynamicReportPagination({
    mode,
    reportId,
    widgetId,
    definitionHash,
    request,
    initialLimit: 20,
  });
  return (
    <>
      <div data-testid="state">{`${pagination.meta.page}/${pagination.meta.lastPage}/${pagination.meta.total}/${pagination.limit}/${pagination.search}`}</div>
      <button onClick={() => pagination.setPage(2)}>page-2</button>
      <button onClick={() => pagination.setPage(pagination.meta.page + 1)}>next</button>
      <button onClick={() => pagination.setPage(pagination.meta.page - 1)}>previous</button>
      <button onClick={() => pagination.setLimit(50)}>limit-50</button>
      <button onClick={() => pagination.setSearch("ali")}>search</button>
      <div data-testid="value">{pagination.result?.displayRows?.[0]?.value || ""}</div>
    </>
  );
};

const responseFor = ({ page, limit }, value = `page-${page}`) => ({
  displayRows: [{ value }],
  meta: { page, limit, total: 53, lastPage: Math.ceil(53 / limit) },
});

test.each([
  ["preview", undefined],
  ["execute", undefined],
  ["widget", "9"],
])("%s mode sends page and limit in the shared request contract", async (mode, widgetId) => {
  const request = jest.fn((query) => Promise.resolve(responseFor(query)));
  render(<Harness mode={mode} widgetId={widgetId} request={request} />);
  await waitFor(() => expect(request).toHaveBeenCalledWith(
    expect.objectContaining({ page: 1, limit: 20, search: "" }),
    expect.any(AbortSignal)
  ));

  fireEvent.click(screen.getByText("page-2"));
  await waitFor(() => expect(request).toHaveBeenLastCalledWith(
    expect.objectContaining({ page: 2, limit: 20 }),
    expect.any(AbortSignal)
  ));
  await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("2/3/53/20"));
});

test("search and page size reset page to one and preserve the other query values", async () => {
  const request = jest.fn((query) => Promise.resolve(responseFor(query)));
  render(<Harness mode="execute" request={request} />);
  await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByText("page-2"));
  await waitFor(() => expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, limit: 20, search: "" }), expect.any(AbortSignal)));

  fireEvent.click(screen.getByText("search"));
  await waitFor(() => expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, limit: 20, search: "ali" }), expect.any(AbortSignal)));
  fireEvent.click(screen.getByText("limit-50"));
  await waitFor(() => expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, limit: 50, search: "ali" }), expect.any(AbortSignal)));
  await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("1/2/53/50/ali"));
});

test("definition change on page three requests the new definition from page one", async () => {
  const request = jest.fn((query) => Promise.resolve(responseFor(query)));
  const { rerender } = render(<Harness mode="preview" request={request} definitionHash="definition-a" />);
  await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByText("page-2"));
  await waitFor(() => expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }), expect.any(AbortSignal)));
  fireEvent.click(screen.getByText("next"));
  await waitFor(() => expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ page: 3 }), expect.any(AbortSignal)));

  rerender(<Harness mode="preview" request={request} definitionHash="definition-b" />);
  await waitFor(() => expect(request).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }), expect.any(AbortSignal)));
});

test("an older response cannot overwrite the latest page result", async () => {
  const pending = [];
  const request = jest.fn((query) => new Promise((resolve) => pending.push({ query, resolve })));
  render(<Harness mode="execute" request={request} />);
  await waitFor(() => expect(pending).toHaveLength(1));
  fireEvent.click(screen.getByText("page-2"));
  await waitFor(() => expect(pending).toHaveLength(2));

  await act(async () => pending[1].resolve(responseFor(pending[1].query, "new-page")));
  await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("new-page"));
  await act(async () => pending[0].resolve(responseFor(pending[0].query, "old-page")));
  expect(screen.getByTestId("value")).toHaveTextContent("new-page");
});

test("falls back from meta to legacy pagination", () => {
  expect(normalizeDynamicReportMeta({
    pagination: { page: 2, limit: 20, total: 53, lastPage: 3 },
  })).toEqual({ page: 2, limit: 20, total: 53, lastPage: 3 });
});
