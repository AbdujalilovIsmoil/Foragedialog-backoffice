import { Button } from "antd";
import styled from "styled-components";
import { Link } from "react-router-dom";

export const LoginFormContainer = styled.section`
  display: flex;
  padding: 0 20px;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-image: linear-gradient(
    -29.5deg,
    #2e86e4ff 50%,
    white 50%
  );
`;

export const LoginForm = styled.div`
  width: 500px;
`;

export const LoginFormForgot = styled(Link)`
  float: right;
`;

export const LoginFormButton = styled(Button)`
  width: 100%;
`;
