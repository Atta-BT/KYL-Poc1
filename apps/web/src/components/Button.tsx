import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: ReactNode;
};

export const Button = ({
  children,
  className = "",
  icon,
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) => (
  <button
    className={`button button--${variant} ${className}`}
    type={type}
    {...props}
  >
    {icon ? <span className="button__icon">{icon}</span> : null}
    {children ? <span>{children}</span> : null}
  </button>
);

