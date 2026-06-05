import { useEffect, useMemo, useState } from 'react';
import type { Task } from '../models/task';
import { taskStorage } from '../storage/taskStorage';

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function padDatePart(value: number) {
  return value.toString().padStart(2, '0');
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )}`;
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + amount);
  return nextDate;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getCalendarDays(viewDate: Date) {
  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1,
  );
  const mondayOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const firstCalendarDay = addDays(firstDayOfMonth, -mondayOffset);

  return Array.from({ length: 42 }, (_, index) =>
    addDays(firstCalendarDay, index),
  );
}

function getTaskDate(task: Task) {
  const taskDate = new Date(task.datetime);
  return Number.isNaN(taskDate.getTime()) ? null : taskDate;
}

function getTaskDateKey(task: Task) {
  const taskDate = getTaskDate(task);

  if (taskDate) {
    return toDateKey(taskDate);
  }

  return task.datetime.slice(0, 10);
}

function formatTaskTime(datetime: string) {
  const taskDate = new Date(datetime);

  if (Number.isNaN(taskDate.getTime())) {
    return datetime.split('T')[1]?.slice(0, 5) ?? '--:--';
  }

  return `${padDatePart(taskDate.getHours())}:${padDatePart(
    taskDate.getMinutes(),
  )}`;
}

function formatMonthTitle(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>(() => taskStorage.getAll());
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  useEffect(() => {
    const reloadTasks = () => {
      setTasks(taskStorage.getAll());
    };

    reloadTasks();
    window.addEventListener('focus', reloadTasks);
    window.addEventListener('storage', reloadTasks);

    return () => {
      window.removeEventListener('focus', reloadTasks);
      window.removeEventListener('storage', reloadTasks);
    };
  }, []);

  const completedTasksByDate = useMemo(() => {
    const groupedTasks = new Map<string, Task[]>();

    tasks
      .filter((task) => task.completed)
      .forEach((task) => {
        const taskDateKey = getTaskDateKey(task);
        const dateTasks = groupedTasks.get(taskDateKey) ?? [];
        groupedTasks.set(taskDateKey, [...dateTasks, task]);
      });

    groupedTasks.forEach((dateTasks) => {
      dateTasks.sort((firstTask, secondTask) =>
        firstTask.datetime.localeCompare(secondTask.datetime),
      );
    });

    return groupedTasks;
  }, [tasks]);

  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);
  const todayKey = toDateKey(new Date());
  const selectedTasks = selectedDateKey
    ? completedTasksByDate.get(selectedDateKey) ?? []
    : [];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500">To Do List</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-stone-950">
            {formatMonthTitle(viewDate)}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewDate((current) => addMonths(current, -1))}
            className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
          >
            上个月
          </button>
          <button
            type="button"
            onClick={() => setViewDate(new Date())}
            className="h-10 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-100"
          >
            今天
          </button>
          <button
            type="button"
            onClick={() => setViewDate((current) => addMonths(current, 1))}
            className="h-10 rounded-md border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
          >
            下个月
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="px-3 py-3 text-center text-sm font-semibold text-stone-600"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const dateKey = toDateKey(day);
                const dayTasks = completedTasksByDate.get(dateKey) ?? [];
                const isCurrentMonth = day.getMonth() === viewDate.getMonth();
                const isToday = dateKey === todayKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDateKey(dateKey)}
                    className={[
                      'group min-h-32 border-b border-r border-stone-100 p-2 text-left transition-colors hover:bg-red-50/50',
                      isCurrentMonth ? 'bg-white' : 'bg-stone-50/60',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'ml-auto flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium',
                        isToday
                          ? 'bg-red-600 text-white'
                          : isCurrentMonth
                            ? 'text-stone-800'
                            : 'text-stone-400',
                      ].join(' ')}
                    >
                      {day.getDate()}
                    </span>

                    <div className="mt-2 space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="truncate rounded-md border border-red-100 bg-red-50 px-2 py-1 text-xs font-medium text-stone-800"
                          title={`${formatTaskTime(task.datetime)} ${task.content}`}
                        >
                          {formatTaskTime(task.datetime)} {task.content}
                        </div>
                      ))}
                      {dayTasks.length > 3 ? (
                        <p className="px-1 text-xs font-medium text-stone-500">
                          +{dayTasks.length - 3} 个事件
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedDateKey ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/20 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-day-title"
          onClick={() => setSelectedDateKey(null)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-stone-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone-200 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-stone-500">已完成事件</p>
                <h3
                  id="calendar-day-title"
                  className="mt-1 text-lg font-semibold text-stone-950"
                >
                  {formatDateLabel(selectedDateKey)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDateKey(null)}
                className="rounded-md px-2 py-1 text-sm text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
                aria-label="关闭日历弹窗"
              >
                关闭
              </button>
            </div>

            <div className="max-h-[60vh] space-y-2 overflow-y-auto px-5 py-5">
              {selectedTasks.length === 0 ? (
                <p className="rounded-md border border-stone-200 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
                  当天没有已完成事件
                </p>
              ) : (
                selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-md border border-red-100 bg-red-50 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-stone-950">
                      {formatTaskTime(task.datetime)} {task.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
