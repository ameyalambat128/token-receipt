import { CopyButton } from "@/components/copy-button";

type CommandPanelProps = {
  command: string;
  caption?: string;
  shell?: boolean;
};

function renderCommand(command: string, shell: boolean) {
  if (shell) {
    return (
      <>
        <span className="select-none text-neutral-600">$ </span>
        {command}
      </>
    );
  }

  if (command.startsWith("/")) {
    const firstSpace = command.indexOf(" ");
    const slashCommand =
      firstSpace === -1 ? command : command.slice(0, firstSpace);
    const argument = firstSpace === -1 ? "" : command.slice(firstSpace);

    return (
      <>
        <span className="font-semibold text-neutral-50">{slashCommand}</span>
        {argument && <span className="text-neutral-400">{argument}</span>}
      </>
    );
  }

  return command;
}

export function CommandPanel({
  command,
  caption,
  shell = false,
}: CommandPanelProps) {
  const box = (
    <div className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 px-4 py-4 transition-colors duration-200 hover:border-neutral-700 hover:bg-neutral-900/60 sm:px-5">
      <code className="min-w-0 flex-1 whitespace-pre-wrap break-words font-mono text-sm leading-7 text-neutral-200 sm:text-[0.95rem]">
        {renderCommand(command, shell)}
      </code>
      <CopyButton text={command} />
    </div>
  );

  if (!caption) return box;

  return (
    <div>
      <p className="mb-2 text-sm text-neutral-500">{caption}</p>
      {box}
    </div>
  );
}
