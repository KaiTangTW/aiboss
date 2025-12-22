import { useTimerStats } from "@/hooks/use-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Target, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} 小時 ${minutes} 分鐘`;
  }
  return `${minutes} 分鐘`;
}

export function TimerStats() {
  const { data: stats, isLoading } = useTimerStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-2xl">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    {
      icon: Calendar,
      label: "今日專注",
      value: formatDuration(stats?.todayTime || 0),
    },
    {
      icon: Target,
      label: "完成次數",
      value: `${stats?.sessionCount || 0} 次`,
    },
    {
      icon: Clock,
      label: "總計時間",
      value: formatDuration(stats?.totalTime || 0),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item, index) => (
        <Card key={index} className="rounded-2xl border-0 bg-muted/50">
          <CardContent className="p-4 text-center">
            <item.icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className="text-sm font-semibold" data-testid={`stat-${index}`}>{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
