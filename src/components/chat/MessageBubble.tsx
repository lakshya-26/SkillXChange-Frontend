import React from "react";
import clsx from "clsx";
import { format } from "date-fns";

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  createdAt: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  isOwn,
  createdAt,
}) => {
  return (
    <div
      className={clsx(
        "flex w-full mb-4",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "max-w-[70%] px-4 py-2 rounded-2xl shadow-sm",
          isOwn
            ? "bg-blue-600 text-white rounded-tr-none"
            : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        <span
          className={clsx(
            "text-[10px] mt-1 block w-full text-right",
            isOwn ? "text-blue-100" : "text-gray-400"
          )}
        >
          {format(new Date(createdAt), "h:mm a")}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
