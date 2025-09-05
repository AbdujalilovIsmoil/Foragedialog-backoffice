const storage = {
  set: (key: string, value: any) => {
    if (!value || value.length <= 0) return;

    if (key && value) {
      if (typeof value === "string") {
        return window.localStorage.setItem(key, value);
      } else {
        return window.localStorage.setItem(key, JSON.stringify(value));
      }
    }
  },
  get: (key: string) => {
    if (key) {
      return localStorage.getItem(key) as string;
    }
  },
  remove: (key: string) => {
    if (key) {
      return window.localStorage.removeItem(key);
    }
  },
  key: (index: number | string) => {
    if (typeof index !== "number") {
      return window.localStorage.key(Number(index));
    }

    if (typeof index === "number") {
      return window.localStorage.key(index);
    }
  },
  length: () => {
    return window.localStorage.length;
  },
  clear: () => {
    return window.localStorage.clear();
  },
};

export default storage;
