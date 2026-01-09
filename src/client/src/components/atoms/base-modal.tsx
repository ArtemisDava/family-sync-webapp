import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BaseModal({
  open,
  onClose,
  title,
  children,
}: BaseModalProps) {
  return (
    <Dialog className="bg-[#0F0F0F80]" onClose={onClose} open={open}>
      <div
        className="
      w-full  max-w-[560px] sm:min-w-[560px] 
      h-auto  py-9 md:py-18 px-4 sm:px-6  lg:px-8 
       mx-auto flex flex-wrap justify-center 
      flex-row gap-4"
        style={{ minHeight: "400px" }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "2rem",
          }}
          className="text-4xl font-bold w-full text-center mb-4"
        >
          {title}
        </DialogTitle>
        {children}
      </div>
    </Dialog>
  );
}
