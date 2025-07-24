import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Button } from "@heroui/react";
import { RiFileCopyLine, RiCheckLine } from "react-icons/ri";
import { useState } from "react";
import { copyToClipboard } from "@/utils/password";
import { toast } from "sonner";

// 代码块组件
interface CodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className,
  inline,
}) => {
  const [copied, setCopied] = useState(false);

  // 提取语言
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  const handleCopy = async () => {
    const success = await copyToClipboard(children);
    if (success) {
      setCopied(true);
      toast.success("代码已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("复制失败");
    }
  };

  if (inline) {
    return (
      <code className="bg-default-100 text-primary px-1 py-0.5 rounded text-xs font-mono">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-2">
      <div className="flex items-center justify-between bg-default-100 px-3 py-1.5 rounded-t-lg border-b border-divider/20">
        <span className="text-xs text-foreground/60 font-mono">
          {language || "code"}
        </span>
        <Button
          size="sm"
          variant="light"
          isIconOnly
          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 min-w-6"
          onPress={handleCopy}
        >
          {copied ? (
            <RiCheckLine className="w-3 h-3 text-success" />
          ) : (
            <RiFileCopyLine className="w-3 h-3" />
          )}
        </Button>
      </div>
      <pre className="bg-default-50 p-3 rounded-b-lg overflow-x-auto text-xs">
        <code className={`language-${language}`}>{children}</code>
      </pre>
    </div>
  );
};

// 表格组件
const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="overflow-x-auto my-2">
    <table className="min-w-full border-collapse border border-divider/20 rounded-lg text-xs">
      {children}
    </table>
  </div>
);

const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-default-100">{children}</thead>
);

const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="border-b border-divider/20 hover:bg-default-50/50">
    {children}
  </tr>
);

const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td className="px-2 py-1 text-xs">{children}</td>
);

const TableHeaderCell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <th className="px-2 py-1 text-left text-xs font-medium text-foreground">
    {children}
  </th>
);

// 引用块组件
const Blockquote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <blockquote className="border-l-3 border-primary/30 pl-3 py-1 my-2 bg-primary/5 rounded-r-lg">
    <div className="text-foreground/80 italic text-sm">{children}</div>
  </blockquote>
);

// 链接组件
const Link: React.FC<{ href?: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
  >
    {children}
  </a>
);

// 列表组件
const List: React.FC<{ ordered?: boolean; children: React.ReactNode }> = ({
  ordered,
  children,
}) => {
  const Component = ordered ? "ol" : "ul";
  return (
    <Component
      className={`my-2 pl-4 space-y-0.5 text-sm ${ordered ? "list-decimal" : "list-disc"}`}
    >
      {children}
    </Component>
  );
};

const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="text-foreground/90 leading-relaxed">{children}</li>
);

// 标题组件
const Heading: React.FC<{ level: number; children: React.ReactNode }> = ({
  level,
  children,
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  const sizes = {
    1: "text-lg font-bold mt-3 mb-2",
    2: "text-base font-semibold mt-3 mb-2",
    3: "text-sm font-medium mt-2 mb-1",
    4: "text-sm font-medium mt-2 mb-1",
    5: "text-xs font-medium mt-1 mb-1",
    6: "text-xs font-medium mt-1 mb-1",
  };

  return (
    <Component
      className={`text-foreground ${sizes[level as keyof typeof sizes] || sizes[6]}`}
    >
      {children}
    </Component>
  );
};

// 分隔线组件
const HorizontalRule: React.FC = () => (
  <hr className="my-3 border-divider/30" />
);

// 段落组件
const Paragraph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-foreground/90 leading-relaxed my-1 text-sm">{children}</p>
);

// Markdown渲染器属性
interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 主要的Markdown渲染器组件
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  return (
    <div
      className={`prose prose-sm max-w-none text-sm leading-relaxed ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          code: ({ node, className, children, ...props }) => (
            <CodeBlock className={className} {...props}>
              {String(children).replace(/\n$/, "")}
            </CodeBlock>
          ),
          table: ({ children }) => <Table>{children}</Table>,
          thead: ({ children }) => <TableHead>{children}</TableHead>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          td: ({ children }) => <TableCell>{children}</TableCell>,
          th: ({ children }) => <TableHeaderCell>{children}</TableHeaderCell>,
          blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
          a: ({ href, children }) => <Link href={href}>{children}</Link>,
          ul: ({ children }) => <List>{children}</List>,
          ol: ({ children }) => <List ordered>{children}</List>,
          li: ({ children }) => <ListItem>{children}</ListItem>,
          h1: ({ children }) => <Heading level={1}>{children}</Heading>,
          h2: ({ children }) => <Heading level={2}>{children}</Heading>,
          h3: ({ children }) => <Heading level={3}>{children}</Heading>,
          h4: ({ children }) => <Heading level={4}>{children}</Heading>,
          h5: ({ children }) => <Heading level={5}>{children}</Heading>,
          h6: ({ children }) => <Heading level={6}>{children}</Heading>,
          hr: () => <HorizontalRule />,
          p: ({ children }) => <Paragraph>{children}</Paragraph>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
