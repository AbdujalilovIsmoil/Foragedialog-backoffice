const storage = {
  set: (key: string, value: any) => {
    if (!value || value.length <= 0) return;

    if (key && value) {
      if (typeof value === "string") {
        return window.sessionStorage.setItem(key, value);
      } else {
        return window.sessionStorage.setItem(key, JSON.stringify(value));
      }
    }
  },
  get: (key: string) => {
    if (key) {
      return window.sessionStorage.getItem(key) as string;
    }
  },
  remove: (key: string) => {
    if (key) {
      return window.sessionStorage.removeItem(key);
    }
  },
  key: (index: number | string) => {
    if (typeof index !== "number") {
      return window.sessionStorage.key(Number(index));
    }

    if (typeof index === "number") {
      return window.sessionStorage.key(index);
    }
  },
  length: () => {
    return window.sessionStorage.length;
  },
  clear: () => {
    return window.sessionStorage.clear();
  },
};

export default storage;
