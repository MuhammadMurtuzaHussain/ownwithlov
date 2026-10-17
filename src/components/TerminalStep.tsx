import { useState } from "react";
import { Check, Copy, LifeBuoy } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type Props = {
  index: number;
  title: string;
  explain: string;
  command: string;
  expected: string;
  done: boolean;
  onToggle: (done: boolean) => void;
  onHelp: () => void;
  label?: string;
};

export function TerminalStep({ index, title, explain, command, expected, done, onToggle, onHelp, label = "terminal" }: Props) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={cn("rounded-2xl border bg-card p-5 shadow-soft transition-opacity", done && "opacity-70")}>
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full border font-mono text-sm",
            done ? "border-success bg-success text-success-foreground" : "bg-secondary text-secondary-foreground",
          )}
        >
          {done ? <Check className="size-4" /> : index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-sans text-base font-semibold">{title}</h4>
            <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <Checkbox checked={done} onCheckedChange={(v) => onToggle(v === true)} aria-label={`Mark "${title}" done`} />
              Done
            </label>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{explain}</p>

          <div className="mt-4 overflow-hidden rounded-xl border border-terminal-border bg-terminal text-terminal-foreground">
            <div className="flex items-center justify-between border-b border-terminal-border px-3 py-2">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-terminal-muted/40" />
                <span className="size-2.5 rounded-full bg-terminal-muted/40" />
                <span className="size-2.5 rounded-full bg-terminal-muted/40" />
                <span className="ml-2 font-mono text-[11px] text-terminal-muted">{label}</span>
              </div>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(command);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-terminal-muted transition-colors hover:bg-terminal-border hover:text-terminal-foreground"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
              {label === "terminal" && <span className="select-none text-terminal-prompt">$ </span>}
              {command}
            </pre>
          </div>

          <div className="mt-3 rounded-xl bg-muted px-4 py-3">
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Expected result</div>
            <pre className="mt-1 font-mono text-xs whitespace-pre-wrap text-foreground/80">{expected}</pre>
          </div>

          <button
            onClick={onHelp}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <LifeBuoy className="size-4" /> Something went wrong?
          </button>
        </div>
      </div>
    </div>
  );
}
