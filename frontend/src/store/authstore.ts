type AuthValue = string | number | boolean | object | null | undefined;

const getValue = (key: string): AuthValue => {
  if (key === "backend_api") {
    return import.meta.env.VITE_BACKEND_API_URL as string;
  }
  const item = sessionStorage.getItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item) as AuthValue;
  } catch {
    return item;
  }
};

const setValue = (key: string, value: AuthValue) => {
  if (value === null || value === undefined) {
    sessionStorage.removeItem(key);
  } else {
    const toSave =
      typeof value === "object" ? JSON.stringify(value) : (value as string);
    sessionStorage.setItem(key, toSave);
  }
};

export const get = {
  useAuth: (key: string) => {
    return getValue(key);
  },
};

export const set = {
  useAuth: (key: string, value: AuthValue) => {
    setValue(key, value);
    return value;
  },
};
