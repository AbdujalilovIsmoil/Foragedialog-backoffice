import { get } from "lodash";
import { api } from "@/services"; // sizning axios instance
import { useQuery } from "@tanstack/react-query";

interface typeUseGet {
  path?: string;
  queryKey: string;
}

const useGet = ({ path = "/", queryKey }: typeUseGet) => {
  const data = useQuery({
    queryKey: [queryKey],
    staleTime: 1000 * 60 * 6, // 6 daqiqa
    queryFn: () =>
      api.get(path).then((response) => get(response, "data.content")),
  });

  return data;
};

export default useGet;
