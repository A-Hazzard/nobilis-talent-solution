'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Database, Zap } from 'lucide-react';
import { useDashboardStore } from '@/lib/stores/dashboardStore';

export default function FakeDataToggle() {
  const { isFakeDataEnabled, toggleFakeData } = useDashboardStore();

  return (
    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center space-x-2">
        {isFakeDataEnabled ? (
          <Zap className="h-4 w-4 text-yellow-600" />
        ) : (
          <Database className="h-4 w-4 text-blue-600" />
        )}
        <Label htmlFor="fake-data-toggle" className="text-sm font-medium">
          {isFakeDataEnabled ? 'Demo Mode' : 'Live Data'}
        </Label>
      </div>
      
      <Switch
        id="fake-data-toggle"
        checked={isFakeDataEnabled}
        onCheckedChange={toggleFakeData}
      />
      
      <Badge 
        variant={isFakeDataEnabled ? "secondary" : "default"}
        className="text-xs"
      >
        {isFakeDataEnabled ? 'Demo' : 'Live'}
      </Badge>
      
      <div className="text-xs text-muted-foreground ml-2">
        {isFakeDataEnabled 
          ? 'Showing simulated data for demonstration'
          : 'Showing real data from database'
        }
      </div>
    </div>
  );
} 