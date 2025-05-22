import React from "react";
import ReactMarkdown from "react-markdown";

export default function Summary({ title = "Resumo de hoje", summary }) {
  if (!summary) {
    return null;
  }
  return (
    <div className="summary">
      <h2>{title}</h2>
      <blockquote>
        <ReactMarkdown>{summary}</ReactMarkdown>
      </blockquote>
    </div>
  );
}