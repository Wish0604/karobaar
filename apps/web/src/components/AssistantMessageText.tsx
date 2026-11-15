import React from "react";

export function stripAssistantMarkup(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ""))
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(?<!\*)\*(?!\s)(.*?)(?<!\s)\*(?!\*)/g, "$1")
    .replace(/(?<!_)_(?!\s)(.*?)(?<!\s)_(?!_)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+[.)]\s+/gm, "• ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function renderInline(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*.*?\*\*|__.*?__|`.*?`|\*[^*\n]+\*|_[^_\n]+_)/g).filter(Boolean);
  return tokens.map((token, index) => {
    if ((token.startsWith("**") && token.endsWith("**")) || (token.startsWith("__") && token.endsWith("__"))) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={index}>{token.slice(1, -1)}</code>;
    }
    if ((token.startsWith("*") && token.endsWith("*")) || (token.startsWith("_") && token.endsWith("_"))) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    return <React.Fragment key={index}>{token}</React.Fragment>;
  });
}

export const AssistantMessageText: React.FC<{ text: string }> = ({ text }) => (
  <span className="assistant-message-text">
    {stripAssistantMarkup(text).split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {renderInline(line)}
        {index < stripAssistantMarkup(text).split("\n").length - 1 && <br />}
      </React.Fragment>
    ))}
  </span>
);
