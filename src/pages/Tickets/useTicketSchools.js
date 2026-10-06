import { useCallback, useEffect, useState } from "react";
import { getSchools } from "../../services/schoolService.jsx";

const STORAGE_KEY = "tickets:last-school-id";

export default function useTicketSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSchools({ page: 1, limit: 200 })
      .then(({ items }) => { if (active) setSchools(items || []); })
      .catch(() => { if (active) setSchools([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const validSavedSchoolId = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return schools.some((school) => String(school.id) === saved) ? saved : "";
  }, [schools]);
  const rememberSchool = useCallback((id) => {
    if (schools.some((school) => String(school.id) === String(id))) localStorage.setItem(STORAGE_KEY, String(id));
  }, [schools]);

  return { schools, loading, validSavedSchoolId, rememberSchool };
}
