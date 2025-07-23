import notify from "@/lib/notify";
import { ResponseApi } from "@/models/response";
import { AxiosError } from "axios";

export default function handleErrorResponse(
  error: unknown,
  notifyId?: string | number
) {
  let errorMessage = "Terjadi kesalahan tidak terduga";

  if (error instanceof AxiosError) {
    if (error.response?.data) {
      const responseData = error.response.data;
      if (typeof responseData === "object") {
        errorMessage =
          (responseData as ResponseApi).message ||
          (responseData as { error?: string }).error ||
          errorMessage;
      } else if (typeof responseData === "string") {
        errorMessage = responseData;
      }
    } else if (error.request) {
      errorMessage = "Tidak dapat terhubung ke server";
    } else {
      errorMessage = error.message || errorMessage;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message || errorMessage;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return notify.error(errorMessage, notifyId);
}
