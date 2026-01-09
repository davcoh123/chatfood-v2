"use client";

import { cn } from "@/lib/utils";

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: {
    imageUrl: string;
    profileUrl?: string;
  }[];
}

const AvatarCircles = ({ numPeople, className, avatarUrls }: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-2 rtl:space-x-reverse", className)}>
      {avatarUrls.map((avatar, index) => (
        <img
          key={index}
          className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800"
          src={avatar.imageUrl}
          width={32}
          height={32}
          alt={`Avatar ${index + 1}`}
        />
      ))}
      {numPeople && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300">
          +{numPeople}
        </div>
      )}
    </div>
  );
};

export { AvatarCircles };