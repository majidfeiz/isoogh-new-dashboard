// src/pages/Voip/OutboundCallHistories.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Input,
  Button,
} from "reactstrap";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";
import Paginations from "../../components/Common/Paginations.jsx";

import { getOutboundCallHistories } from "../../services/voipService.jsx";

const OutboundCallHistories = () => {
  document.title = "تماس‌های خروجی | داشبورد آیسوق";

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 15,
    total: 0,
    lastPage: 1,
  });

  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (page = 1, currentType = "", currentQ = "") => {
      setLoading(true);
      try {
        const res = await getOutboundCallHistories({
          page,
          per_page: meta.limit,
          type: currentType,
          q: currentQ,
        });

        setData(res.items || []);
        setMeta(
          res.pagination || {
            page,
            limit: meta.limit,
            total: 0,
            lastPage: 1,
          }
        );
      } catch (e) {
        console.error("خطا در دریافت تماس‌های خروجی", e);
        setData([]);
        setMeta((prev) => ({ ...prev, total: 0, lastPage: 1 }));
      } finally {
        setLoading(false);
      }
    },
    [meta.limit]
  );

  useEffect(() => {
    fetchData(1, "", "");
  }, [fetchData]);

  const handleSearch = useCallback(() => {
    fetchData(1, type, q);
  }, [fetchData, type, q]);

  const handlePageChange = useCallback(
    (page) => {
      fetchData(page, type, q);
    },
    [fetchData, type, q]
  );

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const formatUnixFa = (unix) => {
    if (!unix || Number(unix) <= 0) return "-";
    const num = Number(unix);

    // placeholder غیرواقعی
    if (num >= 2147483647) return "-";

    const d = new Date(num * 1000);
    if (Number.isNaN(d.getTime())) return "-";

    return d.toLocaleString("fa-IR");
  };

  const dispositionFa = (val) => {
    if (!val) return "-";
    const v = String(val).toUpperCase();
    if (v === "ANSWERED") return "پاسخ داده شد";
    if (v === "NO ANSWER") return "بی‌پاسخ";
    if (v === "BUSY") return "مشغول";
    if (v === "FAILED") return "ناموفق";
    return val;
  };

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "src",
        header: "شماره مبدا",
        accessorKey: "src",
        enableSorting: true,
        enableColumnFilter: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "to_phone",
        header: "شماره مقصد",
        accessorKey: "to_phone",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "disposition",
        header: "وضعیت تماس",
        accessorKey: "disposition",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => dispositionFa(row.original?.disposition),
      },
      {
        id: "wait",
        header: "انتظار (ث)",
        accessorKey: "wait",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "talk_time",
        header: "مدت مکالمه",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const p = row.original?.playtime_string;
          if (p) return p;

          const dur = row.original?.duration;
          if (dur == null) return "-";

          const seconds = Number(dur);
          if (Number.isNaN(seconds)) return String(dur);

          // نمایش ساده: ثانیه
          return `${seconds} ثانیه`;
        },
      },
      {
        id: "support_form_title",
        header: "فرم پشتیبانی",
        accessorKey: "support_form_title",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => row.original?.support_form_title ?? "-",
      },
      {
        id: "adviser_id",
        header: "Adviser ID",
        accessorKey: "adviser_id",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "student_id",
        header: "Student ID",
        accessorKey: "student_id",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "start",
        header: "شروع",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => formatUnixFa(row.original?.starttime_unix),
      },
      {
        id: "end",
        header: "پایان",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => formatUnixFa(row.original?.endtime_unix),
      },
      {
        id: "call_group_id",
        header: "Call Group",
        accessorKey: "call_group_id",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => {
          const v = row.original?.call_group_id;
          if (!v) return "-";
          // کوتاه‌نمایی برای اینکه جدول به هم نریزه
          return v.length > 22 ? `${v.slice(0, 22)}...` : v;
        },
      },
    ],
    []
  );

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Voip" breadcrumbItem="تماس‌های خروجی" />

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <Row className="align-items-center g-2">
                  <Col md="4" className="mb-2 mb-md-0">
                    <h4 className="card-title mb-0">لیست تماس‌های خروجی</h4>
                  </Col>

                  <Col md="8">
                    <div className="d-flex gap-2 justify-content-start flex-wrap">
                      <Input
                        type="select"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        style={{ maxWidth: 220 }}
                      >
                        <option value="">نوع جستجو...</option>
                        <option value="StudentName">نام دانش‌آموز</option>
                        <option value="ssn">کدملی</option>
                        <option value="AdviserName">نام مشاور</option>
                        <option value="AdviserPhone">شماره مشاور</option>
                        <option value="tags">تگ‌ها</option>
                      </Input>

                      <Input
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="عبارت جستجو..."
                        className="flex-grow-1"
                      />

                      <Button
                        color="primary"
                        onClick={handleSearch}
                        disabled={loading}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        جستجو
                      </Button>
                    </div>
                  </Col>
                </Row>
              </CardHeader>

              <CardBody>
                <TableContainer
                  columns={columns}
                  data={data || []}
                  isGlobalFilter={false}
                  isPagination={false}
                  isLoading={loading}
                  tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />

                <Paginations
                  perPageData={meta.limit}
                  data={data}
                  totalRecords={meta.total}
                  currentPage={meta.page}
                  setCurrentPage={handlePageChange}
                  isShowingPageLength={true}
                  paginationDiv="col-sm-auto"
                  paginationClass="pagination pagination-sm mb-0"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default OutboundCallHistories;
