'use client';
import * as React from 'react';


import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  ResponsiveTable,
  ResponsiveBadge,
  ResponsiveAvatar,
  ResponsiveText,
  ResponsiveSecondaryText,
} from '@/components/ui/responsive-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Mail, Phone, CreditCard } from 'lucide-react';
import type { Lead } from '@/shared/types/entities';

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onGeneratePaymentLink: (lead: Lead) => void;
  formatDate: (date: Date) => string;
}

/**
 * Table component for displaying leads
 * Shows lead data in a structured table format
 */
export function LeadsTable({
  leads,
  onEdit,
  onDelete,
  onGeneratePaymentLink,
  formatDate,
}: LeadsTableProps) {
  const [detailLead, setDetailLead] = React.useState<Lead | null>(null);
  const columns = [
    {
      key: 'lead',
      label: 'Lead',
      render: (lead: Lead) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">
              {lead.firstName} {lead.lastName}
            </p>
            <p className="text-sm text-gray-500">{lead.email}</p>
          </div>
        </div>
      ),
      mobileRender: (_lead: Lead) => (
        <div className="flex items-center space-x-3">
          <ResponsiveAvatar fallback={`${_lead.firstName.charAt(0)}${_lead.lastName.charAt(0)}`} />
          <div className="min-w-0 flex-1">
            <ResponsiveText className="font-medium">
              {_lead.firstName} {_lead.lastName}
            </ResponsiveText>
            <ResponsiveSecondaryText>{_lead.email}</ResponsiveSecondaryText>
          </div>
        </div>
      ),
    },
    {
      key: 'organization',
      label: 'Organization',
      render: (lead: Lead) => (
        lead.organization ? (
          <Badge variant="outline">{lead.organization}</Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
      mobileRender: (_lead: Lead) => (
        _lead.organization ? (
          <ResponsiveBadge variant="outline">{_lead.organization}</ResponsiveBadge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      render: (lead: Lead) => (
        lead.jobTitle ? (
          <span className="text-sm">{lead.jobTitle}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
      mobileRender: (lead: Lead) => (
        lead.jobTitle ? (
          <ResponsiveText>{lead.jobTitle}</ResponsiveText>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'goals',
      label: 'Goals',
      render: (lead: Lead) => (
        Array.isArray(lead.primaryGoals) && lead.primaryGoals.length > 0 ? (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex flex-wrap gap-1 cursor-pointer">
                {lead.primaryGoals.slice(0, 2).map((g, idx) => (
                  <Badge key={idx} variant="secondary">{g}</Badge>
                ))}
                {lead.primaryGoals.length > 2 && (
                  <Badge variant="outline" className="text-xs">+{lead.primaryGoals.length - 2}</Badge>
                )}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">All Goals</h4>
                <div className="flex flex-wrap gap-1">
                  {lead.primaryGoals.map((goal, idx) => (
                    <Badge key={idx} variant="secondary">{goal}</Badge>
                  ))}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
      mobileRender: (lead: Lead) => (
        Array.isArray(lead.primaryGoals) && lead.primaryGoals.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {lead.primaryGoals.slice(0, 1).map((g, idx) => (
              <ResponsiveBadge key={idx} variant="secondary">{g}</ResponsiveBadge>
            ))}
            {lead.primaryGoals.length > 1 && (
              <ResponsiveBadge variant="outline" className="text-xs">+{lead.primaryGoals.length - 1}</ResponsiveBadge>
            )}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (lead: Lead) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 text-gray-400" />
            <span className="text-sm">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-gray-400" />
              <span className="text-sm">{lead.phone}</span>
            </div>
          )}
        </div>
      ),
      mobileRender: (lead: Lead) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Mail className="h-3 w-3 text-gray-400" />
            <ResponsiveSecondaryText>{lead.email}</ResponsiveSecondaryText>
          </div>
          {lead.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-3 w-3 text-gray-400" />
              <ResponsiveText>{lead.phone}</ResponsiveText>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_lead: Lead) => (
        <Badge variant="default">Active</Badge>
      ),
      mobileRender: (_lead: Lead) => (
        <ResponsiveBadge variant="default">Active</ResponsiveBadge>
      ),
    },
    {
      key: 'created',
      label: 'Created',
      render: (lead: Lead) => (
        <span className="text-sm text-gray-600">{formatDate(lead.createdAt)}</span>
      ),
      mobileRender: (lead: Lead) => (
        <ResponsiveSecondaryText>{formatDate(lead.createdAt)}</ResponsiveSecondaryText>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (lead: Lead) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEdit(lead);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onGeneratePaymentLink(lead);
            }}>
              <CreditCard className="h-4 w-4 mr-2" />
              Generate Payment Link
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lead.id);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      mobileRender: (lead: Lead) => (
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(lead);
            }}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onGeneratePaymentLink(lead);
            }}
          >
            <CreditCard className="h-3 w-3 mr-1" />
            Payment
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lead.id);
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ResponsiveTable
        data={leads}
        columns={columns}
        title={`All Leads (${leads.length})`}
        className="space-y-4"
        onRowClick={(lead) => setDetailLead(lead)}
      />
      <Dialog open={!!detailLead} onOpenChange={() => setDetailLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {detailLead && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium mb-1">Profile</div>
                <div>{detailLead.firstName} {detailLead.lastName}</div>
                <div>{detailLead.email}</div>
                {detailLead.phone && <div>{detailLead.phone}</div>}
              </div>
              <div>
                <div className="font-medium mb-1">Organization</div>
                {detailLead.organization && <div>{detailLead.organization}</div>}
                {detailLead.organizationType && <div>Type: {detailLead.organizationType}</div>}
                {detailLead.teamSize && <div>Team: {detailLead.teamSize}</div>}
                {detailLead.industryFocus && <div>Industry: {detailLead.industryFocus}</div>}
              </div>
              <div className="md:col-span-2">
                <div className="font-medium mb-1">Goals</div>
                {detailLead.primaryGoals && detailLead.primaryGoals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detailLead.primaryGoals.map((g, i) => (
                      <Badge key={i} variant="secondary">{g}</Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">-</div>
                )}
              </div>
              {detailLead.challengesDescription && (
                <div className="md:col-span-2">
                  <div className="font-medium mb-1">Challenges</div>
                  <div className="text-gray-700 whitespace-pre-wrap">{detailLead.challengesDescription}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 