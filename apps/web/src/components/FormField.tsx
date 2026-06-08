import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
};

export const FormField = ({
  label,
  htmlFor,
  error,
  children
}: FormFieldProps) => (
  <div className="form-field">
    <label htmlFor={htmlFor}>{label}</label>
    {children}
    {error ? <p className="form-field__error">{error}</p> : null}
  </div>
);

