import type { InputProps } from "antd";
import { Input as AntdInput } from "antd";

const Input = (props: InputProps) => {
  return <AntdInput {...props} />;
};

export default Input;
