import { FetchJsonResponse } from "./types/fetch-json-response";

async function wrapperFetchJsonResponse<T>(
  response: Response
): Promise<FetchJsonResponse<T>> {
  const status = response.status as FetchJsonResponse<T>["status"];
  return {
    status,
    res: await response.json(),
  };
}

export default wrapperFetchJsonResponse;
