import { useState } from "react";

export default function StudentShiftCounter() {
  const [count, setCount] = useState(3);

  return (
    <div className="student-shift-counter" aria-label="Weekly shift goal preview">
      <div className="counter-control" role="group" aria-label="Preferred shifts per week">
        <button
          type="button"
          onClick={() => setCount((current) => Math.max(0, current - 1))}
          disabled={count === 0}
          aria-label="Decrease preferred shifts"
        >
          -
        </button>
        <output aria-live="polite" aria-label={`${count} shifts per week`}>
          <strong>{count}</strong>
          <span>{count === 1 ? "shift" : "shifts"}</span>
        </output>
        <button
          type="button"
          onClick={() => setCount((current) => Math.min(7, current + 1))}
          disabled={count === 7}
          aria-label="Increase preferred shifts"
        >
          +
        </button>
      </div>
    </div>
  );
}
