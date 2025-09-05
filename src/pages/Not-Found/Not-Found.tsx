import { Button, Result } from "antd";
import { NotFoundSection } from "./style";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <NotFoundSection>
      <Result
        title="404"
        status="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button
            type="primary"
            onClick={() =>
              navigate({
                pathname: "/",
              })
            }
          >
            Back Home
          </Button>
        }
      />
    </NotFoundSection>
  );
};

export default NotFound;
