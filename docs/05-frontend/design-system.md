# 05. Frontend — Design System & Visual Tokens

[← Back to Documentation Portal](../README.md) | [← State Management](./state-management.md) | [Next Section: Security →](../06-security/zero-leak-secrets.md)

---

## 3.1 Dark Mode First Palette

NeuralDesk utilizes an enterprise dark theme built with Tailwind CSS design tokens:

| Token Name | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `--background` | `#020617` (`slate-950`) | Canvas background and root page canvas |
| `--card` | `#090d16` (`slate-900`) | Node body background and dialog panels |
| `--border` | `#1e293b` (`slate-800`) | Node idle border and separator rules |
| `--primary` | `#6366f1` (`indigo-500`) | Primary action buttons and running state |
| `--accent-success` | `#10b981` (`emerald-500`) | Completed nodes and valid status indicators |
| `--accent-danger` | `#f43f5e` (`rose-500`) | Failed nodes and cycle detection alerts |
| `--accent-warning` | `#f59e0b` (`amber-500`) | Draft version warnings and token rate warning |
| `--text-primary` | `#f8fafc` (`slate-50`) | Primary headlines and node titles |
| `--text-muted` | `#94a3b8` (`slate-400`) | Port descriptions, captions, and token units |

---

## 3.2 Dynamic Execution Glow Tokens

```css
/* Running State: Pulsing indigo halo and animated dashed edge */
.node-running {
  @apply ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 animate-pulse;
}
.edge-running {
  stroke: #6366f1 !important;
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

/* Success State: Clean emerald border */
.node-completed {
  @apply border-emerald-500 bg-emerald-950/20 text-emerald-300;
}

/* Error State: Crimson glow and error badge */
.node-failed {
  @apply border-rose-500 bg-rose-950/20 text-rose-300;
}

/* Skipped State: Dimmed opacity */
.node-skipped {
  @apply opacity-35 border-zinc-700 bg-zinc-900/50;
}
```

---

[← Previous: State Management](./state-management.md) | [Next Section: Security →](../06-security/zero-leak-secrets.md)
