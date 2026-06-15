// src/pages/SupportForms/SupportFormForm.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Container,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import moment from "moment-jalaali";

import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  getSupportForm,
  getSupportForms,
  createSupportForm,
  updateSupportForm,
} from "../../services/supportFormService.jsx";
import { getSchools } from "../../services/schoolService.jsx";
import { getGrades } from "../../services/gradeService.jsx";
import {
  getParentTags,
  getParentTagValues,
} from "../../services/parentTagService.jsx";

const makeClientId = () => `cf_${Math.random().toString(36).slice(2, 10)}`;

const toNumberOrNull = (value) => {
  if (value === "" || value === null || typeof value === "undefined") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const toUnixSeconds = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") {
    return moment(value.toDate()).unix();
  }
  if (value instanceof Date) {
    return moment(value).unix();
  }
  if (typeof value === "number") {
    return value > 1000000000000 ? Math.floor(value / 1000) : Math.floor(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return toUnixSeconds(parsed);
  }
  return null;
};

const buildQuestion = (data = {}) => ({
  client_id: data.client_id || makeClientId(),
  id: data.id,
  code: data.code || "",
  question: data.question || "",
  answer: data.answer || "",
  score: data.score ?? "",
  required: data.required ?? true,
  title: data.title || "",
  type: data.type ?? 0,
  multi_choice: data.multi_choice ?? false,
  rtl: data.rtl ?? false,
  options: Array.isArray(data.options)
    ? data.options.map((opt) => ({
        client_id: opt.client_id || makeClientId(),
        id: opt.id,
        answer: opt.answer || "",
        is_correct: opt.is_correct ?? false,
      }))
    : [],
});

const parseJsonField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn("Failed to parse json field", err);
    }
  }
  return [];
};

const buildHeading = (data = {}) => ({
  headings_title: data.headings_title || data.title || "",
  headings_body: data.headings_body || data.body || "",
});

const buildProblem = (data = {}) => ({
  problem_title: data.problem_title || data.title || "",
  problem_body: data.problem_body || data.body || "",
});

const buildPriority = (data = {}) => ({
  phone: data.phone ?? "",
  call_no: data.call_no ?? "",
  sms_no: data.sms_no ?? "",
});

const buildQuestionHint = (data = {}) => ({
  support_form_id: data.support_form_id ?? "",
  question_id: data.question_id ?? "",
});

const buildParentTagShowLimit = (data = {}) => ({
  parent_tag_id: data.parent_tag_id ?? "",
  tag_id: data.tag_id ?? "",
});

const buildParentTagQuestionAnswer = (data = {}) => ({
  parent_tag_question_answer_id: data.parent_tag_question_answer_id ?? data.parent_tag_id ?? "",
});

const SupportFormForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  document.title = (isEdit ? "ویرایش فرم تماس" : "ایجاد فرم تماس") + " | داشبورد آیسوق";

  const [form, setForm] = useState({
    title: "",
    phone_number: "",
    start_at: null,
    end_at: null,
    stop_time: "",
    call_duration: "",
    concurrent_calls: "",
    waiting_call_duration: "",
    school_id: "",
    grade_id: "",
    accepted_duration_time: "",
    accepted_allow_number_of_calls: "",
    accepted_allow_number_of_calls_status: 0,
    next_support_form_id: "",
  });
  const [questions, setQuestions] = useState([buildQuestion()]);
  const [headings, setHeadings] = useState([buildHeading()]);
  const [problems, setProblems] = useState([buildProblem()]);
  const [priorities, setPriorities] = useState([buildPriority()]);
  const [questionHints, setQuestionHints] = useState([]);
  const [parentTagShowLimit, setParentTagShowLimit] = useState([]);
  const [parentTagQuestionAnswer, setParentTagQuestionAnswer] = useState([]);
  const [errors, setErrors] = useState({});
  const [questionErrors, setQuestionErrors] = useState([]);
  const [listErrors, setListErrors] = useState({
    headings: [],
    problems: [],
    priorities: [],
    questionHints: [],
    parentTagShowLimit: [],
    parentTagQuestionAnswer: [],
  });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [grades, setGrades] = useState([]);
  const [supportForms, setSupportForms] = useState([]);
  const [parentTags, setParentTags] = useState([]);
  const [supportFormQuestions, setSupportFormQuestions] = useState({});
  const [parentTagValues, setParentTagValues] = useState({});
  const [activeTab, setActiveTab] = useState(1);
  const [passedSteps, setPassedSteps] = useState([1]);

  const fetchOptions = useCallback(async () => {
    try {
      const [schoolsRes, gradesRes, supportFormsRes, parentTagsRes] = await Promise.all([
        getSchools({ page: 1, limit: 200 }),
        getGrades({ page: 1, limit: 200 }),
        getSupportForms({ page: 1, limit: 200 }),
        getParentTags({ page: 1, limit: 200 }),
      ]);
      setSchools(schoolsRes.items || []);
      setGrades(gradesRes.items || []);
      setSupportForms(supportFormsRes.items || []);
      setParentTags(parentTagsRes.items || []);
    } catch (e) {
      console.error("خطا در دریافت مدارس/پایه‌ها", e);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        const data = await getSupportForm(id);
        const formData = data?.data || data;
        const fetchedQuestions = Array.isArray(formData?.questions)
          ? formData.questions.map((q) => buildQuestion(q))
          : [buildQuestion()];
        const parsedHeadings = parseJsonField(formData?.headings).map(buildHeading);
        const parsedProblems = parseJsonField(formData?.problems).map(buildProblem);
        const parsedPriorities = parseJsonField(formData?.priorities).map(buildPriority);
        const parsedQuestionHints = parseJsonField(formData?.question_hint).map(
          buildQuestionHint
        );
        const parsedParentTagShowLimit = parseJsonField(
          formData?.parent_tag_show_limit
        ).map(buildParentTagShowLimit);
        const parsedParentTagQuestionAnswer = parseJsonField(
          formData?.parent_tag_question_answer
        ).map(buildParentTagQuestionAnswer);

        setForm({
          title: formData?.title || "",
          phone_number: formData?.phone_number || "",
          start_at: formData?.start_at
            ? moment.unix(Number(formData.start_at)).toDate()
            : null,
          end_at: formData?.end_at ? moment.unix(Number(formData.end_at)).toDate() : null,
          stop_time: formData?.stop_time ?? "",
          call_duration: formData?.call_duration ?? "",
          concurrent_calls: formData?.concurrent_calls ?? "",
          waiting_call_duration: formData?.waiting_call_duration ?? "",
          school_id: formData?.school_id ?? "",
          grade_id: formData?.grade_id ?? "",
          accepted_duration_time: formData?.accepted_duration_time ?? "",
          accepted_allow_number_of_calls: formData?.accepted_allow_number_of_calls ?? "",
          accepted_allow_number_of_calls_status:
            formData?.accepted_allow_number_of_calls_status ?? 0,
          next_support_form_id: formData?.next_support_form_id ?? "",
        });
        setQuestions(fetchedQuestions.length ? fetchedQuestions : [buildQuestion()]);
        setHeadings(parsedHeadings.length ? parsedHeadings : [buildHeading()]);
        setProblems(parsedProblems.length ? parsedProblems : [buildProblem()]);
        setPriorities(parsedPriorities.length ? parsedPriorities : [buildPriority()]);
        setQuestionHints(parsedQuestionHints);
        setParentTagShowLimit(parsedParentTagShowLimit);
        setParentTagQuestionAnswer(parsedParentTagQuestionAnswer);
      } catch (e) {
        console.error(e);
        setAlert({
          type: "danger",
          message: "خطا در دریافت اطلاعات فرم تماس",
        });
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const loadSupportFormQuestions = useCallback(
    async (supportFormId) => {
      if (!supportFormId || supportFormQuestions[supportFormId]) return;
      try {
        const data = await getSupportForm(supportFormId);
        const formData = data?.data || data;
        const items = Array.isArray(formData?.questions) ? formData.questions : [];
        setSupportFormQuestions((prev) => ({
          ...prev,
          [supportFormId]: items,
        }));
      } catch (e) {
        console.error("خطا در دریافت سوالات فرم تماس", e);
      }
    },
    [supportFormQuestions]
  );

  const loadParentTagValues = useCallback(
    async (parentTagId) => {
      if (!parentTagId || parentTagValues[parentTagId]) return;
      try {
        const res = await getParentTagValues(parentTagId, { page: 1, limit: 200 });
        setParentTagValues((prev) => ({
          ...prev,
          [parentTagId]: res.items || [],
        }));
      } catch (e) {
        console.error("خطا در دریافت مقادیر تگ والد", e);
      }
    },
    [parentTagValues]
  );

  useEffect(() => {
    const formIds = new Set(
      (questionHints || [])
        .map((item) => item.support_form_id)
        .filter((value) => !!value)
    );
    formIds.forEach((supportFormId) => {
      loadSupportFormQuestions(supportFormId);
    });
  }, [questionHints, loadSupportFormQuestions]);

  useEffect(() => {
    const parentIds = new Set(
      (parentTagShowLimit || [])
        .map((item) => item.parent_tag_id)
        .filter((value) => !!value)
    );
    parentIds.forEach((parentTagId) => {
      loadParentTagValues(parentTagId);
    });
  }, [parentTagShowLimit, loadParentTagValues]);

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (qIndex, optIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const options = q.options.map((opt, oIdx) =>
          oIdx === optIndex ? { ...opt, [field]: value } : opt
        );
        return { ...q, options };
      })
    );
  };

  const updateListItem = (setter) => (index, field, value) => {
    setter((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addListItem = (setter, builder) => () => {
    setter((prev) => [...prev, builder()]);
  };

  const removeListItem = (setter, index) => () => {
    setter((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleHeadingChange = updateListItem(setHeadings);
  const handleProblemChange = updateListItem(setProblems);
  const handlePriorityChange = updateListItem(setPriorities);
  const handleQuestionHintChange = updateListItem(setQuestionHints);
  const handleParentTagShowLimitChange = updateListItem(setParentTagShowLimit);
  const handleParentTagQuestionAnswerChange = updateListItem(
    setParentTagQuestionAnswer
  );

  const removeHeading = (index) => () => {
    setHeadings((prev) => prev.filter((_, idx) => idx !== index));
    setListErrors((prev) => ({
      ...prev,
      headings: (prev.headings || []).filter((_, idx) => idx !== index),
    }));
  };

  const removeProblem = (index) => () => {
    setProblems((prev) => prev.filter((_, idx) => idx !== index));
    setListErrors((prev) => ({
      ...prev,
      problems: (prev.problems || []).filter((_, idx) => idx !== index),
    }));
  };

  const removePriority = (index) => () => {
    setPriorities((prev) => prev.filter((_, idx) => idx !== index));
    setListErrors((prev) => ({
      ...prev,
      priorities: (prev.priorities || []).filter((_, idx) => idx !== index),
    }));
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, buildQuestion()]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
    setQuestionErrors((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddOption = (qIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex
          ? {
              ...q,
              options: [
                ...q.options,
                { client_id: makeClientId(), id: undefined, answer: "", is_correct: false },
              ],
            }
          : q
      )
    );
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex
          ? { ...q, options: q.options.filter((_, oIdx) => oIdx !== optIndex) }
          : q
      )
    );
  };

  const validateStep = useCallback(
    (step) => {
      const nextErrors = {};
      const nextQuestionErrors = [];

      if (step === 1) {
        if (!form.title?.trim()) nextErrors.title = "عنوان الزامی است.";
        if (!form.grade_id) nextErrors.grade_id = "پایه الزامی است.";
        const nextHeadingErrors = headings.map((item) => ({
          headings_title: !item.headings_title?.trim() ? "عنوان الزامی است." : null,
          headings_body: !item.headings_body?.trim() ? "متن الزامی است." : null,
        }));
        const nextProblemErrors = problems.map((item) => ({
          problem_title: !item.problem_title?.trim() ? "عنوان الزامی است." : null,
          problem_body: !item.problem_body?.trim() ? "متن الزامی است." : null,
        }));
        const nextPriorityErrors = priorities.map((item) => {
          const hasAny =
            String(item.phone || "").trim() ||
            String(item.call_no || "").trim() ||
            String(item.sms_no || "").trim();
          if (!hasAny) return { phone: null, call_no: null, sms_no: null };
          return {
            phone: !String(item.phone || "").trim() ? "نوع شماره الزامی است." : null,
            call_no: !String(item.call_no || "").trim()
              ? "تعداد تماس الزامی است."
              : null,
            sms_no: !String(item.sms_no || "").trim()
              ? "تعداد پیامک الزامی است."
              : null,
          };
        });

        setListErrors((prev) => ({
          ...prev,
          headings: nextHeadingErrors,
          problems: nextProblemErrors,
          priorities: nextPriorityErrors,
        }));
        nextErrors._listErrors = {
          headings: nextHeadingErrors,
          problems: nextProblemErrors,
          priorities: nextPriorityErrors,
        };
      }

      if (step === 2) {
        if (toNumberOrNull(form.call_duration) === null)
          nextErrors.call_duration = "مدت تماس الزامی است.";
      }

      if (step === 3) {
        if (!questions.length) {
          nextErrors.questions = "حداقل یک سوال اضافه کنید.";
        }
        questions.forEach((q, idx) => {
          if (!q.question?.trim()) {
            nextQuestionErrors[idx] = { question: "متن سوال الزامی است." };
          }
        });
      }

      setErrors(nextErrors);
      setQuestionErrors(nextQuestionErrors);

      const hasQuestionErrors = nextQuestionErrors.some(Boolean);
      const currentListErrors = nextErrors._listErrors || {
        headings: listErrors.headings || [],
        problems: listErrors.problems || [],
        priorities: listErrors.priorities || [],
      };
      const hasListErrors =
        (currentListErrors.headings || []).some(
          (item) => item?.headings_title || item?.headings_body
        ) ||
        (currentListErrors.problems || []).some(
          (item) => item?.problem_title || item?.problem_body
        ) ||
        (currentListErrors.priorities || []).some(
          (item) => item?.phone || item?.call_no || item?.sms_no
        );
      delete nextErrors._listErrors;
      return Object.keys(nextErrors).length === 0 && !hasQuestionErrors && !hasListErrors;
    },
    [form, headings, problems, priorities, questions, listErrors]
  );

  const handleNext = () => {
    if (!validateStep(activeTab)) return;
    const nextTab = activeTab + 1;
    setActiveTab(nextTab);
    setPassedSteps((prev) => (prev.includes(nextTab) ? prev : [...prev, nextTab]));
  };

  const handlePrev = () => {
    const prevTab = activeTab - 1;
    if (prevTab >= 1) setActiveTab(prevTab);
  };

  const normalizeApiErrors = (apiErrors) => {
    const next = {};
    Object.entries(apiErrors || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) next[key] = value[0];
      else if (typeof value === "string") next[key] = value;
      else next[key] = "خطا در مقداردهی";
    });
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validateStep(1)) {
      setActiveTab(1);
      return;
    }
    if (!validateStep(2)) {
      setActiveTab(2);
      return;
    }
    if (!validateStep(3)) {
      setActiveTab(3);
      return;
    }

    setLoading(true);
    try {
      const cleanedHeadings = headings
        .map((item) => buildHeading(item))
        .filter((item) => item.headings_title || item.headings_body);
      const cleanedProblems = problems
        .map((item) => buildProblem(item))
        .filter((item) => item.problem_title || item.problem_body);
      const cleanedPriorities = priorities
        .map((item) => buildPriority(item))
        .filter((item) => item.phone || item.call_no || item.sms_no);
      const cleanedQuestionHints = questionHints
        .map((item) => buildQuestionHint(item))
        .filter((item) => item.support_form_id && item.question_id);
      const cleanedParentTagShowLimit = parentTagShowLimit
        .map((item) => buildParentTagShowLimit(item))
        .filter((item) => item.parent_tag_id && item.tag_id);
      const cleanedParentTagQuestionAnswer = parentTagQuestionAnswer
        .map((item) => buildParentTagQuestionAnswer(item))
        .filter((item) => item.parent_tag_question_answer_id);

      const payload = {
        title: form.title.trim(),
        phone_number: form.phone_number?.trim() || null,
        start_at: toUnixSeconds(form.start_at),
        end_at: toUnixSeconds(form.end_at),
        stop_time: toNumberOrNull(form.stop_time),
        call_duration: toNumberOrNull(form.call_duration),
        headings: cleanedHeadings.length ? JSON.stringify(cleanedHeadings) : null,
        concurrent_calls: toNumberOrNull(form.concurrent_calls),
        waiting_call_duration: toNumberOrNull(form.waiting_call_duration),
        problems: cleanedProblems.length ? JSON.stringify(cleanedProblems) : null,
        priorities: JSON.stringify(cleanedPriorities),
        school_id: toNumberOrNull(form.school_id),
        grade_id: toNumberOrNull(form.grade_id),
        accepted_duration_time: toNumberOrNull(form.accepted_duration_time),
        accepted_allow_number_of_calls: toNumberOrNull(form.accepted_allow_number_of_calls),
        accepted_allow_number_of_calls_status: toNumberOrNull(
          form.accepted_allow_number_of_calls_status
        ),
        question_hint: JSON.stringify(cleanedQuestionHints),
        next_support_form_id: toNumberOrNull(form.next_support_form_id),
        parent_tag_show_limit: JSON.stringify(cleanedParentTagShowLimit),
        parent_tag_question_answer: JSON.stringify(cleanedParentTagQuestionAnswer),
        questions: questions.map((q) => ({
          ...(q.id ? { id: q.id } : {}),
          question: q.question,
          answer: q.answer || null,
          score: toNumberOrNull(q.score) ?? 0,
          required: !!q.required,
          title: q.title || null,
          type: toNumberOrNull(q.type) ?? 0,
          multi_choice: !!q.multi_choice,
          rtl: !!q.rtl,
          options: (q.options || []).map((opt) => ({
            ...(opt.id ? { id: opt.id } : {}),
            answer: opt.answer,
            is_correct: !!opt.is_correct,
          })),
        })),
      };

      if (isEdit) {
        await updateSupportForm(id, payload);
        setAlert({ type: "success", message: "فرم تماس با موفقیت ویرایش شد." });
      } else {
        await createSupportForm(payload);
        setAlert({ type: "success", message: "فرم تماس جدید با موفقیت ایجاد شد." });
      }

      setTimeout(() => {
        navigate("/support-forms");
      }, 800);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 422) {
        setErrors(normalizeApiErrors(e.response.data.errors));
      } else {
        setAlert({ type: "danger", message: "خطایی رخ داد. لطفاً دوباره تلاش کنید." });
      }
    } finally {
      setLoading(false);
    }
  };

  const schoolOptions = useMemo(
    () =>
      (schools || []).map((school) => ({
        value: school.id,
        label: school.name || school.title || `مدرسه ${school.id}`,
      })),
    [schools]
  );

  const gradeOptions = useMemo(
    () =>
      (grades || []).map((grade) => ({
        value: grade.id,
        label: grade.name || grade.title || `پایه ${grade.id}`,
      })),
    [grades]
  );

  const supportFormOptions = useMemo(
    () =>
      (supportForms || []).map((item) => ({
        value: item.id,
        label: item.title || `فرم ${item.id}`,
      })),
    [supportForms]
  );

  const parentTagOptions = useMemo(
    () =>
      (parentTags || []).map((item) => ({
        value: item.id,
        label: item.name || item.title || `تگ ${item.id}`,
      })),
    [parentTags]
  );

  const renderError = (field) =>
    errors[field] ? (
      <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
        {errors[field]}
      </div>
    ) : null;

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="فرم تماس"
          breadcrumbItem={isEdit ? "ویرایش فرم تماس" : "ایجاد فرم تماس"}
        />

        <Row>
          <Col lg="12">
            <Card>
              <CardHeader className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h4 className="card-title mb-1">
                    {isEdit ? "ویرایش فرم تماس" : "ایجاد فرم تماس جدید"}
                  </h4>
                  <p className="text-muted mb-0">
                    اطلاعات را مرحله‌به‌مرحله تکمیل و ثبت کنید.
                  </p>
                </div>
              </CardHeader>

              <CardBody>
                {alert && (
                  <Alert color={alert.type} className="mb-4">
                    {alert.message}
                  </Alert>
                )}

                <div className="wizard clearfix">
                  <div className="steps clearfix">
                    <ul>
                      <NavItem className={classnames({ current: activeTab === 1 })}>
                        <NavLink
                          className={classnames({ current: activeTab === 1 })}
                          onClick={() => setActiveTab(1)}
                          disabled={!(passedSteps || []).includes(1)}
                        >
                          <span className="number">1.</span> اطلاعات پایه
                        </NavLink>
                      </NavItem>
                      <NavItem className={classnames({ current: activeTab === 2 })}>
                        <NavLink
                          className={classnames({ active: activeTab === 2 })}
                          onClick={() => setActiveTab(2)}
                          disabled={!(passedSteps || []).includes(2)}
                        >
                          <span className="number">2.</span> تنظیمات تماس
                        </NavLink>
                      </NavItem>
                      <NavItem className={classnames({ current: activeTab === 3 })}>
                        <NavLink
                          className={classnames({ active: activeTab === 3 })}
                          onClick={() => setActiveTab(3)}
                          disabled={!(passedSteps || []).includes(3)}
                        >
                          <span className="number">3.</span> سوالات و گزینه‌ها
                        </NavLink>
                      </NavItem>
                    </ul>
                  </div>

                  <div className="content clearfix">
                    <TabContent activeTab={activeTab} className="body">
                      <TabPane tabId={1}>
                        <Form>
                          <Row className="g-3">
                            <Col md="6">
                              <FormGroup>
                                <Label for="title">عنوان فرم</Label>
                                <Input
                                  id="title"
                                  name="title"
                                  value={form.title}
                                  onChange={handleChange}
                                  placeholder="مثلاً فرم تماس پایه دهم"
                                  invalid={!!errors.title}
                                />
                                {renderError("title")}
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup>
                                <Label for="phone_number">شماره تماس <span className="text-muted">(اختیاری)</span></Label>
                                <Input
                                  id="phone_number"
                                  name="phone_number"
                                  value={form.phone_number}
                                  onChange={handleChange}
                                  placeholder="021xxxx"
                                />
                              </FormGroup>
                            </Col>

                            <Col md="6">
                              <FormGroup>
                                <Label for="school_id">مدرسه</Label>
                                <Input
                                  id="school_id"
                                  name="school_id"
                                  type="select"
                                  value={form.school_id}
                                  onChange={handleChange}
                                >
                                  <option value="">انتخاب مدرسه</option>
                                  {schoolOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </Input>
                              </FormGroup>
                            </Col>
                            <Col md="6">
                              <FormGroup>
                                <Label for="grade_id">پایه</Label>
                                <Input
                                  id="grade_id"
                                  name="grade_id"
                                  type="select"
                                  value={form.grade_id}
                                  onChange={handleChange}
                                  invalid={!!errors.grade_id}
                                >
                                  <option value="">انتخاب پایه</option>
                                  {gradeOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </Input>
                                {renderError("grade_id")}
                              </FormGroup>
                            </Col>

                            <Col md="12">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <Label className="mb-0">تیترهای اصلی</Label>
                                <Button
                                  type="button"
                                  color="light"
                                  size="sm"
                                  onClick={addListItem(setHeadings, buildHeading)}
                                >
                                  افزودن تیتر
                                </Button>
                              </div>
                              {headings.map((item, idx) => (
                                <Row key={`heading-${idx}`} className="g-2 align-items-end mb-2">
                                  <Col md="4">
                                    <FormGroup>
                                      <Label>عنوان تیتر</Label>
                                      <Input
                                        value={item.headings_title}
                                        onChange={(e) =>
                                          handleHeadingChange(
                                            idx,
                                            "headings_title",
                                            e.target.value
                                          )
                                        }
                                        invalid={!!listErrors.headings?.[idx]?.headings_title}
                                        placeholder="مثلاً تیتر اول"
                                      />
                                      {listErrors.headings?.[idx]?.headings_title && (
                                        <div className="text-danger mt-1">
                                          {listErrors.headings[idx].headings_title}
                                        </div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md="7">
                                    <FormGroup>
                                      <Label>متن تیتر</Label>
                                      <Input
                                        value={item.headings_body}
                                        onChange={(e) =>
                                          handleHeadingChange(
                                            idx,
                                            "headings_body",
                                            e.target.value
                                          )
                                        }
                                        invalid={!!listErrors.headings?.[idx]?.headings_body}
                                        placeholder="توضیحات تیتر"
                                      />
                                      {listErrors.headings?.[idx]?.headings_body && (
                                        <div className="text-danger mt-1">
                                          {listErrors.headings[idx].headings_body}
                                        </div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md="1" className="d-flex">
                                    <Button
                                      type="button"
                                      color="danger"
                                      outline
                                      className="mt-4"
                                      onClick={removeHeading(idx)}
                                      disabled={headings.length === 1}
                                    >
                                      حذف
                                    </Button>
                                  </Col>
                                </Row>
                              ))}
                            </Col>

                            <Col md="12" className="mt-3">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <Label className="mb-0">مشکلات فرم تماس</Label>
                                <Button
                                  type="button"
                                  color="light"
                                  size="sm"
                                  onClick={addListItem(setProblems, buildProblem)}
                                >
                                  افزودن مشکل
                                </Button>
                              </div>
                              {problems.map((item, idx) => (
                                <Row key={`problem-${idx}`} className="g-2 align-items-end mb-2">
                                  <Col md="4">
                                    <FormGroup>
                                      <Label>عنوان مشکل</Label>
                                      <Input
                                        value={item.problem_title}
                                        onChange={(e) =>
                                          handleProblemChange(
                                            idx,
                                            "problem_title",
                                            e.target.value
                                          )
                                        }
                                        invalid={!!listErrors.problems?.[idx]?.problem_title}
                                        placeholder="مثلاً مشکل اول"
                                      />
                                      {listErrors.problems?.[idx]?.problem_title && (
                                        <div className="text-danger mt-1">
                                          {listErrors.problems[idx].problem_title}
                                        </div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md="7">
                                    <FormGroup>
                                      <Label>متن مشکل</Label>
                                      <Input
                                        value={item.problem_body}
                                        onChange={(e) =>
                                          handleProblemChange(
                                            idx,
                                            "problem_body",
                                            e.target.value
                                          )
                                        }
                                        invalid={!!listErrors.problems?.[idx]?.problem_body}
                                        placeholder="توضیحات مشکل"
                                      />
                                      {listErrors.problems?.[idx]?.problem_body && (
                                        <div className="text-danger mt-1">
                                          {listErrors.problems[idx].problem_body}
                                        </div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md="1" className="d-flex">
                                    <Button
                                      type="button"
                                      color="danger"
                                      outline
                                      className="mt-4"
                                      onClick={removeProblem(idx)}
                                      disabled={problems.length === 1}
                                    >
                                      حذف
                                    </Button>
                                  </Col>
                                </Row>
                              ))}
                            </Col>

                            <Col md="12" className="mt-3">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <Label className="mb-0">اولویت‌بندی شماره تماس</Label>
                                <Button
                                  type="button"
                                  color="light"
                                  size="sm"
                                  onClick={addListItem(setPriorities, buildPriority)}
                                >
                                  افزودن اولویت
                                </Button>
                              </div>
                              {priorities.map((item, idx) => (
                                <Row key={`priority-${idx}`} className="g-2 align-items-end mb-2">
                                  <Col md="4">
                                    <FormGroup>
                                      <Label>نوع شماره</Label>
                                      <Input
                                        type="select"
                                        value={item.phone}
                                        onChange={(e) =>
                                          handlePriorityChange(idx, "phone", e.target.value)
                                        }
                                        invalid={!!listErrors.priorities?.[idx]?.phone}
                                      >
                                        <option value="">انتخاب کنید</option>
                                        <option value="1">شماره اول</option>
                                        <option value="2">شماره دوم</option>
                                        <option value="3">شماره سوم</option>
                                      </Input>
                                      {listErrors.priorities?.[idx]?.phone && (
                                        <div className="text-danger mt-1">
                                          {listErrors.priorities[idx].phone}
                                        </div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md="3">
                                    <FormGroup>
                                      <Label>تعداد تماس</Label>
                                      <Input
                                        type="number"
                                        value={item.call_no}
                                        onChange={(e) =>
                                          handlePriorityChange(idx, "call_no", e.target.value)
                                        }
                                        invalid={!!listErrors.priorities?.[idx]?.call_no}
                                      />
                                      {listErrors.priorities?.[idx]?.call_no && (
                                        <div className="text-danger mt-1">
                                          {listErrors.priorities[idx].call_no}
                                        </div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md="3">
                                    <FormGroup>
                                      <Label>تعداد پیامک</Label>
                                      <Input
                                        type="number"
                                        value={item.sms_no}
                                        onChange={(e) =>
                                          handlePriorityChange(idx, "sms_no", e.target.value)
                                        }
                                        invalid={!!listErrors.priorities?.[idx]?.sms_no}
                                      />
                                      {listErrors.priorities?.[idx]?.sms_no && (
                                        <div className="text-danger mt-1">
                                          {listErrors.priorities[idx].sms_no}
                                        </div>
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col md="2" className="d-flex">
                                    <Button
                                      type="button"
                                      color="danger"
                                      outline
                                      className="mt-4"
                                      onClick={removePriority(idx)}
                                      disabled={priorities.length === 1}
                                    >
                                      حذف
                                    </Button>
                                  </Col>
                                </Row>
                              ))}
                            </Col>

                            <Col md="12" className="mt-4">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <Label className="mb-0">اطلاعات سابق (راهنمای سوال)</Label>
                                <Button
                                  type="button"
                                  color="light"
                                  size="sm"
                                  onClick={addListItem(setQuestionHints, buildQuestionHint)}
                                >
                                  افزودن راهنما
                                </Button>
                              </div>
                              {questionHints.length === 0 && (
                                <p className="text-muted mb-0">
                                  در صورت نیاز، سوالات قبلی را اضافه کنید.
                                </p>
                              )}
                              {questionHints.map((item, idx) => (
                                <Row key={`hint-${idx}`} className="g-2 align-items-end mb-2">
                                  <Col md="5">
                                    <FormGroup>
                                      <Label>فرم تماس</Label>
                                      <Input
                                        type="select"
                                        value={item.support_form_id}
                                        onChange={(e) => {
                                          const nextValue = e.target.value;
                                          handleQuestionHintChange(
                                            idx,
                                            "support_form_id",
                                            nextValue
                                          );
                                          handleQuestionHintChange(idx, "question_id", "");
                                          loadSupportFormQuestions(nextValue);
                                        }}
                                      >
                                        <option value="">انتخاب فرم تماس</option>
                                        {supportFormOptions.map((opt) => (
                                          <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </option>
                                        ))}
                                      </Input>
                                    </FormGroup>
                                  </Col>
                                  <Col md="5">
                                    <FormGroup>
                                      <Label>سوال</Label>
                                      <Input
                                        type="select"
                                        value={item.question_id}
                                        onChange={(e) =>
                                          handleQuestionHintChange(
                                            idx,
                                            "question_id",
                                            e.target.value
                                          )
                                        }
                                        disabled={!item.support_form_id}
                                      >
                                        <option value="">انتخاب سوال</option>
                                        {(supportFormQuestions[item.support_form_id] || []).map(
                                          (q) => (
                                            <option key={q.id} value={q.id}>
                                              {q.question || q.title || `سوال ${q.id}`}
                                            </option>
                                          )
                                        )}
                                      </Input>
                                    </FormGroup>
                                  </Col>
                                  <Col md="2" className="d-flex">
                                    <Button
                                      type="button"
                                      color="danger"
                                      outline
                                      className="mt-4"
                                      onClick={removeListItem(setQuestionHints, idx)}
                                    >
                                      حذف
                                    </Button>
                                  </Col>
                                </Row>
                              ))}
                            </Col>

                            <Col md="12" className="mt-4">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <Label className="mb-0">نمایش تگ والد</Label>
                                <Button
                                  type="button"
                                  color="light"
                                  size="sm"
                                  onClick={addListItem(
                                    setParentTagShowLimit,
                                    buildParentTagShowLimit
                                  )}
                                >
                                  افزودن تگ
                                </Button>
                              </div>
                              {parentTagShowLimit.length === 0 && (
                                <p className="text-muted mb-0">
                                  اگر نیاز دارید تگ والد نمایش داده شود، اضافه کنید.
                                </p>
                              )}
                              {parentTagShowLimit.map((item, idx) => (
                                <Row key={`tagshow-${idx}`} className="g-2 align-items-end mb-2">
                                  <Col md="5">
                                    <FormGroup>
                                      <Label>سرتگ</Label>
                                      <Input
                                        type="select"
                                        value={item.parent_tag_id}
                                        onChange={(e) => {
                                          const nextValue = e.target.value;
                                          handleParentTagShowLimitChange(
                                            idx,
                                            "parent_tag_id",
                                            nextValue
                                          );
                                          handleParentTagShowLimitChange(idx, "tag_id", "");
                                          loadParentTagValues(nextValue);
                                        }}
                                      >
                                        <option value="">انتخاب سرتگ</option>
                                        {parentTagOptions.map((opt) => (
                                          <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </option>
                                        ))}
                                      </Input>
                                    </FormGroup>
                                  </Col>
                                  <Col md="5">
                                    <FormGroup>
                                      <Label>تگ</Label>
                                      <Input
                                        type="select"
                                        value={item.tag_id}
                                        onChange={(e) =>
                                          handleParentTagShowLimitChange(
                                            idx,
                                            "tag_id",
                                            e.target.value
                                          )
                                        }
                                        disabled={!item.parent_tag_id}
                                      >
                                        <option value="">انتخاب تگ</option>
                                        {(parentTagValues[item.parent_tag_id] || []).map(
                                          (tag) => (
                                            <option key={tag.id} value={tag.id}>
                                              {tag.value || tag.name || `تگ ${tag.id}`}
                                            </option>
                                          )
                                        )}
                                      </Input>
                                    </FormGroup>
                                  </Col>
                                  <Col md="2" className="d-flex">
                                    <Button
                                      type="button"
                                      color="danger"
                                      outline
                                      className="mt-4"
                                      onClick={removeListItem(setParentTagShowLimit, idx)}
                                    >
                                      حذف
                                    </Button>
                                  </Col>
                                </Row>
                              ))}
                            </Col>

                            <Col md="12" className="mt-4">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <Label className="mb-0">سوال سرتگی</Label>
                                <Button
                                  type="button"
                                  color="light"
                                  size="sm"
                                  onClick={addListItem(
                                    setParentTagQuestionAnswer,
                                    buildParentTagQuestionAnswer
                                  )}
                                >
                                  افزودن سرتگ
                                </Button>
                              </div>
                              {parentTagQuestionAnswer.length === 0 && (
                                <p className="text-muted mb-0">
                                  برای افزودن سرتگ‌های قابل انتخاب، از این بخش استفاده کنید.
                                </p>
                              )}
                              {parentTagQuestionAnswer.map((item, idx) => (
                                <Row key={`tagquestion-${idx}`} className="g-2 align-items-end mb-2">
                                  <Col md="10">
                                    <FormGroup>
                                      <Label>سرتگ</Label>
                                      <Input
                                        type="select"
                                        value={item.parent_tag_question_answer_id}
                                        onChange={(e) =>
                                          handleParentTagQuestionAnswerChange(
                                            idx,
                                            "parent_tag_question_answer_id",
                                            e.target.value
                                          )
                                        }
                                      >
                                        <option value="">انتخاب سرتگ</option>
                                        {parentTagOptions.map((opt) => (
                                          <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </option>
                                        ))}
                                      </Input>
                                    </FormGroup>
                                  </Col>
                                  <Col md="2" className="d-flex">
                                    <Button
                                      type="button"
                                      color="danger"
                                      outline
                                      className="mt-4"
                                      onClick={removeListItem(setParentTagQuestionAnswer, idx)}
                                    >
                                      حذف
                                    </Button>
                                  </Col>
                                </Row>
                              ))}
                            </Col>
                          </Row>
                        </Form>
                      </TabPane>

                      <TabPane tabId={2}>
                        <Form>
                          <Row className="g-3">
                            <Col md="4">
                              <FormGroup>
                                <Label for="start_at">تاریخ شروع <span className="text-muted">(اختیاری)</span></Label>
                                <DatePicker
                                  calendar={persian}
                                  locale={persian_fa}
                                  value={form.start_at}
                                  onChange={(date) =>
                                    setForm((prev) => ({
                                      ...prev,
                                      start_at: date ? moment(date.toDate()).startOf("day").toDate() : null,
                                    }))
                                  }
                                  format="YYYY/MM/DD"
                                  placeholder="تاریخ شروع"
                                  className="form-control"
                                  inputClass="form-control"
                                  calendarPosition="bottom-right"
                                />

                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup>
                                <Label for="end_at">تاریخ پایان <span className="text-muted">(اختیاری)</span></Label>
                                <DatePicker
                                  calendar={persian}
                                  locale={persian_fa}
                                  value={form.end_at}
                                  onChange={(date) =>
                                    setForm((prev) => ({
                                      ...prev,
                                      end_at: date ? moment(date.toDate()).endOf("day").toDate() : null,
                                    }))
                                  }
                                  format="YYYY/MM/DD"
                                  placeholder="تاریخ پایان"
                                  className="form-control"
                                  inputClass="form-control"
                                  calendarPosition="bottom-right"
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup>
                                <Label for="stop_time">زمان توقف <span className="text-muted">(اختیاری)</span></Label>
                                <Input
                                  id="stop_time"
                                  name="stop_time"
                                  type="number"
                                  value={form.stop_time}
                                  onChange={handleChange}
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup>
                                <Label for="call_duration">مدت تماس (ثانیه)</Label>
                                <Input
                                  id="call_duration"
                                  name="call_duration"
                                  type="number"
                                  value={form.call_duration}
                                  onChange={handleChange}
                                  invalid={!!errors.call_duration}
                                />
                                {renderError("call_duration")}
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup>
                                <Label for="concurrent_calls">تعداد تماس همزمان <span className="text-muted">(اختیاری)</span></Label>
                                <Input
                                  id="concurrent_calls"
                                  name="concurrent_calls"
                                  type="number"
                                  value={form.concurrent_calls}
                                  onChange={handleChange}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup>
                                <Label for="waiting_call_duration">
                                  مدت انتظار (ثانیه) <span className="text-muted">(اختیاری)</span>
                                </Label>
                                <Input
                                  id="waiting_call_duration"
                                  name="waiting_call_duration"
                                  type="number"
                                  value={form.waiting_call_duration}
                                  onChange={handleChange}
                                />
                              </FormGroup>
                            </Col>

                            <Col md="4">
                              <FormGroup>
                                <Label for="accepted_duration_time">
                                  حداقل زمان تایید (اختیاری)
                                </Label>
                                <Input
                                  id="accepted_duration_time"
                                  name="accepted_duration_time"
                                  type="number"
                                  value={form.accepted_duration_time}
                                  onChange={handleChange}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup>
                                <Label for="accepted_allow_number_of_calls">
                                  تعداد تماس مجاز (اختیاری)
                                </Label>
                                <Input
                                  id="accepted_allow_number_of_calls"
                                  name="accepted_allow_number_of_calls"
                                  type="number"
                                  value={form.accepted_allow_number_of_calls}
                                  onChange={handleChange}
                                />
                              </FormGroup>
                            </Col>
                            <Col md="4">
                              <FormGroup>
                                <Label for="accepted_allow_number_of_calls_status">
                                  وضعیت تایید تماس
                                </Label>
                                <Input
                                  id="accepted_allow_number_of_calls_status"
                                  name="accepted_allow_number_of_calls_status"
                                  type="select"
                                  value={form.accepted_allow_number_of_calls_status}
                                  onChange={handleChange}
                                >
                                  <option value={0}>هیچکدام</option>
                                  <option value={1}>
                                    اگر بیشتر از تعداد مجاز بود فقط پیام خطا نمایش داده شود
                                  </option>
                                  <option value={2}>
                                    اگر بیشتر از تعداد مجاز بود اجازه تماس داده نشود
                                  </option>
                                </Input>
                              </FormGroup>
                            </Col>

                            <Col md="6">
                              <FormGroup>
                                <Label for="next_support_form_id">
                                  فرم بعدی (اختیاری)
                                </Label>
                                <Input
                                  id="next_support_form_id"
                                  name="next_support_form_id"
                                  type="select"
                                  value={form.next_support_form_id}
                                  onChange={handleChange}
                                >
                                  <option value="">انتخاب فرم بعدی</option>
                                  {supportFormOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </Input>
                              </FormGroup>
                            </Col>
                          </Row>
                        </Form>
                      </TabPane>

                      <TabPane tabId={3}>
                        <Form onSubmit={handleSubmit}>
                          {errors.questions && (
                            <Alert color="danger">{errors.questions}</Alert>
                          )}

                          {questions.map((q, index) => (
                            <Card key={q.client_id} className="border mb-3">
                              <CardBody>
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                                  <h5 className="mb-0">سوال {index + 1}</h5>
                                  <Button
                                    type="button"
                                    color="danger"
                                    size="sm"
                                    onClick={() => handleRemoveQuestion(index)}
                                    disabled={questions.length === 1}
                                  >
                                    حذف سوال
                                  </Button>
                                </div>

                                <Row className="g-3">
                                  {q.id && q.code && (
                                    <Col md="4">
                                      <FormGroup>
                                        <Label>کد سوال (auto)</Label>
                                        <Input
                                          value={q.code}
                                          readOnly
                                          className="bg-light font-monospace"
                                        />
                                      </FormGroup>
                                    </Col>
                                  )}
                                  <Col md={q.id && q.code ? "8" : "12"}>
                                    <FormGroup>
                                      <Label>متن سوال</Label>
                                      <Input
                                        value={q.question}
                                        onChange={(e) =>
                                          handleQuestionChange(
                                            index,
                                            "question",
                                            e.target.value
                                          )
                                        }
                                        invalid={!!questionErrors[index]?.question}
                                        placeholder="متن سوال"
                                      />
                                      {questionErrors[index]?.question && (
                                        <div
                                          className="text-danger mt-1"
                                          style={{ fontSize: "0.85rem" }}
                                        >
                                          {questionErrors[index]?.question}
                                        </div>
                                      )}
                                    </FormGroup>
                                  </Col>

                                  <Col md="6">
                                    <FormGroup>
                                      <Label>عنوان (اختیاری)</Label>
                                      <Input
                                        value={q.title}
                                        onChange={(e) =>
                                          handleQuestionChange(index, "title", e.target.value)
                                        }
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col md="6">
                                    <FormGroup>
                                      <Label>پاسخ پیش‌فرض (اختیاری)</Label>
                                      <Input
                                        value={q.answer}
                                        onChange={(e) =>
                                          handleQuestionChange(index, "answer", e.target.value)
                                        }
                                      />
                                    </FormGroup>
                                  </Col>

                                  <Col md="3">
                                    <FormGroup>
                                      <Label>امتیاز</Label>
                                      <Input
                                        type="number"
                                        value={q.score}
                                        onChange={(e) =>
                                          handleQuestionChange(index, "score", e.target.value)
                                        }
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col md="3">
                                    <FormGroup>
                                      <Label>نوع</Label>
                                      <Input
                                        type="select"
                                        value={q.type}
                                        onChange={(e) =>
                                          handleQuestionChange(
                                            index,
                                            "type",
                                            Number(e.target.value)
                                          )
                                        }
                                      >
                                        <option value={0}>تشریحی</option>
                                        <option value={1}>چند گزینه ای</option>
                                        <option value={2}>لیست کشویی</option>
                                      </Input>
                                    </FormGroup>
                                  </Col>
                                  <Col md="3" className="d-flex align-items-center">
                                    <div
                                      className="form-check mt-4 support-form-question-check"
                                      role="button"
                                      tabIndex={0}
                                      onClick={() =>
                                        handleQuestionChange(index, "required", !q.required)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          handleQuestionChange(index, "required", !q.required);
                                        }
                                      }}
                                    >
                                      <input
                                        id={`question-required-${index}`}
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={!!q.required}
                                        readOnly
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`question-required-${index}`}
                                      >
                                        اجباری
                                      </label>
                                    </div>
                                  </Col>
                                  <Col md="3" className="d-flex align-items-center">
                                    <div
                                      className="form-check mt-4 support-form-question-check"
                                      role="button"
                                      tabIndex={0}
                                      onClick={() =>
                                        handleQuestionChange(
                                          index,
                                          "multi_choice",
                                          !q.multi_choice
                                        )
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          handleQuestionChange(
                                            index,
                                            "multi_choice",
                                            !q.multi_choice
                                          );
                                        }
                                      }}
                                    >
                                      <input
                                        id={`question-multi-${index}`}
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={!!q.multi_choice}
                                        readOnly
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`question-multi-${index}`}
                                      >
                                        چندگزینه‌ای
                                      </label>
                                    </div>
                                  </Col>
                                  <Col md="3" className="d-flex align-items-center">
                                    <div
                                      className="form-check mt-4 support-form-question-check"
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => handleQuestionChange(index, "rtl", !q.rtl)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          handleQuestionChange(index, "rtl", !q.rtl);
                                        }
                                      }}
                                    >
                                      <input
                                        id={`question-rtl-${index}`}
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={!!q.rtl}
                                        readOnly
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`question-rtl-${index}`}
                                      >
                                        راست‌به‌چپ
                                      </label>
                                    </div>
                                  </Col>
                                </Row>

                                <div className="mt-4">
                                  <div className="d-flex align-items-center justify-content-between mb-2">
                                    <h6 className="mb-0">گزینه‌ها</h6>
                                    <Button
                                      type="button"
                                      size="sm"
                                      color="light"
                                      onClick={() => handleAddOption(index)}
                                    >
                                      افزودن گزینه
                                    </Button>
                                  </div>
                                  {q.options.length === 0 && (
                                    <p className="text-muted mb-0">
                                      گزینه‌ای ثبت نشده است.
                                    </p>
                                  )}
                                  {q.options.map((opt, optIndex) => (
                                    <Row key={opt.client_id} className="g-2 align-items-end">
                                      <Col md="8">
                                        <FormGroup>
                                          <Label>متن گزینه</Label>
                                          <Input
                                            value={opt.answer}
                                            onChange={(e) =>
                                              handleOptionChange(
                                                index,
                                                optIndex,
                                                "answer",
                                                e.target.value
                                              )
                                            }
                                          />
                                        </FormGroup>
                                      </Col>
                                      <Col md="2">
                                        <FormGroup check className="mt-4">
                                          <Input
                                            type="checkbox"
                                            checked={!!opt.is_correct}
                                            onChange={(e) =>
                                              handleOptionChange(
                                                index,
                                                optIndex,
                                                "is_correct",
                                                e.target.checked
                                              )
                                            }
                                          />
                                          <Label check>درست</Label>
                                        </FormGroup>
                                      </Col>
                                      <Col md="2" className="d-flex">
                                        <Button
                                          type="button"
                                          color="danger"
                                          className="mt-2"
                                          onClick={() => handleRemoveOption(index, optIndex)}
                                        >
                                          حذف
                                        </Button>
                                      </Col>
                                    </Row>
                                  ))}
                                </div>
                              </CardBody>
                            </Card>
                          ))}

                          <Button type="button" color="light" onClick={handleAddQuestion}>
                            افزودن سوال جدید
                          </Button>
                        </Form>
                      </TabPane>
                    </TabContent>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <div>
                      {activeTab > 1 && (
                        <Button type="button" color="secondary" onClick={handlePrev}>
                          مرحله قبل
                        </Button>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      {activeTab < 3 && (
                        <Button type="button" color="primary" onClick={handleNext}>
                          مرحله بعد
                        </Button>
                      )}
                      {activeTab === 3 && (
                        <>
                          <Button
                            type="button"
                            color="secondary"
                            onClick={() => navigate("/support-forms")}
                          >
                            انصراف
                          </Button>
                          <Button
                            type="button"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={loading}
                          >
                            {loading ? "در حال ذخیره..." : isEdit ? "ویرایش فرم" : "ثبت فرم"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SupportFormForm;
