export interface ApiResponse<T> {
  success: boolean;
  errorMessage?: string | null | undefined;
  data?: T;
}

export const createResponse = <T>(
  data: T,
  success = true,
  errorMessage: string | null | undefined = null
): ApiResponse<T> => ({
  success,
  errorMessage,
  data
});
