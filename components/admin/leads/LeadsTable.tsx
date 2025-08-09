'use client';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Leads ({leads.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Goals</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} data-lead-id={lead.id} onClick={() => setDetailLead(lead)} className="cursor-pointer hover:bg-muted/40">
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <div className="text-xs text-gray-600 space-y-1">
                    {lead.organizationType && <div><span className="font-medium">Type:</span> {lead.organizationType}</div>}
                    {lead.industryFocus && <div><span className="font-medium">Industry:</span> {lead.industryFocus}</div>}
                    {lead.teamSize && <div><span className="font-medium">Team:</span> {lead.teamSize}</div>}
                    {lead.timeline && <div><span className="font-medium">Timeline:</span> {lead.timeline}</div>}
                    {lead.budget && <div><span className="font-medium">Budget:</span> {lead.budget}</div>}
                  </div>
                </TableCell>
                <TableCell>
                  {lead.organization ? (
                    <Badge variant="outline">{lead.organization}</Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {lead.jobTitle ? (
                    <span className="text-sm">{lead.jobTitle}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {Array.isArray(lead.primaryGoals) && lead.primaryGoals.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {lead.primaryGoals.slice(0, 3).map((g, idx) => (
                        <Badge key={idx} variant="secondary">{g}</Badge>
                      ))}
                      {lead.primaryGoals.length > 3 && (
                        <span className="text-xs text-gray-500">+{lead.primaryGoals.length - 3}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <Badge variant="default">Active</Badge>
                </TableCell>
                <TableCell>
                  {formatDate(lead.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(lead)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onGeneratePaymentLink(lead)}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Generate Payment Link
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`mailto:${lead.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => onDelete(lead.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
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
    </Card>
  );
} 