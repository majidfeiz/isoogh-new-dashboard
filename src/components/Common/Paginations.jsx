import { Link } from "react-router-dom";
import React, { useEffect, useMemo } from "react";
import { Row } from "reactstrap";

const Paginations = ({
  perPageData,
  data,
  currentPage,
  setCurrentPage,
  isShowingPageLength,
  paginationDiv,
  paginationClass,
  totalRecords,
}) => {
  const total =
    typeof totalRecords === "number" ? totalRecords : data?.length || 0;

  const totalPages = Math.max(1, Math.ceil(total / (perPageData || 1)));

  // ✅ تنظیمات نمایش پنجره‌ای
  const siblingCount = 2; // تعداد صفحات اطراف current
  const boundaryCount = 1; // نمایش همیشه صفحه اول/آخر

  const pageItems = useMemo(() => {
    if (totalPages <= 1) return [1];

    const range = [];

    const startPages = [];
    for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) {
      startPages.push(i);
    }

    const endPages = [];
    for (
      let i = Math.max(totalPages - boundaryCount + 1, boundaryCount + 1);
      i <= totalPages;
      i++
    ) {
      endPages.push(i);
    }

    const siblingsStart = Math.max(
      Math.min(
        currentPage - siblingCount,
        totalPages - boundaryCount - siblingCount * 2 - 1
      ),
      boundaryCount + 2
    );

    const siblingsEnd = Math.min(
      Math.max(
        currentPage + siblingCount,
        boundaryCount + siblingCount * 2 + 2
      ),
      (endPages[0] || totalPages + 1) - 2
    );

    range.push(...startPages);

    // اگر فاصله افتاد، ... یا یک صفحه میانی
    if (siblingsStart > boundaryCount + 2) {
      range.push("...");
    } else if (boundaryCount + 1 < siblingsStart) {
      range.push(boundaryCount + 1);
    }

    for (let i = siblingsStart; i <= siblingsEnd; i++) {
      range.push(i);
    }

    if (siblingsEnd < totalPages - boundaryCount - 1) {
      range.push("...");
    } else if (siblingsEnd + 1 < totalPages - boundaryCount + 1) {
      range.push(totalPages - boundaryCount);
    }

    range.push(...endPages);

    // یکتا
    return Array.from(new Set(range));
  }, [totalPages, currentPage]);

  const handleClick = (page) => {
    const p = Number(page);
    if (!p || p === currentPage) return;
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  const handlePrevPage = (e) => {
    e.preventDefault();
    if (currentPage <= 1) return;
    setCurrentPage(currentPage - 1);
  };

  const handleNextPage = (e) => {
    e.preventDefault();
    if (currentPage >= totalPages) return;
    setCurrentPage(currentPage + 1);
  };

  // ✅ اگر currentPage از totalPages بیشتر شد (مثلاً بعد سرچ) برگرد به آخرین صفحه
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const from = total === 0 ? 0 : (currentPage - 1) * perPageData + 1;
  const to = Math.min(total, currentPage * perPageData);

  return (
    <React.Fragment>
      <Row className="justify-content-between align-items-center">
        {isShowingPageLength && (
          <div className="col-sm">
            <div className="text-muted">
              {total > 0 ? (
                <>
                  نشان دادن <span className="fw-semibold">{from}</span> تا{" "}
                  <span className="fw-semibold">{to}</span> از{" "}
                  <span className="fw-semibold">{total}</span> ورودی
                </>
              ) : (
                "ورودی‌ای یافت نشد"
              )}
            </div>
          </div>
        )}

        <div className={paginationDiv}>
          <ul className={paginationClass}>
            {/* قبلی */}
            <li className={`page-item ${currentPage <= 1 ? "disabled" : ""}`}>
              <Link className="page-link" to="#" onClick={handlePrevPage}>
                <i className="mdi mdi-chevron-left"></i>
              </Link>
            </li>

            {/* شماره صفحات (پنجره‌ای) */}
            {pageItems.map((item, idx) => {
              if (item === "...") {
                return (
                  <li className="page-item disabled" key={`ellipsis-${idx}`}>
                    <span className="page-link">...</span>
                  </li>
                );
              }

              return (
                <li
                  className={
                    currentPage === item ? "page-item active" : "page-item"
                  }
                  key={item}
                >
                  <Link
                    className="page-link"
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleClick(item);
                    }}
                  >
                    {item}
                  </Link>
                </li>
              );
            })}

            {/* بعدی */}
            <li
              className={`page-item ${currentPage >= totalPages ? "disabled" : ""}`}
            >
              <Link className="page-link" to="#" onClick={handleNextPage}>
                <i className="mdi mdi-chevron-right"></i>
              </Link>
            </li>
          </ul>
        </div>
      </Row>
    </React.Fragment>
  );
};

export default Paginations;
