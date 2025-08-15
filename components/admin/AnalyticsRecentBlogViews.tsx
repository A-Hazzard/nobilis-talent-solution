'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Send } from 'lucide-react';
import type { BlogViewEvent } from '@/lib/types/services';

export default function AnalyticsRecentBlogViews({ items }: { items: BlogViewEvent[] }) {
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [subject, setSubject] = useState('Thanks for reading');
  const [message, setMessage] = useState('Hi, thanks for reading our blog. Can I share related resources?');
  const [sending, setSending] = useState<string | null>(null);

  const sendNow = async (email?: string) => {
    if (!email) return;
    setSending(email);
    try {
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject, html: `<p>${message}</p>` })
      });
    } finally {
      setSending(null);
      setOpenFor(null);
    }
  };

  const openEmailClient = (email?: string) => {
    if (!email) return;
    const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Blog Views</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((v) => (
            <div key={v.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{v.postTitle}</div>
                    <div className="text-sm text-muted-foreground">{v.userEmail || 'Anonymous'}</div>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{v.timestamp.toDate().toLocaleDateString()}</div>
                  <div>{v.timestamp.toDate().toLocaleTimeString()}</div>
                </div>
              </div>
              {v.userEmail && (
                <div className="mt-3">
                  {openFor === v.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                      <Input className="md:col-span-2" value={subject} onChange={(e) => setSubject(e.target.value)} />
                      <Input className="md:col-span-4" value={message} onChange={(e) => setMessage(e.target.value)} />
                      <div className="md:col-span-6 flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => openEmailClient(v.userEmail)}>Open Email App</Button>
                        <Button onClick={() => sendNow(v.userEmail)} disabled={sending === v.userEmail}>
                          <Send className="w-4 h-4 mr-2" />
                          {sending === v.userEmail ? 'Sending...' : 'Send Email Now'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setOpenFor(v.id)}>Send Email Now</Button>
                      <Button variant="ghost" size="sm" onClick={() => openEmailClient(v.userEmail)}>Open Email App</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


