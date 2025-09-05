import { get } from "lodash";
import { api } from "@/services";
import { toast } from "react-toastify";
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
  const queryClient = useQueryClient();

  const response = useMutation({
    mutationFn: (data: unknown) => {
      return api.post(path, data).then((response) => {
        return get(response, "data");
      });
    },
    onError: (error) => {
      onError(error);
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
