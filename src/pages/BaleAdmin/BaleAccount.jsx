import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, CardBody, Spinner } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { createBaleLinkChallenge, getMyBaleConnection, revokeMyBaleConnection } from "../../services/baleService.jsx";

const shown = (value) => value == null || value === "" ? "—" : value;
const faDate = (value) => value ? new Date(value).toLocaleString("fa-IR") : "—";

export default function BaleAccount() {
  const [connection, setConnection] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setConnection(await getMyBaleConnection()); }
    catch { setError("دریافت وضعیت اتصال بله انجام نشد."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const create = async () => setChallenge(await createBaleLinkChallenge());
  const revoke = async () => { if (!window.confirm("اتصال حساب بله لغو شود؟")) return; await revokeMyBaleConnection(); setChallenge(null); await load(); };

  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="حساب کاربری" breadcrumbItem="اتصال بله" /><Card><CardBody className="text-center">
    {loading ? <Spinner /> : error ? <Alert color="danger">{error}<Button size="sm" className="ms-2" onClick={load}>تلاش مجدد</Button></Alert> : connection?.linked ? <>
      <i className="bx bx-check-circle text-success display-4" /><h4>حساب بله با موفقیت متصل است</h4>
      <dl className="row text-start mx-auto mt-4" style={{ maxWidth: 520 }}><dt className="col-5">نام کاربر</dt><dd className="col-7">{shown(connection.userName)}</dd><dt className="col-5">شماره</dt><dd className="col-7">{shown(connection.maskedPhone)}</dd><dt className="col-5">وضعیت</dt><dd className="col-7">{shown(connection.status)}</dd><dt className="col-5">نام کاربری بله</dt><dd className="col-7">{connection.baleUsername ? `@${connection.baleUsername}` : "—"}</dd><dt className="col-5">زمان اتصال</dt><dd className="col-7">{faDate(connection.linkedAt)}</dd></dl>
      <div className="d-flex flex-wrap justify-content-center gap-2"><a className="btn btn-primary" href="/bale-mini-app">باز کردن سرآمد</a><Button outline onClick={load}>وضعیت حساب من</Button><Button color="danger" outline onClick={revoke}>لغو اتصال</Button></div>
    </> : <>
      <h4>اتصال حساب به بازوی بله</h4><p>یک لینک کوتاه‌عمر بسازید و آن را فقط در بله باز کنید.</p><Button color="primary" onClick={create}>ساخت لینک اتصال</Button>
      {challenge && <div className="mt-4"><a className="btn btn-success" href={challenge.deepLink}>باز کردن در بله</a>{challenge.qrCodeUrl && <img className="d-block mx-auto mt-3" width="220" height="220" src={challenge.qrCodeUrl} alt="QR اتصال حساب بله" />}</div>}
    </>}
  </CardBody></Card></div></div>;
}
