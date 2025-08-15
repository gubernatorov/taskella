import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { TypeBadge } from "@/components/tasks/TypeBadge";
import { Task } from "@/types/task";
import { Calendar, Clock, User, MessageCircle, Paperclip } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { ru } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const fullName = task.assignee
    ? [task.assignee.firstName, task.assignee.lastName]
        .filter(Boolean)
        .join(" ")
    : "";

  // Функция для обрезания длинных имен
  const truncateName = (name: string, maxLength = 12) => {
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength)}...`;
  };

  if (compact) {
    return (
      <Card className="hover:scale-[1.01] transition-all duration-300 ease-in-out cursor-pointer border border-border/50 shadow-sm overflow-hidden">
        <Link href={`/tasks/${task.id}`}>
          <CardHeader className="pb-3">
            {/* Основная информация */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-sm font-semibold truncate">
                  {task.title}
                </CardTitle>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  <TypeBadge type={task.type} />
                </div>
              </div>
              <CardDescription className="text-xs truncate">
                {task.key} • {task.project.name}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Второстепенная информация внизу */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {task.assignee && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 shrink-0" />
                  <Avatar className="h-4 w-4 shrink-0">
                    <AvatarImage src={task.assignee.avatarUrl} />
                    <AvatarFallback className="text-[8px] bg-gradient-to-br from-primary to-purple-600 text-white">
                      {task.assignee.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="truncate max-w-[60px] sm:max-w-[80px]"
                    title={fullName}
                  >
                    {truncateName(fullName)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {task.estimatedHours && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{task.estimatedHours}ч</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {task.dueDate
                      ? format(new Date(task.dueDate), "dd.MM.yyyy")
                      : formatDistanceToNow(new Date(task.updatedAt), {
                          addSuffix: true,
                          locale: ru,
                        })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="hover:scale-[1.005] transition-all duration-300 ease-in-out cursor-pointer border border-border/50 shadow-sm overflow-hidden flex flex-col h-full">
      <Link href={`/tasks/${task.id}`} className="flex flex-col h-full">
        <CardHeader className="pb-4 flex-shrink-0">
          {/* Основная информация */}
          <div className="space-y-2">
            {/* Заголовок и бейджи в столбик */}
            <div className="space-y-2">
              <CardTitle className="text-lg font-semibold truncate">
                {task.title}
              </CardTitle>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                <TypeBadge type={task.type} />
              </div>
            </div>

            <CardDescription className="text-sm truncate">
              {task.key} • {task.project.name}
            </CardDescription>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex flex-col flex-grow">
          {/* Нижняя часть с датой, счетчиками и кнопкой */}
          <div className="mt-auto space-y-3">
            {/* Информация об исполнителе и времени выполнения */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {task.assignee && (
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="h-4 w-4 shrink-0" />
                    <Avatar className="h-5 w-5 shrink-0">
                      <AvatarImage src={task.assignee.avatarUrl} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-purple-600 text-white">
                        {task.assignee.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="font-medium text-sm truncate max-w-[100px]"
                      title={fullName}
                    >
                      {truncateName(fullName, 15)}
                    </span>
                  </div>
                )}

                {task.estimatedHours && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>{task.estimatedHours}ч</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {task.dueDate
                    ? format(new Date(task.dueDate), "dd.MM.yyyy")
                    : formatDistanceToNow(new Date(task.updatedAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs shrink-0">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>22 комм.</span>
                </div>
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  <span>0 вложений</span>
                </div>
              </div>
            </div>

            <Button asChild className="w-full" size="sm">
              <Link href={`/tasks/${task.id}`}>Открыть задачу</Link>
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
