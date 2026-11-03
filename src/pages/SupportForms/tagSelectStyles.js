export const TAG_SELECT_STYLES = {
  control: (base, state) => ({
    ...base,
    minHeight: 48,
    backgroundColor: "#fff",
    borderColor: state.isFocused ? "#556ee6" : "#ced4da",
    boxShadow: state.isFocused ? "0 0 0 1px #556ee6" : "none",
    ":hover": { borderColor: state.isFocused ? "#556ee6" : "#adb5bd" },
  }),
  valueContainer: (base) => ({ ...base, padding: "6px 12px" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.16)",
    overflow: "hidden",
  }),
  menuList: (base) => ({ ...base, backgroundColor: "#fff", padding: 6, maxHeight: 280 }),
  option: (base, state) => ({
    ...base,
    cursor: "pointer",
    borderRadius: 6,
    marginBottom: 2,
    color: state.isSelected ? "#fff" : "#343a40",
    backgroundColor: state.isSelected ? "#556ee6" : state.isFocused ? "#f1f4ff" : "#fff",
    ":active": { backgroundColor: state.isSelected ? "#485ec4" : "#e7ebff" },
  }),
  noOptionsMessage: (base) => ({ ...base, backgroundColor: "#fff", color: "#74788d" }),
  loadingMessage: (base) => ({ ...base, backgroundColor: "#fff", color: "#74788d" }),
};

