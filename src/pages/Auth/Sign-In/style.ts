import { Button, Input } from "antd";
import styled from "styled-components";
import { Link } from "react-router-dom";

export const LoginFormContainer = styled.section`
  display: flex;
  padding: 0 20px;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-image: linear-gradient(-29.5deg, #2e86e4ff 50%, white 50%);
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

export const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
`;

export const Card = styled.div`
  background: #fff;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  text-align: center;
`;

export const StyledFormButton = styled.button`
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

export const StyledInput = styled(Input)`
  border-radius: 8px;
  padding: 10px;
`;
