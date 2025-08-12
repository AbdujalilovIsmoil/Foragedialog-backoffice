import { styled } from "styled-components";

interface LayoutProps {
  padding: string;
  minHeight: string;
  borderRadius: number;
  backgroundColor: string;
}

export const Layout = styled.div<Partial<LayoutProps>>`
  width: 100%;
  padding: ${({ padding }) => padding};
  min-height: ${({ minHeight }) => minHeight};
  border-radius: ${({ borderRadius }) => borderRadius}px;
  background-color: ${({ backgroundColor }) => backgroundColor};
`;
