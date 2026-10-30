import { useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import { useTasks } from '../../context/TaskContext';

const COLUMNS = [
  {
    id: 'pending',
    title: 'Pending',
    icon: '⏳',
    headerBg: 'bg-[#FFF3DD] dark:bg-amber-950/40',
    headerBorder: 'border-[#F6E3BE] dark:border-amber-800/40',
    pillBorder: 'border-amber-200/50 dark:border-amber-900/40',
    dragOverClass: 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    icon: '🔄',
    headerBg: 'bg-[#EAF2FF] dark:bg-blue-950/40',
    headerBorder: 'border-[#CFE0FA] dark:border-blue-800/40',
    pillBorder: 'border-blue-200/50 dark:border-blue-900/40',
    dragOverClass: 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20',
  },
  {
    id: 'completed',
    title: 'Completed',
    icon: '✅',
    headerBg: 'bg-[#EFEEDC] dark:bg-emerald-950/40',
    headerBorder: 'border-[#DAD8B8] dark:border-emerald-800/40',
    pillBorder: 'border-emerald-200/50 dark:border-emerald-900/40',
    dragOverClass: 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20',
  },
];

export default function KanbanBoard({ onShowToast }) {
  const { tasks, moveTask } = useTasks();

  // Group and sort tasks by status & order
  const columnTasks = useMemo(() => {
    const sortByOrder = (a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 0;
      const orderB = typeof b.order === 'number' ? b.order : 0;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    };

    const grouped = {
      pending: [],
      'in-progress': [],
      completed: [],
    };

    if (Array.isArray(tasks)) {
      tasks.forEach((task) => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        } else {
          // Default to pending if unrecognized
          grouped.pending.push(task);
        }
      });
    }

    grouped.pending.sort(sortByOrder);
    grouped['in-progress'].sort(sortByOrder);
    grouped.completed.sort(sortByOrder);

    return grouped;
  }, [tasks]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside any droppable column
    if (!destination) return;

    // Dropped in same column at same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    // Execute optimistic update with rollback handling
    const res = await moveTask(
      draggableId,
      sourceStatus,
      destStatus,
      source.index,
      destination.index
    );

    if (!res?.success) {
      onShowToast?.(res?.error || 'Failed to move task. Reverted change.', 'error');
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-start">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={columnTasks[column.id] || []}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
