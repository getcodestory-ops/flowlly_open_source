export interface ITask {
  id: string;
  name: string;
  status: string;
  // other properties...
}

export interface ILane {
  id: string;
  title: string;
  taskIds: string[];
}

export interface IBoardState {
  tasks: Record<string, ITask>;
  lanes: Record<string, ILane>;
  laneOrder: string[];
}
