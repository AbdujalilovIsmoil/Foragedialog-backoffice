import { toast } from "react-toastify";
import type { ToastOptions } from "react-toastify";

interface toastInterface extends ToastOptions {
  content: string;
  typeInfo: "success" | "error";
}

const toastAlert = (props: toastInterface) => {
  toast[props.typeInfo](props.content, { pauseOnHover: false });
};

export default toastAlert;
