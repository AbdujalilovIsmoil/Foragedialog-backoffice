import { usePost } from "@/hooks";
import { storage } from "@/services";
import { toast } from "react-toastify";
import styled from "styled-components";
import { Form, Input, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@/assets/antd-design-icons";

const { Title } = Typography;

const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
`;

const Card = styled.div`
  background: #fff;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  text-align: center;
`;

const StyledFormButton = styled.button`
  width: 100%;
  background-color: #667eea;
  color: #fff;
  font-weight: bold;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #5a67d8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StyledInput = styled(Input)`
  border-radius: 8px;
  padding: 10px;
`;

const SignIn = () => {
  const navigate = useNavigate();

  interface loginInterface {
    email: string;
    password: string;
  }

  interface successContent {
    id: number;
    role: string;
    email: string;
    token: string;
    password: string;
    userName: string;
    isSigned: boolean;
  }

  interface successData {
    id: string;
    code: number;
    content: successContent;
    error: null | undefined;
    token: string;
    total: null | undefined;
    modelStateError: null | undefined;
  }

  const toastProperties = {
    pauseOnHover: false,
  };

  const { mutate, isPending } = usePost({
    queryKey: ["login"],
    path: "/Auth/Login",
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message, toastProperties);
      }
    },
    onSuccess: (data: unknown) => {
      const typeData = data as successData;
      const { userName } = typeData.content;
      const privateData = { userName, id: typeData.id };

      // storage.set("token", privateData.token);

      console.log(data);

      toast.success("You have logged in!", toastProperties);

      setTimeout(() => {
        storage.set("data", privateData);
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
