import React from "react";
import Link from "next/link";
import { CalendarIcon, HomeIcon, MailIcon, PencilIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dock, DockIcon } from "@/components/ui/dock";
import MediaRecorderButton from "../ChatInput/MediaRecorderButton";

export type IconProps = React.HTMLAttributes<SVGElement>;

const DATA = {
  navbar: [
    {
      href: "#",
      icon: PencilIcon,
      label: "Text Note",
      child: <MediaRecorderButton />,
    },
  ],
};

// export function ActionDock() {
//   return (
//     <div className="flex sticky items-center justify-center gap-4">
//       <div className=" flex  flex-col items-center justify-center overflow-hidden rounded-lg  bg-background ">
//         <TooltipProvider>
//           <Dock direction="middle">
//             {DATA.navbar.map((item) => (
//               <DockIcon key={item.label}>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Link
//                       href={item.href}
//                       className={cn(
//                         buttonVariants({ variant: "ghost", size: "icon" }),
//                         "size-12 rounded-full"
//                       )}
//                     >
//                       <item.icon className="size-4" />
//                     </Link>
//                   </TooltipTrigger>
//                   <TooltipContent>
//                     <p>{item.label}</p>
//                   </TooltipContent>
//                 </Tooltip>
//               </DockIcon>
//             ))}
//           </Dock>
//         </TooltipProvider>
//       </div>
//       <div className="mt-8">
//         <Separator orientation="vertical" />
//         <MediaRecorderButton />
//       </div>
//     </div>
//   );
// }
