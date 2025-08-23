'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ResponsiveTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (item: any) => React.ReactNode;
    mobileRender?: (item: any) => React.ReactNode;
    hideOnMobile?: boolean;
    className?: string;
  }[];
  title?: string;
  description?: string;
  className?: string;
  cardClassName?: string;
  onRowClick?: (item: any) => void;
}

export function ResponsiveTable({
  data,
  columns,
  title,
  description,
  className,
  cardClassName,
  onRowClick,
}: ResponsiveTableProps) {
  const mobileColumns = columns.filter(col => !col.hideOnMobile);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow 
                key={item.id || index}
                className={cn(
                  onRowClick && 'cursor-pointer hover:bg-gray-50',
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render ? column.render(item) : item[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
        )}
        
        {data.map((item, index) => (
          <Card 
            key={item.id || index}
            className={cn(
              'transition-all duration-200 hover:shadow-md',
              onRowClick && 'cursor-pointer',
              cardClassName
            )}
            onClick={() => onRowClick?.(item)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {mobileColumns.map((column, colIndex) => {
                  const content = column.mobileRender 
                    ? column.mobileRender(item) 
                    : column.render 
                    ? column.render(item) 
                    : item[column.key];

                  return (
                    <div key={column.key} className="flex flex-col space-y-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {column.label}
                      </div>
                      <div className={cn(
                        'text-sm text-gray-900 break-words',
                        column.className
                      )}>
                        {content}
                      </div>
                      {colIndex < mobileColumns.length - 1 && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Utility components for common table elements
export function ResponsiveBadge({ 
  children, 
  variant = "default",
  className 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}) {
  return (
    <Badge variant={variant} className={cn("text-xs", className)}>
      {children}
    </Badge>
  );
}

export function ResponsiveAvatar({ 
  fallback, 
  src: _src,
  className 
}: { 
  fallback: string; 
  src?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
        {fallback}
      </div>
    </div>
  );
}

export function ResponsiveText({ 
  children, 
  className,
  truncate = false
}: { 
  children: React.ReactNode; 
  className?: string;
  truncate?: boolean;
}) {
  return (
    <div className={cn(
      "text-sm text-gray-900",
      truncate && "truncate",
      className
    )}>
      {children}
    </div>
  );
}

export function ResponsiveSecondaryText({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("text-xs text-gray-500", className)}>
      {children}
    </div>
  );
}
