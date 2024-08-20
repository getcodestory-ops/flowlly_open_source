// import { DialogContent, DialogTrigger } from "@/components/ui/dialog";

// import { StorageResourceEntity } from "@/types/document";
// import { FileText } from "lucide-react";
// import { AspectRatio } from "@/components/ui/aspect-ratio";

// interface MediaDialogTriggerProps {
//   resource: StorageResourceEntity;
// }

// export const MediaDialogTrigger: React.FC<MediaDialogTriggerProps> = ({
//   resource,
// }) => {
//   const { file_name, metadata, url } = resource || {};
//   const fileExt = metadata?.extension?.toLowerCase();
//   switch (fileExt) {
//     case ".jpg":
//     case ".jpeg":
//     case ".png":
//     case ".gif":
//       return (
//         <div className="border rounded-lg h-auto w-auto transition-all hover:scale-105 cursor-pointer">
//           <img src={url} alt={file_name} className="object-cover" />
//         </div>
//       );
//     case ".mp4":
//     case ".webm":
//       return (
//         <AspectRatio ratio={1}>
//           <video controls>
//             <source src={url} type="video/mp4" />
//             Your browser does not support the video tag
//           </video>
//         </AspectRatio>
//       );
//     case ".mp3":
//     case ".ogg":
//     case ".wav":
//       return (
//         <div className="flex flex-col items-center justify-center  p-4">
//           <div className="w-full min-w-[300px]">
//             <audio src={url} controls style={{ width: "100%" }}>
//               Your browser does not support the audio element.
//             </audio>
//           </div>
//         </div>
//       );
//     case ".txt":
//       return (
//         <div className="rounded-lg  transition-all hover:scale-105 cursor-pointer">
//           <div className="flex items-center">
//             <FileText className="text-2xl" />
//           </div>
//         </div>
//       );
//     default:
//       return (
//         <div className="flex items-center justify-center ">
//           <FileText className="text-4xl" />
//         </div>
//       );
//   }
// };

const XXX = () => <></>;
