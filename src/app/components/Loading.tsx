"use client";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="flex space-x-2">
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></span>
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce200"></span>
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce400"></span>
      </div>
    </div>
  );
}
