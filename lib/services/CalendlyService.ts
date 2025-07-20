import type { CalendarEvent } from '@/shared/types/entities';

export interface CalendlyEvent {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: {
    uri: string;
    name: string;
    active: boolean;
    duration: number;
    kind: string;
    pooling_type: string;
    type: string;
    color: string;
    description_plain: string;
    description_html: string;
    profile: {
      type: string;
      name: string;
      owner: {
        type: string;
        uri: string;
      };
    };
  };
  location: {
    type: string;
    location: string;
  };
  invitee: {
    uri: string;
    name: string;
    email: string;
    timezone: string;
    created_at: string;
    updated_at: string;
    canceled: boolean;
    canceler_name?: string;
    cancel_reason?: string;
    canceled_at?: string;
  };
  created_at: string;
  updated_at: string;
  canceled: boolean;
  canceler_name?: string;
  cancel_reason?: string;
  canceled_at?: string;
  reschedule_url: string;
  rescheduled: boolean;
  old_event?: string;
  old_invitee?: string;
  new_event?: string;
  new_invitee?: string;
}

export interface CalendlyScheduledEvent {
  event: CalendlyEvent;
  invitee: {
    uri: string;
    name: string;
    email: string;
    timezone: string;
    created_at: string;
    updated_at: string;
    canceled: boolean;
    canceler_name?: string;
    cancel_reason?: string;
    canceled_at?: string;
  };
  tracking: {
    utm_campaign?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_term?: string;
    utm_content?: string;
    salesforce_uuid?: string;
  };
  old_event?: string;
  old_invitee?: string;
  new_event?: string;
  new_invitee?: string;
}

export class CalendlyService {
  private static instance: CalendlyService;
  private accessToken: string | null = null;
  private baseUrl = 'https://api.calendly.com';

  private constructor() {}

  static getInstance(): CalendlyService {
    if (!CalendlyService.instance) {
      CalendlyService.instance = new CalendlyService();
    }
    return CalendlyService.instance;
  }

  /**
   * Set the OAuth access token
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Get the OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_CALENDLY_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      throw new Error('Calendly OAuth configuration missing');
    }

    // Don't specify scope - let Calendly use default scopes
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
    });

    const authUrl = `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
    console.log('Calendly OAuth URL:', authUrl);
    
    return authUrl;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get user information from Calendly
   */
  async getUserInfo(): Promise<{ data: any; error?: string }> {
    try {
      if (!this.accessToken) {
        return { data: null, error: 'Not authenticated. Please connect your Calendly account.' };
      }

      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { data: null, error: 'Authentication expired. Please reconnect your Calendly account.' };
        }
        throw new Error(`Calendly API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return { data: result };
    } catch (error) {
      console.error('Error fetching Calendly user info:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get scheduled events from Calendly
   */
  async getScheduledEvents(params: {
    organization?: string;
    user?: string;
    event_type?: string;
    status?: 'active' | 'canceled';
    min_start_time?: string;
    max_start_time?: string;
    count?: number;
    page_token?: string;
  } = {}): Promise<{ data: CalendlyScheduledEvent[]; error?: string }> {
    try {
      if (!this.accessToken) {
        return { data: [], error: 'Not authenticated. Please connect your Calendly account.' };
      }

      const queryParams = new URLSearchParams();
      
      // Always include the user parameter from the current user
      const userInfo = await this.getUserInfo();
      if (userInfo.data?.resource?.uri) {
        queryParams.append('user', userInfo.data.resource.uri);
        console.log('👤 Using user URI:', userInfo.data.resource.uri);
      }
      
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      // Try without date restrictions first to see all events
      // const now = new Date();
      // const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      // const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // queryParams.append('min_start_time', thirtyDaysAgo.toISOString());
      // queryParams.append('max_start_time', thirtyDaysFromNow.toISOString());

      // Add a larger count to get more events
      queryParams.append('count', '100');

      const url = `${this.baseUrl}/scheduled_events?${queryParams}`;
      console.log('🔗 Fetching Calendly events from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Calendly API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
          return { data: [], error: 'Authentication expired. Please reconnect your Calendly account.' };
        }
        if (response.status === 400) {
          return { data: [], error: `Bad request: ${errorText}. This might be due to missing permissions or incorrect parameters.` };
        }
        throw new Error(`Calendly API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📊 Calendly API response:', {
        total: result.collection?.length || 0,
        pagination: result.pagination,
        hasMore: !!result.pagination?.next_page_token
      });
      
