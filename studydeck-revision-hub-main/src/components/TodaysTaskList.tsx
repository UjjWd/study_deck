
import React from "react";

type TaskItem = { text: string; class?: string };

type TodaysTaskListProps = {
  tasks: TaskItem[];
};

const TodaysTaskList: React.FC<TodaysTaskListProps> = ({ tasks }) => (
  <div className="mt-2">
    <div className="font-semibold text-sm">Today's To Dos:</div>
    <ul className="text-sm mt-1 space-y-1">
      {tasks.length === 0 ? (
        <li className="text-muted-foreground italic">No to-dos yet.</li>
      ) : (
        tasks.map((task, idx) => (
          <li key={idx} className="flex gap-2 items-center">
            <span>- {task.text}</span>
            {task.class && (
              <span className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground">
                {task.class}
              </span>
            )}
          </li>
        ))
      )}
    </ul>
  </div>
);

export default TodaysTaskList;
