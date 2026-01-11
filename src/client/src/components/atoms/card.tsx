import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`flex justify-between flex-1 p-2.5 shadow-md rounded-xl ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
