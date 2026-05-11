import { fetchUserSessions } from './studySessionService';
import { fetchUserStreak } from './streakService';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatHM(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function signed(deltaSeconds) {
  if (deltaSeconds === 0) return '+ 0m vs last week';
  const sign = deltaSeconds > 0 ? '+' : '−';
  return `${sign} ${formatHM(Math.abs(deltaSeconds))} vs last week`;
}

export async function fetchStudyStats(userId) {
  if (!userId) return null;

  const since = new Date(Date.now() - 30 * DAY_MS).toISOString();
  const [sessions, streak] = await Promise.all([
    fetchUserSessions(userId, { since, limit: 500 }),
    fetchUserStreak(userId),
  ]);

  const today = startOfDay(new Date());
  const last7Start = new Date(today.getTime() - 6 * DAY_MS);
  const last7End = new Date(today.getTime() + DAY_MS);
  const prev7Start = new Date(today.getTime() - 13 * DAY_MS);
  const prev7End = last7Start;

  const inWindow = (d, start, end) => d >= start && d < end;

  const dailyTotals = new Array(7).fill(0);
  let weekTotal = 0;
  let prevWeekTotal = 0;
  let solo = 0;
  let buddy = 0;
  let silent = 0;
  let nonSilent = 0;
  let distractionFree = 0;
  let totalSessions = 0;

  for (const s of sessions) {
    if (!s.completed) continue;
    const started = new Date(s.started_at);
    const dur = s.duration_seconds || 0;

    if (inWindow(started, last7Start, last7End)) {
      const dayIndex = Math.floor((started.getTime() - last7Start.getTime()) / DAY_MS);
      if (dayIndex >= 0 && dayIndex < 7) dailyTotals[dayIndex] += dur;
      weekTotal += dur;

      totalSessions += 1;
      if (s.session_type === 'solo') solo += 1;
      else buddy += 1;
      if (s.focus_mode_enabled) silent += 1;
      else nonSilent += 1;
      if (s.distraction_free !== false) distractionFree += 1;
    } else if (inWindow(started, prev7Start, prev7End)) {
      prevWeekTotal += dur;
    }
  }

  const dailyHoursLast7 = dailyTotals.map((sec) => +(sec / 3600).toFixed(2));
  const consistency = dailyTotals.map((sec) => sec > 0);

  const studiedDayCount = consistency.filter(Boolean).length;
  const dailyAvgSeconds =
    studiedDayCount > 0 ? Math.round(weekTotal / studiedDayCount) : 0;

  return {
    currentStreak: streak.current,
    longestStreak: streak.longest,
    consistency,
    dailyHoursLast7,
    dailyAverage: formatHM(dailyAvgSeconds),
    weeklyTotal: formatHM(weekTotal),
    weeklyTotalDelta: signed(weekTotal - prevWeekTotal),
    solo,
    buddy,
    silent,
    nonSilent,
    distractionFree,
    totalSessions,
  };
}
