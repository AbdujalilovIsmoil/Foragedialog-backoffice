import { get } from "lodash";
import { api } from "@/services";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type typeUsePost = {
  path: string;
  queryKey: string[];
  successText?: string;
  onError?: (data: unknown) => void;
  onSuccess?: (data: unknown) => void;
};

const usePost = ({
  path,
  queryKey,
  successText,
  onError = () => {},
  onSuccess = () => {},
}: typeUsePost) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const response = useMutation({
    mutationFn: async (data: unknown) => {
      const response = await api.put(path, data);
      return get(response, "data");
    },
    onError: (error: any) => {
      const location = useLocation();
      const language = location.pathname.split("/")[1];
      onError(error);
      if (error.status === 401) {
        navigate(`${language}/pages/sign-in`);
      }
      if (error instanceof Error) {
        toast.error(error.message, { pauseOnHover: false });
      }
    },
    onSuccess: (successData) => {
      toast.success(successText, { pauseOnHover: false });

      queryClient.invalidateQueries({
        exact: true,
        queryKey: queryKey,
      });
      onSuccess(successData);
    },
  });
  return response;
};

export default usePost;
