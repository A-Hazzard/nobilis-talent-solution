import type { CalendarEvent } from '@/shared/types/entities';
import type { CalendlyScheduledEvent } from '@/lib/types/services';
import { getBaseUrl } from '@/lib/utils';

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
   * Set the access token
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
    console.log('🔑 Calendly access token set');
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Clear the access token
   */
  clearAccessToken(): void {
    this.accessToken = null;
    console.log('🔑 Calendly access token cleared');
  }

  /**
   * Get the OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('Calendly OAuth configuration missing');
    }

    // Dynamically construct the redirect URI based on the current domain
    const currentDomain = typeof window !== 'undefined' 
      ? window.location.origin 
      : getBaseUrl();
    
    const redirectUri = `${currentDomain}/api/auth/calendly/callback`;
    
    console.log('🔗 Using dynamic redirect URI:', redirectUri);
    console.log('🔍 Current domain:', currentDomain);
    console.log('🔍 Window location:', typeof window !== 'undefined' ? window.location.href : 'server-side');

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
   * Get the redirect URI for Calendly OAuth
   */
  getRedirectUri(): string {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/api/auth/calendly/callback`;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get user information from Calendly
   */
  async getUserInfo(): Promise<{ data: any; error?: string }> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return { data: null, error: 'Not authenticated. Please connect your Calendly account.' };
      }

      console.log('🔍 Testing token with getUserInfo...');
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Token is invalid, clearing it...');
          this.clearAccessToken();
          return { data: null, error: 'Authentication expired. Please reconnect your Calendly account.' };
        }
        const errorText = await response.text();
        console.error('❌ Calendly API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Calendly API error: ${response.status} ${response.statusText} - ${errorText}`);
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
      const token = this.getAccessToken();
      if (!token) {
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
          'Authorization': `Bearer ${token}`,
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
            'Authorization': `Bearer ${token}`,
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
        name: e.event?.name || 'Unknown Event',
        start_time: e.event?.start_time || 'No start time',
        status: e.event?.status || 'Unknown status',
        canceled: e.event?.canceled || false,
        uri: e.event?.uri || 'No URI',
        event_type: e.event?.event_type?.name || 'Unknown type'
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
      const token = this.getAccessToken();
      if (!token) {
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
          'Authorization': `Bearer ${token}`,
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
   * Convert a Calendly event to our internal CalendarEvent format
   */
  convertCalendlyEventToCalendarEvent(calendlyEvent: CalendlyScheduledEvent): CalendarEvent {
    const startDate = new Date(calendlyEvent.start_time);
    const endDate = new Date(calendlyEvent.end_time);

    return {
      id: calendlyEvent.uri,
      title: calendlyEvent.name,
      date: startDate.toISOString().split('T')[0],
      time: `${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`,
      location: calendlyEvent.location?.type || 'Online',
      attendees: calendlyEvent.invitees_counter?.total || 1,
      type: this.mapEventTypeToInternal(calendlyEvent.event_type),
      createdBy: 'calendly',
      createdAt: new Date(calendlyEvent.created_at),
      updatedAt: new Date(calendlyEvent.updated_at),
      calendlyUri: calendlyEvent.uri,
      status: calendlyEvent.status === 'active' ? 'confirmed' : 'canceled'
    };
  }

  /**
   * Map Calendly event type to internal event type
   */
  private mapEventTypeToInternal(calendlyEventType: string): CalendarEvent['type'] {
    // Extract event type name from URI
    // URI format: https://api.calendly.com/event_types/EVENT_TYPE_ID
    const eventTypeName = calendlyEventType.split('/').pop() || '';
    
    const typeMap: Record<string, CalendarEvent['type']> = {
      'consultation': 'consultation',
      'coaching': 'consultation',
      'workshop': 'workshop',
      'training': 'training',
      'meeting': 'meeting',
      'strategy': 'consultation',
      'review': 'meeting',
      'test': 'meeting', // Add test as a meeting type
    };

    const lowerType = eventTypeName.toLowerCase();
    
    for (const [key, value] of Object.entries(typeMap)) {
      if (lowerType.includes(key)) {
        return value;
      }
    }

    return 'meeting'; // Default fallback
  }

  /**
   * Sync Calendly events to the local calendar
   */
  async syncCalendlyEvents(): Promise<{ data: any[]; error?: string }> {
    try {
      const events = await this.getScheduledEvents();
      
      if (events.error) {
        return { data: [], error: events.error };
      }

      console.log('🔄 Syncing Calendly events:', events.data.length);
      
      const syncedEvents = [];
      
      for (const calendlyEvent of events.data) {
        try {
          // Skip canceled events
          if (calendlyEvent.status === 'canceled') {
            console.log('⏭️ Skipping canceled event:', calendlyEvent.name);
            continue;
          }

          // Skip events with missing required data
          if (!calendlyEvent.name || !calendlyEvent.start_time) {
            console.warn('⚠️ Skipping event with missing data:', calendlyEvent);
            continue;
          }

          // Use the new conversion method
          const convertedEvent = this.convertCalendlyEventToCalendarEvent(calendlyEvent);
          console.log('🔄 Converting event:', calendlyEvent.name, 'to:', convertedEvent);
          syncedEvents.push(convertedEvent);
        } catch (eventError) {
          console.error('❌ Error processing individual event:', eventError);
          continue;
        }
      }
      
      console.log('✅ Successfully synced events:', syncedEvents.length);
      return { data: syncedEvents };
    } catch (error) {
      console.error('Error syncing Calendly events:', error);
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

  /**
   * Create a new Calendly event
   */
  async createEvent(eventData: {
    event_type: string;
    start_time: string;
    end_time: string;
    invitee: {
      name: string;
      email: string;
    };
    location?: {
      type: string;
      location?: string;
    };
    custom_questions?: Array<{
      question: string;
      answer: string;
    }>;
  }): Promise<{ data: CalendlyScheduledEvent | null; error?: string }> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return { data: null, error: 'Not authenticated. Please connect your Calendly account.' };
      }

      const url = `${this.baseUrl}/scheduling_links`;
      console.log('🔗 Creating Calendly event:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Calendly API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
          return { data: null, error: 'Authentication expired. Please reconnect your Calendly account.' };
        }
        if (response.status === 400) {
          return { data: null, error: `Bad request: ${errorText}. This might be due to missing permissions or incorrect parameters.` };
        }
        throw new Error(`Calendly API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Calendly event created:', result);
      
      return { data: result };
    } catch (error) {
      console.error('Error creating Calendly event:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Check if a Calendly event exists
   */
  async checkEventExists(eventUri: string): Promise<{ exists: boolean; error?: string }> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return { exists: false, error: 'Not authenticated. Please connect your Calendly account.' };
      }

      console.log('🔍 Checking if event exists:', eventUri);

      const response = await fetch(eventUri, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Event existence check response status:', response.status);

      if (response.status === 404) {
        console.log('❌ Event not found in Calendly');
        return { exists: false };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error checking event existence:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: eventUri
        });
        return { exists: false, error: `Error checking event: ${response.status} ${response.statusText}` };
      }

      const eventData = await response.json();
      console.log('✅ Event exists in Calendly:', eventData.uri);
      return { exists: true };
    } catch (error) {
      console.error('Error checking event existence:', error);
      return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update a Calendly event
   */
  async updateEvent(eventUri: string, updateData: {
    name?: string;
    start_time?: string;
    end_time?: string;
    location?: {
      type: string;
      location?: string;
    };
    meeting_notes_plain?: string;
  }): Promise<{ data: CalendlyScheduledEvent | null; error?: string }> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return { data: null, error: 'Not authenticated. Please connect your Calendly account.' };
      }

      console.log('🔗 Updating Calendly event with URI:', eventUri);
      console.log('📝 Update data:', updateData);

      // Use the full Calendly URI for the API call
      const url = eventUri;
      console.log('🔗 Updating Calendly event at URL:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('📊 Calendly update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Calendly API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url
        });
        
        if (response.status === 401) {
          return { data: null, error: 'Authentication expired. Please reconnect your Calendly account.' };
        }
        if (response.status === 404) {
          return { data: null, error: 'Event not found in Calendly.' };
        }
        if (response.status === 403) {
          return { data: null, error: 'Permission denied. You may not have permission to update this event.' };
        }
        throw new Error(`Calendly API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Calendly event updated successfully:', result);
      
      return { data: result };
    } catch (error) {
      console.error('Error updating Calendly event:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Cancel a Calendly event
   */
  async cancelEvent(eventUri: string, reason?: string): Promise<{ data: boolean; error?: string }> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return { data: false, error: 'Not authenticated. Please connect your Calendly account.' };
      }

      console.log('🔗 Canceling Calendly event with URI:', eventUri);

      // Use the full Calendly URI for cancellation
      const url = `${eventUri}/cancellation`;
      console.log('🔗 Canceling Calendly event at URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'Event canceled by user'
        }),
      });

      console.log('📊 Calendly cancellation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Calendly API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url
        });
        
        if (response.status === 401) {
          return { data: false, error: 'Authentication expired. Please reconnect your Calendly account.' };
        }
        if (response.status === 404) {
          return { data: false, error: 'Event not found in Calendly.' };
        }
        if (response.status === 403) {
          return { data: false, error: 'Permission denied. You may not have permission to cancel this event.' };
        }
        throw new Error(`Calendly API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log('✅ Calendly event canceled successfully');
      return { data: true };
    } catch (error) {
      console.error('Error canceling Calendly event:', error);
      return { data: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
} 