import { useEffect, useState } from "react";
import JobCard from "./JobCard.jsx";

function getCardDistance(index, activeIndex, total) {
  let distance = index - activeIndex;
  if (total > 2) {
    if (distance > total / 2) distance -= total;
    if (distance < -total / 2) distance += total;
  }
  return distance;
}

export default function JobCardDeck({ jobs, onApply, emptyMessage = "No jobs available yet.", appliedJobIds = new Set() }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = jobs.length;

  useEffect(() => {
    if (activeIndex >= total) setActiveIndex(Math.max(0, total - 1));
  }, [activeIndex, total]);

  if (!total) return <p className="empty-state">{emptyMessage}</p>;

  function cycle(direction) {
    setActiveIndex((current) => (current + direction + total) % total);
  }

  return (
    <section className="job-card-deck" aria-label="Job cards">
      <div className="job-fan">
        {jobs.map((job, index) => {
          const distance = getCardDistance(index, activeIndex, total);
          const visible = Math.abs(distance) <= 2;
          const isActive = distance === 0;

          return (
            <div
              key={job.id}
              className={`job-fan-item ${isActive ? "active" : ""}`}
              style={{
                "--card-distance": distance,
                "--card-order": 10 - Math.abs(distance),
                "--card-x": `${distance * 185}px`,
                "--card-y": `${Math.abs(distance) * 28}px`,
                "--card-rotation": `${distance * 7}deg`,
                "--card-scale": Math.max(0.78, 1 - Math.abs(distance) * 0.08)
              }}
              aria-hidden={!visible}
              onClick={!isActive && visible ? () => setActiveIndex(index) : undefined}
            >
              <JobCard 
                job={job} 
                onApply={isActive ? onApply : undefined} 
                compact={!isActive} 
                applied={appliedJobIds.has(job.id)}
              />
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <div className="job-deck-controls">
          <button type="button" className="deck-arrow" onClick={() => cycle(-1)} aria-label="Previous job">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="deck-dots" aria-label={`Job ${activeIndex + 1} of ${total}`}>
            {jobs.map((job, index) => (
              <button
                type="button"
                key={job.id}
                className={index === activeIndex ? "active" : ""}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show job ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
          <button type="button" className="deck-arrow" onClick={() => cycle(1)} aria-label="Next job">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      )}
    </section>
  );
}
