import { usePost } from "@/hooks";
import { storage } from "@/services";
import { toastAlert } from "@/helpers";
import { Form, Typography } from "antd";
import type { loginInterface } from "@/types";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@/assets/antd-design-icons";
import { Card, Container, StyledFormButton, StyledInput } from "./style";

const { Title } = Typography;

const SignIn = () => {
  const navigate = useNavigate();

  interface successContent extends loginInterface {
    role: string;
    email: string;
    password: string;
    isSigned: boolean;
  }

  interface successData extends loginInterface {
    code: number;
    content: successContent;
    error: null | undefined;
    total: null | undefined;
    modelStateError: null | undefined;
  }

  const { mutate, isPending } = usePost({
    queryKey: ["login"],
    path: "/Auth/Login",
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toastAlert({ typeInfo: "error", content: "Ro'yxatdan o'ting" });
      }
    },
    onSuccess: (data: unknown) => {
      const typeData = data as successData;

      const { userName, token } = typeData.content;
      const privateData = { userName, id: typeData.id };

      storage.set("token", token);

      storage.set("data", privateData);
      toastAlert({ typeInfo: "success", content: "You have logged in!" });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    },
  });

  return (
    <Container>
      <Card>
        <Title level={2} style={{ marginBottom: 24, color: "#333" }}>
          Sign In
        </Title>
        <Form
          name="login_form"
          layout="vertical"
          onFinish={(values: loginInterface) => mutate(values)}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please enter your email!" }]}
          >
            <StyledInput
              size="large"
              placeholder="Email"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <StyledInput
              size="large"
              type="password"
              placeholder="Password"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item>
            <StyledFormButton type="submit" disabled={isPending}>
              {isPending ? "Logging in..." : "Log In"}
            </StyledFormButton>
          </Form.Item>
        </Form>
      </Card>
    </Container>
  );
};

export default SignIn;
