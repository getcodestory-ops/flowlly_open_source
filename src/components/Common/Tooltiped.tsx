import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TooltippedProps = {
  children: React.ReactNode;
  tooltip: string;
};
  
export const Tooltipped = ({ children, tooltip }: TooltippedProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
            {children}
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
    </TooltipProvider>
);
};