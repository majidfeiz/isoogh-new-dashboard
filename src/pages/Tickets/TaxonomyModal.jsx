import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { createTicketTaxonomy } from "../../services/ticketService.jsx";
import { errorMessage } from "./ticketUtils.js";

export default function TaxonomyModal({ isOpen, toggle, type, onCreated }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const singular = type === "categories" ? "دسته" : "نتیجه";
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);
  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) { setError(`نام ${singular} الزامی است`); return; }
    setSaving(true); setError("");
    try { const created = await createTicketTaxonomy(type, name); onCreated(created); setName(""); toggle(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  };
  return <Modal isOpen={isOpen} toggle={toggle} centered labelledBy="taxonomy-title"><Form onSubmit={submit}><ModalHeader toggle={toggle}><span id="taxonomy-title">افزودن {singular}</span></ModalHeader><ModalBody>{error && <Alert color="danger" role="alert" aria-live="assertive">{error}</Alert>}<Label htmlFor="taxonomy-name">نام {singular}</Label><Input innerRef={inputRef} id="taxonomy-name" value={name} invalid={Boolean(error) && !name.trim()} maxLength={100} onChange={(e) => setName(e.target.value)} /><FormFeedback>این فیلد الزامی است.</FormFeedback></ModalBody><ModalFooter><Button type="button" color="light" onClick={toggle}>انصراف</Button><Button type="submit" color="primary" disabled={saving}>{saving ? "در حال ثبت..." : "ثبت"}</Button></ModalFooter></Form></Modal>;
}