      // If we have pagination, fetch more events
      let allEvents = result.collection || [];
      let nextPageToken = result.pagination?.next_page_token;
      
      while (nextPageToken && allEvents.length < 500) { // Limit to prevent infinite loops
        console.log('📄 Fetching next page with token:', nextPageToken);
        
        const nextPageParams = new URLSearchParams(queryParams);
        nextPageParams.set('page_token', nextPageToken);
        
        const nextPageUrl = `${this.baseUrl}/scheduled_events?${nextPageParams}`;
        const nextPageResponse = await fetch(nextPageUrl, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (nextPageResponse.ok) {
          const nextPageResult = await nextPageResponse.json();
          allEvents = allEvents.concat(nextPageResult.collection || []);
          nextPageToken = nextPageResult.pagination?.next_page_token;
        } else {
          console.error('❌ Error fetching next page:', nextPageResponse.status);
          break;
        }
      }
      
      console.log('📅 Total events found after pagination:', allEvents.length);
      console.log('📋 Event details:', allEvents.map((e: CalendlyScheduledEvent) => ({
        name: e.event.name,
        start_time: e.event.start_time,
        status: e.event.status,
        canceled: e.event.canceled,
        uri: e.event.uri,
        event_type: e.event.event_type?.name
      })));
      
      return { data: allEvents };
    } catch (error) {
      console.error('Error fetching Calendly events:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get event types from Calendly
   */
  async getEventTypes(params: {
    organization?: string;
    user?: string;
    active?: boolean;
    count?: number;
    page_token?: string;
  } = {}): Promise<{ data: any[]; error?: string }> {
    try {
      if (!this.accessToken) {
        return { data: [], error: 'Not authenticated. Please connect your Calendly account.' };
      }

      const queryParams = new URLSearchParams();
      
      // Always include the user parameter from the current user
      const userInfo = await this.getUserInfo();
      if (userInfo.data?.resource?.uri) {
        queryParams.append('user', userInfo.data.resource.uri);
      }
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });

      const url = `${this.baseUrl}/event_types?${queryParams}`;
      console.log('🔗 Fetching Calendly event types from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Calendly API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
          return { data: [], error: 'Authentication expired. Please reconnect your Calendly account.' };
        }
        if (response.status === 400) {
          return { data: [], error: `Bad request: ${errorText}. This might be due to missing permissions or incorrect parameters.` };
        }
        throw new Error(`Calendly API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📊 Calendly event types response:', {
        total: result.collection?.length || 0,
        pagination: result.pagination
      });
      
      return { data: result.collection || [] };
    } catch (error) {
      console.error('Error fetching Calendly event types:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Convert Calendly event to internal CalendarEvent format
   */
  convertCalendlyEventToCalendarEvent(calendlyEvent: CalendlyScheduledEvent): CalendarEvent {
    const startDate = new Date(calendlyEvent.event.start_time);
    const endDate = new Date(calendlyEvent.event.end_time);

    return {
      id: calendlyEvent.event.uri.split('/').pop() || '',
      title: calendlyEvent.event.name,
      date: startDate.toISOString().split('T')[0],
      time: startDate.toTimeString().split(' ')[0].substring(0, 5),
      endTime: endDate.toTimeString().split(' ')[0].substring(0, 5),
      location: calendlyEvent.event.location?.location || 'Online',
      attendees: 1, // Calendly events are typically 1:1
      type: this.mapEventTypeToInternal(calendlyEvent.event.event_type.name),
      description: calendlyEvent.event.event_type.description_plain || '',
      createdBy: 'calendly-sync',
      createdAt: new Date(),
      updatedAt: new Date(),
      calendlyUri: calendlyEvent.event.uri,
      inviteeEmail: calendlyEvent.invitee.email,
      inviteeName: calendlyEvent.invitee.name,
      status: calendlyEvent.event.canceled ? 'canceled' : 'confirmed',
    };
  }

  /**
   * Map Calendly event type to internal event type
   */
  private mapEventTypeToInternal(calendlyEventType: string): CalendarEvent['type'] {
    const typeMap: Record<string, CalendarEvent['type']> = {
      'consultation': 'consultation',
      'coaching': 'consultation',
      'workshop': 'workshop',
      'training': 'training',
      'meeting': 'meeting',
      'strategy': 'consultation',
      'review': 'meeting',
    };

    const lowerType = calendlyEventType.toLowerCase();
    
    for (const [key, value] of Object.entries(typeMap)) {
      if (lowerType.includes(key)) {
        return value;
      }
    }

    return 'consultation'; // Default fallback
  }

  /**
   * Sync Calendly events to internal calendar
   */
  async syncCalendlyEvents(): Promise<{ data: CalendarEvent[]; error?: string }> {
    try {
      console.log('🔍 Starting Calendly sync...');
      
      // First, let's get the user's info to understand what we're working with
      const userResponse = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('👤 Calendly user info:', userData);
      }

      // Get events without status filter first to see what's available
      const { data: allEvents, error: allEventsError } = await this.getScheduledEvents({
        count: 100,
        // Remove status filter to get all events
      });

      if (allEventsError) {
        console.error('❌ Error fetching all events:', allEventsError);
        return { data: [], error: allEventsError };
      }

      console.log('📅 Raw Calendly events found:', allEvents.length);
      console.log('📋 Event details:', allEvents.map(e => ({
        name: e.event.name,
        start_time: e.event.start_time,
        status: e.event.status,
        canceled: e.event.canceled,
        uri: e.event.uri
      })));

      // Filter for active events (not canceled)
      const activeEvents = allEvents.filter(event => !event.event.canceled);
      console.log('✅ Active events (not canceled):', activeEvents.length);

      const convertedEvents = activeEvents.map(event => {
        const converted = this.convertCalendlyEventToCalendarEvent(event);
        console.log('🔄 Converting event:', {
          original: event.event.name,
          converted: converted.title,
          date: converted.date,
          time: converted.time
        });
        return converted;
      });

      console.log('🎉 Sync complete. Converted events:', convertedEvents.length);
      return { data: convertedEvents };
    } catch (error) {
      console.error('❌ Error syncing Calendly events:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Test different event fetching approaches
   */
  async testEventFetching(): Promise<{ data: any; error?: string }> {
    try {
      console.log('🧪 Testing different event fetching approaches...');
      const results: any = {};

      // Test 1: Get events without any filters
      console.log('🔍 Test 1: No filters');
      const test1 = await this.getScheduledEvents({});
      results.test1_noFilters = test1;

      // Test 2: Get events with status filter
      console.log('🔍 Test 2: Active status only');
      const test2 = await this.getScheduledEvents({ status: 'active' });
      results.test2_activeOnly = test2;

      // Test 3: Get events with date range (last 6 months)
      console.log('🔍 Test 3: Last 6 months');
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const test3 = await this.getScheduledEvents({ 
        min_start_time: sixMonthsAgo.toISOString() 
      });
      results.test3_last6Months = test3;

      // Test 4: Get events with specific event type
      console.log('🔍 Test 4: Specific event type');
      const eventTypes = await this.getEventTypes();
      if (eventTypes.data.length > 0) {
        const test4 = await this.getScheduledEvents({ 
          event_type: eventTypes.data[0].uri 
        });
        results.test4_specificEventType = test4;
      }

      // Test 5: Get events from organization
      console.log('🔍 Test 5: Organization events');
      const userInfo = await this.getUserInfo();
      if (userInfo.data?.resource?.current_organization) {
        const test5 = await this.getScheduledEvents({ 
          organization: userInfo.data.resource.current_organization 
        });
        results.test5_organization = test5;
      }

      console.log('🧪 All tests completed');
      return { data: results };
    } catch (error) {
      console.error('Error testing event fetching:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
} 