import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from '../tasks/TaskCard';

export default function KanbanColumn({ column, tasks }) {
  return (
    <div className="flex flex-col flex-1 min-w-[280px]">
      {/* Column Header Card matching 02-dashboard-kanban.png */}
      <div
        className={`h-[66px] rounded-[14px] px-5 flex items-center justify-between border shadow-2xs transition-colors ${column.headerBg} ${column.headerBorder}`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl select-none" role="img" aria-label={column.title}>
            {column.icon}
          </span>
          <h3 className="font-outfit font-bold text-lg text-content-strong dark:text-white tracking-tight">
            {column.title}
          </h3>
        </div>

        {/* Count Pill */}
        <span
          className={`min-w-[36px] h-7 px-3 rounded-full flex items-center justify-center font-bold text-sm bg-white dark:bg-[#1A1D27] text-content-strong dark:text-white shadow-2xs border ${column.pillBorder}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`mt-4 flex-1 min-h-[580px] rounded-[16px] border-2 border-dashed p-3.5 sm:p-4 transition-all duration-200 flex flex-col gap-3.5 ${
              snapshot.isDraggingOver
                ? `${column.dragOverClass} scale-[1.005]`
                : 'border-[#E5E7EB] dark:border-[#2A2E3B] bg-[#FAF8F5]/60 dark:bg-[#151722]/60'
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex-1 flex flex-col items-center justify-start pt-8">
                <p className="text-content-muted/70 dark:text-gray-400 font-medium text-sm select-none">
                  Drop tasks here
                </p>
              </div>
            )}

            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={String(task._id)} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <TaskCard
                    task={task}
                    innerRef={dragProvided.innerRef}
                    draggableProps={dragProvided.draggableProps}
                    dragHandleProps={dragProvided.dragHandleProps}
                    isDragging={dragSnapshot.isDragging}
                  />
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
