# Plan: Fix HabitsStreakCard Logic

## Problem
1. Failed/restart streaks and not-started habits are being displayed in the fire icon row
2. Active but not-yet-marked streaks show orange instead of gray
3. Main icon should count toward the total and follow the same color logic
4. Need a restart hint for habits with recentlyFailed=true

## Files to Edit

### 1. `client/src/i18n/es.ts`

Replace:
```
habitsSomeActive: '{active} de {total} rachas activas. ¡Tú puedes con el resto!',
```
With:
```
habitsSomeDone: '{done} de {total} marcadas hoy.',
habitsRestartAvailable: '{count} racha(s) por reiniciar',
```

### 2. `client/src/pages/Home.tsx` — `HabitsStreakCard`

#### Filter logic change:
```typescript
const displayedStreaks = streaks.filter(
  (s) => {
    const status = s.streak?.streak.status;
    const day = s.streak?.streak.currentDay ?? 0;
    return (status === 'active' || status === 'completed') && day >= 1;
  }
);
```
This excludes:
- `recentlyFailed` (status = 'failed')
- habits with no streak started (`streak: null`)
- habits with streak but currentDay = 0

#### Restartable count:
```typescript
const restartableCount = streaks.filter((s) => s.recentlyFailed).length;
```

#### Message logic:
```typescript
const doneCount = displayedStreaks.filter(
  (s) => !!s.streak?.todayLog || s.streak?.streak.status === 'completed'
).length;
const totalCount = displayedStreaks.length;

let message = '';
if (totalCount === 0) {
  message = restartableCount > 0
    ? es.home.habitsRestartAvailable.replace('{count}', String(restartableCount))
    : es.home.habitsNoneActive;
} else if (doneCount === totalCount) {
  message = es.home.habitsAllActive;
} else {
  message = es.home.habitsSomeDone
    .replace('{done}', String(doneCount))
    .replace('{total}', String(totalCount));
}

if (restartableCount > 0 && totalCount > 0) {
  message += ' ' + es.home.habitsRestartAvailable.replace('{count}', String(restartableCount));
}
```

#### Main icon color:
```typescript
const bestIsDone = !!bestEntry?.streak?.todayLog || bestCompleted;
```
- Main fire: orange gradient if `bestIsDone`, gray circle if not
- Main flame: white if `bestIsDone && isActive`, gray if `isActive && !bestIsDone`

#### Small icons:
Show all `displayedStreaks` EXCEPT the best one:
```typescript
const otherStreaks = displayedStreaks.filter((s) => s.habit.id !== bestEntry?.habit.id);
```
- Orange with glow if `todayLog` done or status is 'completed'
- Gray if active but not marked today

## Example Results

| User data | Main icon | Small icons | Message |
|---|---|---|---|
| 3 active: longest not done, 2 done; 1 failed | Gray fire (longest, not done) | 2 orange | "2 de 3 marcadas hoy. 1 racha(s) por reiniciar" |
| 3 active: longest done, 1 done, 1 not | Orange fire | 1 orange + 1 gray | "2 de 3 marcadas hoy." |
| 3 active: all done | Orange fire | 2 orange | "¡Todas tus rachas están activas! Sigue así." |
| 0 active, 2 failed, 1 not started | Gray "Sin racha activa" | None | "1 racha(s) por reiniciar" |
| 0 habits | Gray "Sin racha activa" | None | No bottom section |

## Verification
- Run `npx tsc --noEmit` in client dir
