import type { Task } from '../models/task';

const TASK_STORAGE_KEY = 'to-do-list:tasks';

export const taskStorage = {
  getAll(): Task[] {
    const rawTasks = window.localStorage.getItem(TASK_STORAGE_KEY);

    if (!rawTasks) {
      return [];
    }

    try {
      return JSON.parse(rawTasks) as Task[];
    } catch {
      window.localStorage.removeItem(TASK_STORAGE_KEY);
      return [];
    }
  },

  saveAll(tasks: Task[]): void {
    window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
  },

  clear(): void {
    window.localStorage.removeItem(TASK_STORAGE_KEY);
  },
};
