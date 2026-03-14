import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const CourseSkeleton = () => {
  return (
    <Card className="overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col h-full shadow-sm">
      {/* Thumbnail Skeleton */}
      <Skeleton className="w-full h-44 rounded-b-none" />

      <CardContent className="p-5 flex flex-col flex-grow gap-3 mt-2">
        {/* Category Badge Skeleton */}
        <Skeleton className="h-4 w-1/3 rounded-full mb-1" />
        
        {/* Title Skeleton (Two lines) */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
        </div>

        {/* Instructor Info Skeleton */}
        <div className="flex items-center gap-3 mb-4 mt-auto">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Footer: Rating & Price Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-1/5" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseSkeleton;