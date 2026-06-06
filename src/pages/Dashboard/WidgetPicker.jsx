// src/pages/Dashboard/WidgetPicker.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  InputGroup,
  InputGroupText,
  Spinner,
  Badge,
  Button,
} from "reactstrap";
import { getWidgetCatalog } from "../../services/dashboardService.jsx";

const CATEGORY_LABELS = {
  stats: "آمار",
  charts: "نمودار",
  tables: "جدول",
  misc: "سایر",
};

const CATEGORY_ICONS = {
  stats: "bx-bar-chart-alt-2",
  charts: "bx-line-chart",
  tables: "bx-table",
  misc: "bx-grid-alt",
};

const CATEGORY_COLORS = {
  stats: "primary",
  charts: "success",
  tables: "info",
  misc: "warning",
};

const WidgetPicker = ({ isOpen, onClose, existingWidgetIds = [], onAdd, loading: addLoading }) => {
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setCatalogLoading(true);
    getWidgetCatalog()
      .then(setCatalog)
      .catch(() => setCatalog([]))
      .finally(() => setCatalogLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setActiveTab("all");
    }
  }, [isOpen]);

  const categories = useMemo(() => {
    const cats = [...new Set(catalog.map((w) => w.category))];
    return cats;
  }, [catalog]);

  const filtered = useMemo(() => {
    let list = catalog;
    if (activeTab !== "all") list = list.filter((w) => w.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((w) => w.name?.toLowerCase().includes(q) || w.description?.toLowerCase()?.includes(q));
    }
    return list;
  }, [catalog, activeTab, search]);

  const handleAdd = async (widget) => {
    setAddingId(widget.id);
    try {
      await onAdd(widget);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" scrollable centered>
      <ModalHeader toggle={onClose} className="border-bottom-0 pb-0">
        <div className="d-flex align-items-center gap-2">
          <div className="avatar-xs bg-primary-subtle rounded d-flex align-items-center justify-content-center">
            <i className="bx bx-plus-circle text-primary font-size-18" />
          </div>
          <div>
            <h5 className="mb-0">افزودن ویجت</h5>
            <p className="text-muted mb-0 font-size-12">ویجت مورد نظر را از لیست زیر انتخاب کنید</p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody className="pt-2">
        {/* Search */}
        <InputGroup className="mb-3">
          <InputGroupText className="bg-light border-end-0">
            <i className="bx bx-search text-muted" />
          </InputGroupText>
          <Input
            placeholder="جستجو در ویجت‌ها..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-start-0 bg-light"
          />
        </InputGroup>

        {/* Category Tabs */}
        <div className="d-flex gap-2 flex-wrap mb-3">
          <button
            className={`btn btn-sm ${activeTab === "all" ? "btn-primary" : "btn-outline-secondary"} rounded-pill px-3`}
            onClick={() => setActiveTab("all")}
          >
            همه
            <Badge color="light" className="text-dark ms-1 font-size-11">{catalog.length}</Badge>
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${activeTab === cat ? `btn-${CATEGORY_COLORS[cat] || "secondary"}` : "btn-outline-secondary"} rounded-pill px-3`}
              onClick={() => setActiveTab(cat)}
            >
              <i className={`bx ${CATEGORY_ICONS[cat] || "bx-widget"} me-1`} />
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* Widget Grid */}
        {catalogLoading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="text-muted mt-2 mb-0 font-size-13">در حال بارگذاری...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bx bx-search-alt font-size-40 d-block mb-2 text-muted" />
            <p className="mb-0">ویجتی یافت نشد</p>
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map((widget) => {
              const isAdded = existingWidgetIds.includes(widget.id);
              const isAdding = addingId === widget.id;
              return (
                <div key={widget.id} className="col-12 col-sm-6 col-md-4">
                  <div
                    className={`border rounded p-3 h-100 d-flex flex-column position-relative ${isAdded ? "border-success bg-success-subtle" : "border-light"}`}
                    style={{ transition: "all 0.2s", cursor: isAdded ? "default" : "pointer" }}
                  >
                    {isAdded && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <Badge color="success" pill className="font-size-10">
                          <i className="bx bx-check me-1" />اضافه‌شده
                        </Badge>
                      </div>
                    )}
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div
                        className={`avatar-xs bg-${CATEGORY_COLORS[widget.category] || "primary"}-subtle rounded d-flex align-items-center justify-content-center`}
                        style={{ flexShrink: 0 }}
                      >
                        <i className={`bx ${CATEGORY_ICONS[widget.category] || "bx-widget"} text-${CATEGORY_COLORS[widget.category] || "primary"} font-size-16`} />
                      </div>
                      <div>
                        <p className="mb-0 fw-semibold font-size-13">{widget.name}</p>
                        <Badge
                          color={CATEGORY_COLORS[widget.category] || "secondary"}
                          className="font-size-10"
                          pill
                          style={{ opacity: 0.8 }}
                        >
                          {CATEGORY_LABELS[widget.category] || widget.category}
                        </Badge>
                      </div>
                    </div>
                    {widget.description && (
                      <p className="text-muted font-size-12 mb-2 flex-grow-1">{widget.description}</p>
                    )}
                    <div className="mt-auto">
                      <Button
                        size="sm"
                        color={isAdded ? "success" : "primary"}
                        outline={isAdded}
                        className="w-100"
                        disabled={isAdded || isAdding}
                        onClick={() => !isAdded && !isAdding && handleAdd(widget)}
                      >
                        {isAdding ? (
                          <>
                            <Spinner size="sm" className="me-1" />در حال افزودن...
                          </>
                        ) : isAdded ? (
                          <><i className="bx bx-check me-1" />اضافه‌شده</>
                        ) : (
                          <><i className="bx bx-plus me-1" />افزودن</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default WidgetPicker;
