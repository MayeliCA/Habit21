import { es } from '@/i18n/es';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{es.dashboard.title}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{es.dashboard.timeDistribution}</h2>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            {es.common.loading}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{es.dashboard.planVsActual}</h2>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            {es.common.loading}
          </div>
        </div>
      </div>
    </div>
  );
}
