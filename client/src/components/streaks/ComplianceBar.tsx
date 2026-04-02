interface ComplianceBarProps {
  compliancePct: number;
  passed: boolean;
}

export function ComplianceBar({ compliancePct, passed }: ComplianceBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Cumplimiento</span>
        <span className={passed ? 'font-medium text-green-600' : 'font-medium text-red-600'}>
          {compliancePct.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            passed ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(compliancePct, 100)}%` }}
        />
      </div>
      <div className="relative h-0">
        <div
          className="absolute top-0 h-2 w-0.5 bg-foreground/50"
          style={{ left: '80%' }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {passed ? '¡Sobre el umbral del 80%!' : 'Necesitas >80% para avanzar'}
      </p>
    </div>
  );
}
