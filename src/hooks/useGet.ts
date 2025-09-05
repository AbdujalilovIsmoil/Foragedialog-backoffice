import { get } from "lodash";
import { api } from "@/services";
import { useQuery } from "@tanstack/react-query";

type typeUseGet = {
  path: string;
  queryKey: string;
};

const useGet = ({ path = "/", queryKey }: typeUseGet) => {
  const data = useQuery({
    queryKey: [queryKey],
    gcTime: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 6,
    queryFn: () =>
      api.get(path).then((response) => get(response, "data.content")),
  });

  return data;
};

export default useGet;
