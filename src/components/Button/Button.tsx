import type { ButtonProps } from "antd";
import { Button as AntdButton } from "antd";

interface Ibutton extends ButtonProps {
  children: React.ReactNode;
}

const Button = ({ children, ...props }: Partial<Ibutton>) => {
  return <AntdButton {...props}>{children}</AntdButton>;
};

export default Button;
