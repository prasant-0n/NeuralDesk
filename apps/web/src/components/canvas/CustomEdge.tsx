import React from "react";
import {
  type EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "@xyflow/react";
import { X } from "lucide-react";
import { useWorkflowStore } from "../../store/workflowStore";
import { useSettingsStore } from "../../store/settingsStore";

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const nodeTelemetry = useWorkflowStore((state) => state.nodeTelemetry);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const theme = useSettingsStore((state) => state.theme);
  const isDark = theme === "dark";

  const sourceStatus = nodeTelemetry[source]?.status;
  const isRunning = sourceStatus === "running";
  const isSuccess = sourceStatus === "completed";
  const isFailed = sourceStatus === "failed";

  const branch = (data?.branch as string) || "";

  const edgeClass = isRunning
    ? "edge-running"
    : isSuccess
    ? "edge-success"
    : isFailed
    ? "edge-failed"
    : "";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdgesChange([{ type: "remove", id }]);
  };

  const defaultStroke = isDark ? "#475569" : "#94a3b8";

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className={edgeClass}
        style={{
          ...style,
          stroke: isRunning
            ? "#6366f1"
            : isSuccess
            ? "#10b981"
            : isFailed
            ? "#f43f5e"
            : selected
            ? "#6366f1"
            : defaultStroke,
          strokeWidth: selected ? 2.5 : 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="group flex items-center gap-1.5"
        >
          {branch && (
            <span
              className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border shadow-sm ${
                branch === "true"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-700/60"
                  : branch === "false"
                  ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-700/60"
                  : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-700/60"
              }`}
            >
              {branch}
            </span>
          )}
          <button
            onClick={handleDelete}
            aria-label="Delete connection"
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 dark:bg-charcoal-900 dark:hover:bg-rose-900/80 dark:text-charcoal-400 dark:hover:text-rose-200 dark:border-charcoal-700 p-0.5 rounded-full shadow cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
