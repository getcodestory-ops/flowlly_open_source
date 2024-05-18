interface TaskArgs {
  project_id: string;
  project_name: string;
  task_owner_ids: string[];
}

interface RunConfig {
  day: number[];
  start: string;
  end?: string;
  time: string[];
  time_zone: string;
}

export interface AddTaskQueue {
  id?: string;
  task_name: string;
  task_args: TaskArgs;
  task_function: string;
  run_config: RunConfig;
  active: boolean;
}

export interface TaskQueue {
  id: string;
  created_at: string;
  task_name: string;
  task_args: TaskArgs;
  task_function: string;
  run_config: RunConfig;
  active: boolean;
}
