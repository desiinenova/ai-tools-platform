/** The shape of every FormRequest's 422 validation-failure body. */
export interface ValidationErrorBody {
  message: string;
  errors: Record<string, string[]>;
}
