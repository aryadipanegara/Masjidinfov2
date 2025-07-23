export interface ResponseApi {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: string[];
}
