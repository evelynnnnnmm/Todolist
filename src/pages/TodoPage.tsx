import { type FormEvent, useMemo, useState } from 'react';
import type { Task } from '../models/task';
import { taskStorage } from '../storage/taskStorage';

interface TaskFormValues {
  datetime: string;
  content: string;
  completed: boolean;
}

const emptyFormValues: TaskFormValues = {
  datetime: '',
  content: '',
  completed: false,
};

function createTaskId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function formatTaskDatetime(datetime: string) {
  if (!datetime) {
    return '-';
  }

  const date = new Date(datetime);

  if (Number.isNaN(date.getTime())) {
    return datetime;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>(() => taskStorage.getAll());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formValues, setFormValues] =
    useState<TaskFormValues>(emptyFormValues);

  const editingTask = useMemo(
    () => tasks.find((task) => task.id === editingTaskId) ?? null,
    [editingTaskId, tasks],
  );

  const persistTasks = (nextTasks: Task[]) => {
    setTasks(nextTasks);
    taskStorage.saveAll(nextTasks);
  };

  const openCreateForm = () => {
    setEditingTaskId(null);
    setFormValues(emptyFormValues);
    setIsFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTaskId(task.id);
    setFormValues({
      datetime: task.datetime,
      content: task.content,
      completed: task.completed,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTaskId(null);
    setFormValues(emptyFormValues);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedContent = formValues.content.trim();

    if (!formValues.datetime || !normalizedContent) {
      return;
    }

    if (editingTaskId) {
      persistTasks(
        tasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                datetime: formValues.datetime,
                content: normalizedContent,
                completed: formValues.completed,
              }
            : task,
        ),
      );
    } else {
      const nextTask: Task = {
        id: createTaskId(),
        datetime: formValues.datetime,
        content: normalizedContent,
        completed: formValues.completed,
      };

      persistTasks([nextTask, ...tasks]);
    }

    closeForm();
  };

  const handleStatusChange = (taskId: string, completed: boolean) => {
    persistTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed,
            }
          : task,
      ),
    );
  };

  const handleDelete = (taskId: string) => {
    persistTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">To Do List</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
            待办事项
          </h2>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          新增事件
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="w-56 px-4 py-3 text-sm font-semibold text-slate-600">
                  时间
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">
                  事件
                </th>
                <th className="w-40 px-4 py-3 text-sm font-semibold text-slate-600">
                  完成状态
                </th>
                <th className="w-36 px-4 py-3 text-right text-sm font-semibold text-slate-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    暂无待办事项
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {formatTaskDatetime(task.datetime)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      <span
                        className={
                          task.completed ? 'text-slate-400 line-through' : ''
                        }
                      >
                        {task.content}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.completed ? 'completed' : 'pending'}
                        onChange={(event) =>
                          handleStatusChange(
                            task.id,
                            event.target.value === 'completed',
                          )
                        }
                        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        aria-label={`${task.content} 完成状态`}
                      >
                        <option value="pending">未完成</option>
                        <option value="completed">已完成</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(task)}
                          className="h-9 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(task.id)}
                          className="h-9 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-form-title"
        >
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {editingTask ? '编辑事件' : '新增事件'}
                </p>
                <h3
                  id="task-form-title"
                  className="mt-1 text-lg font-semibold text-slate-950"
                >
                  事件信息
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md px-2 py-1 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="关闭表单"
              >
                关闭
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">时间</span>
                <input
                  type="datetime-local"
                  value={formValues.datetime}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      datetime: event.target.value,
                    }))
                  }
                  required
                  className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  事件内容
                </span>
                <textarea
                  value={formValues.content}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  required
                  rows={4}
                  className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  完成状态
                </span>
                <select
                  value={formValues.completed ? 'completed' : 'pending'}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      completed: event.target.value === 'completed',
                    }))
                  }
                  className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="pending">未完成</option>
                  <option value="completed">已完成</option>
                </select>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="h-10 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
