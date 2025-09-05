import { usePost } from "@/hooks";
import { Form, Input } from "antd";
import { storage } from "@/services";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginForm, LoginFormButton, LoginFormContainer } from "./style";

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
    total: null | undefined;
    modelStateError: null | undefined;
  }

  const toastProperties = {
    pauseOnHover: false,
  };

  const { mutate } = usePost({
    queryKey: "login",
    path: "/Auth/Login",
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message, toastProperties);
      }
    },
    onSuccess: (data: unknown) => {
      const typeData = data as successData;
      const { token, userName } = typeData.content;
      const privateData = {
        token,
        userName,
        id: typeData.id,
      };

      toast.success("You have registered", toastProperties);

      setTimeout(() => {
        storage.set("data", privateData);
        navigate("/");
      }, 2000);
    },
  });

  return (
    <LoginFormContainer>
      <LoginForm>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true,
          }}
          onFinish={(values: loginInterface) => mutate(values)}
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your Username!",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Login"
              prefix={<UserOutlined className="site-form-item-icon" />}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input
              size="large"
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <LoginFormButton size="large" type="primary" htmlType="submit">
              Log in
            </LoginFormButton>
          </Form.Item>
        </Form>
      </LoginForm>
    </LoginFormContainer>
  );
};

export default SignIn;
