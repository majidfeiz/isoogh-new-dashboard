import { apiGet } from "../helpers/httpClient.jsx";
import { exportAnswerSheets, getAnswerSheetCall, getAnswerSheets } from "./answerSheetService.jsx";

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }));

beforeEach(() => apiGet.mockReset());

test("does not deduplicate multiple sessions belonging to one call", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [
    { sessionId: "first", voipCallId: 812 },
    { sessionId: "second", voipCallId: 812 },
  ], meta: { page: 1, limit: 10, total: 2, lastPage: 1 } } } });
  const result = await getAnswerSheets();
  expect(result.items.map((item) => item.sessionId)).toEqual(["first", "second"]);
});

test("sends exact answer-sheet filter names and excludes pagination from exports", async () => {
  apiGet.mockResolvedValue({ data: new Blob(["xlsx"]), headers: { "content-disposition": "attachment; filename=answers.xlsx" } });
  const result = await exportAnswerSheets("answers", { schoolId: "2", supportFormId: "10", studentSearch: "رضا", page: 4 });
  expect(result.blob).toBeInstanceOf(Blob);
  expect(apiGet.mock.calls[0][1].params).toMatchObject({ school_id: "2", support_form_id: "10", student_search: "رضا" });
  expect(apiGet.mock.calls[0][1].params.page).toBeUndefined();
});

test("normalizes nested VoIP call and history fields for the call modal", async () => {
  apiGet.mockResolvedValue({ data: { data: {
    voipCall: { from_phone: "09353912550", to_phone: "09194254919" },
    history: {
      disposition: "ANSWERED",
      starttime_unix: 1782039100,
      endtime_unix: 1782039252,
      duration: "136",
      wait: "16",
      playtime_seconds: "135.72",
    },
    files: [{ id: "2582537", type: "mp3", url: "https://str.isoogh.ir/call.mp3" }],
  } } });

  const result = await getAnswerSheetCall("legacy-1691888");

  expect(result).toMatchObject({
    source: "09353912550",
    destination: "09194254919",
    disposition: "ANSWERED",
    duration: "136",
    waitTime: "16",
    playtime: "135.72",
  });
  expect(result.startedAt).toMatch(/^2026-/);
  expect(result.endedAt).toMatch(/^2026-/);
  expect(result.files).toHaveLength(1);
});
