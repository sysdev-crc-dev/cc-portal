import HTTP_CODES_ENUM from "./http-codes";
import { ValidationErrors } from "./validation-errors";

export type FetchJsonResponse<T> =
  | { status: HTTP_CODES_ENUM.OK | HTTP_CODES_ENUM.CREATED; res: T }
  | { status: HTTP_CODES_ENUM.NO_CONTENT; res: undefined }
  | {
      status: HTTP_CODES_ENUM.INTERNAL_SERVER_ERROR;
      res: undefined;
    }
  | {
      status: HTTP_CODES_ENUM.BAD_REQUEST;
      res: ValidationErrors;
    };
