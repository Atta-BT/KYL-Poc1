import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  message: string;
};

export const EmptyState = ({ title, message }: EmptyStateProps) => (
  <div className="empty-state">
    <Inbox size={32} aria-hidden="true" />
    <h2>{title}</h2>
    <p>{message}</p>
  </div>
);

