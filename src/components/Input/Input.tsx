import { Input as AntdInput } from "antd";
import type { InputProps } from "antd";

function Input(props: InputProps) {
  return <AntdInput {...props} />;
}

export default Input;
