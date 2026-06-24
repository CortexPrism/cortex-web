import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MdxContentProps {
  content: string;
}

function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function MdxContent({ content }: MdxContentProps) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-[#e2e2ea] prose-p:text-[#9090a8] prose-a:text-indigo-400 prose-strong:text-[#e2e2ea] prose-code:text-[#e2e2ea] prose-pre:bg-[#111118] prose-pre:border prose-pre:border-[rgba(255,255,255,0.07)] prose-pre:rounded-xl prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => {
            const text = String(children);
            return <h1 id={headingId(text)} {...props}>{children}</h1>;
          },
          h2: ({ children, ...props }) => {
            const text = String(children);
            return <h2 id={headingId(text)} {...props}>{children}</h2>;
          },
          h3: ({ children, ...props }) => {
            const text = String(children);
            return <h3 id={headingId(text)} {...props}>{children}</h3>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
