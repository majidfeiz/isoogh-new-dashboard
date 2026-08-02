import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Spinner } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb.jsx";
import { createBaleLinkChallenge, getMyBaleConnection, revokeMyBaleConnection } from "../../services/baleService.jsx";

export default function BaleAccount() {
  const [connection,setConnection]=useState(null);const [challenge,setChallenge]=useState(null);const [loading,setLoading]=useState(true);const load=()=>{setLoading(true);getMyBaleConnection().then(setConnection).finally(()=>setLoading(false));};useEffect(load,[]);
  const create=async()=>setChallenge(await createBaleLinkChallenge());
  const revoke=async()=>{if(!window.confirm("اتصال حساب بله لغو شود؟"))return;await revokeMyBaleConnection();setChallenge(null);load();};
  return <div className="page-content"><div className="container-fluid"><Breadcrumbs title="حساب کاربری" breadcrumbItem="اتصال بله"/><Card><CardBody className="text-center">{loading?<Spinner/>:connection?.linked?<><i className="bx bx-check-circle text-success display-4"/><h4>حساب بله متصل است</h4><p>{connection.username?`@${connection.username}`:""} {connection.baleUserId?`· ${String(connection.baleUserId)}`:""}</p><Button color="danger" outline onClick={revoke}>لغو اتصال</Button></>:<><h4>اتصال حساب به بازوی بله</h4><p>یک لینک کوتاه‌عمر بسازید و آن را فقط در بله باز کنید.</p><Button color="primary" onClick={create}>ساخت لینک اتصال</Button>{challenge&&<div className="mt-4"><a className="btn btn-success" href={challenge.deepLink}>باز کردن در بله</a>{challenge.qrCodeUrl&&<img className="d-block mx-auto mt-3" width="220" height="220" src={challenge.qrCodeUrl} alt="QR اتصال حساب بله"/>}</div>}</>}</CardBody></Card></div></div>;
}
