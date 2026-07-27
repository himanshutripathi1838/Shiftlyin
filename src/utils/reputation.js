export function getBadge(completedJobs = 0) {
  if (completedJobs >= 200) return "Elite Worker";
  if (completedJobs >= 100) return "Pro Worker";
  if (completedJobs >= 50) return "Trusted Worker";
  if (completedJobs >= 10) return "Beginner Worker";
  return "New Hustler";
}

export function calculateAverageRating(ratings) {
  const nums = ratings.map(Number).filter((rating) => !Number.isNaN(rating));
  if (!nums.length) return 0;
  return Number((nums.reduce((sum, rating) => sum + rating, 0) / nums.length).toFixed(1));
}

export function calculateReputationScore({ averageRating = 0, completedJobs = 0 }) {
  return Math.round(Number(averageRating) * 20 + Math.min(Number(completedJobs), 200) * 2);
}
