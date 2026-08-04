import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  Activity,
  Globe,
  RefreshCcw,
  Filter,
  X,
  TrendingUp,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  MapPin,
  Server,
  Zap,
  Lock,
  Wifi,
} from 'lucide-react';

interface SocEvent {
  id: string;
  created_at: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_domain: string;
  ip_address: string | null;
  user_agent: string | null;
  path: string | null;
  method: string | null;
  attack_vector: string | null;
  payload_snippet: string | null;
  country: string | null;
  country_code: string | null;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  metadata: Record<string, unknown>;
}

type TimeRange = '1h' | '24h' | '7d' | '30d' | 'all';

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700 border-blue-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const SEVERITY_DOT: Record<string, string> = {
  low: 'bg-blue-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const SEVERITY_ICONS: Record<string, typeof Info> = {
  low: Info,
  medium: AlertTriangle,
  high: AlertCircle,
  critical: AlertCircle,
};

const EVENT_LABELS: Record<string, string> = {
  LOGIN_FAILED: 'Failed Login',
  LOGIN_SUCCESS: 'Successful Login',
  LOGOUT: 'Logout',
  CSRF_VIOLATION: 'CSRF Violation',
  RATE_LIMIT_EXCEEDED: 'Rate Limit Exceeded',
  SUSPICIOUS_REQUEST: 'Suspicious Request',
  SQL_INJECTION_ATTEMPT: 'SQL Injection',
  XSS_ATTEMPT: 'XSS Attempt',
  PATH_TRAVERSAL_ATTEMPT: 'Path Traversal',
  UNAUTHORIZED_ACCESS: 'Unauthorized Access',
  FORBIDDEN_ACCESS: 'Forbidden Access',
  INVALID_INPUT: 'Invalid Input',
  FILE_UPLOAD_REJECTED: 'File Upload Rejected',
  PASSWORD_RESET_REQUESTED: 'Password Reset',
  ACCOUNT_LOCKED: 'Account Locked',
  SUSPICIOUS_USER_AGENT: 'Suspicious User Agent',
  PORT_SCAN: 'Port Scan',
  BRUTE_FORCE: 'Brute Force',
  DDOS_ATTEMPT: 'DDoS Attempt',
  CRAWLER_ABUSE: 'Crawler Abuse',
  BOT_TRAFFIC: 'Bot Traffic',
  RATE_LIMIT_BURST: 'Rate Limit Burst',
};

const TIME_RANGE_MS: Record<TimeRange, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  all: 0,
};

export default function SocPanel() {
  const [events, setEvents] = useState<SocEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<SocEvent | null>(null);
  const [liveMode, setLiveMode] = useState(true);
  const [view, setView] = useState<'overview' | 'events' | 'threats'>('overview');
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('soc_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (timeRange !== 'all') {
        const since = new Date(Date.now() - TIME_RANGE_MS[timeRange]).toISOString();
        query = query.gte('created_at', since);
      }
      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }
      if (domainFilter !== 'all') {
        query = query.eq('source_domain', domainFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching SOC events:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, severityFilter, domainFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Real-time subscription for live attack monitoring
  useEffect(() => {
    if (!liveMode) {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      return;
    }

    const channel = supabase
      .channel('soc-events-live')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'soc_events' },
        (payload) => {
          setEvents((prev) => [payload.new as SocEvent, ...prev].slice(0, 200));
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [liveMode]);

  const handleResolve = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('soc_events')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', eventId);
      if (error) throw error;
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, resolved: true, resolved_at: new Date().toISOString() } : e))
      );
    } catch (error) {
      console.error('Error resolving event:', error);
    }
  };

  const handleBulkResolve = async () => {
    const unresolvedIds = events.filter((e) => !e.resolved).map((e) => e.id);
    if (unresolvedIds.length === 0) return;
    try {
      const { error } = await supabase
        .from('soc_events')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .in('id', unresolvedIds);
      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error('Error bulk resolving:', error);
    }
  };

  // Compute stats
  const stats = {
    total: events.length,
    critical: events.filter((e) => e.severity === 'critical').length,
    high: events.filter((e) => e.severity === 'high').length,
    medium: events.filter((e) => e.severity === 'medium').length,
    low: events.filter((e) => e.severity === 'low').length,
    unresolved: events.filter((e) => !e.resolved).length,
    attacks: events.filter((e) =>
      ['SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT', 'PATH_TRAVERSAL_ATTEMPT', 'BRUTE_FORCE', 'DDOS_ATTEMPT', 'PORT_SCAN'].includes(e.event_type)
    ).length,
  };

  // Top attacking IPs
  const topIps = Object.entries(
    events.reduce((acc, e) => {
      if (e.ip_address) acc[e.ip_address] = (acc[e.ip_address] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Attack types breakdown
  const attackTypes = Object.entries(
    events.reduce((acc, e) => {
      acc[e.event_type] = (acc[e.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Domain breakdown
  const domainStats = Object.entries(
    events.reduce((acc, e) => {
      acc[e.source_domain] = (acc[e.source_domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  // Events in last hour (for activity sparkline)
  const lastHourCount = events.filter(
    (e) => Date.now() - new Date(e.created_at).getTime() < 60 * 60 * 1000
  ).length;

  const uniqueDomains = [...new Set(events.map((e) => e.source_domain))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            SOC Monitoring
          </h1>
          <p className="text-gray-600 mt-1">Real-time security operations center — attack monitoring across all domains</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLiveMode(!liveMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              liveMode
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-gray-50 text-gray-600 border border-gray-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${liveMode ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            {liveMode ? 'LIVE' : 'PAUSED'}
          </button>
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['overview', 'events', 'threats'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {v === 'overview' ? 'Overview' : v === 'events' ? 'All Events' : 'Active Threats'}
          </button>
        ))}
      </div>

      {/* Overview View */}
      {view === 'overview' && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Events" value={stats.total} icon={Activity} color="text-gray-700" bg="bg-gray-50" />
            <StatCard label="Active Threats" value={stats.attacks} icon={Zap} color="text-red-600" bg="bg-red-50" />
            <StatCard label="Critical" value={stats.critical} icon={AlertCircle} color="text-red-700" bg="bg-red-50" />
            <StatCard label="High" value={stats.high} icon={AlertTriangle} color="text-orange-600" bg="bg-orange-50" />
            <StatCard label="Unresolved" value={stats.unresolved} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
            <StatCard label="Last Hour" value={lastHourCount} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
          </div>

          {/* Domain Status + Attack Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domain Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Domain Status
              </h3>
              <div className="space-y-3">
                {domainStats.length > 0 ? (
                  domainStats.map(([domain, count]) => (
                    <div key={domain} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium text-gray-900">{domain}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{count} events</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          Monitored
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No events yet</p>
                )}
              </div>
            </div>

            {/* Attack Types Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                Top Event Types
              </h3>
              <div className="space-y-2">
                {attackTypes.length > 0 ? (
                  attackTypes.map(([type, count]) => (
                    <div key={type} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-32 truncate">
                        {EVENT_LABELS[type] || type}
                      </span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-8 text-right">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No events yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Attacking IPs */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-600" />
              Top Source IPs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Events</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Threat Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topIps.length > 0 ? (
                    topIps.map(([ip, count]) => {
                      const ipEvents = events.filter((e) => e.ip_address === ip);
                      const maxSeverity = ipEvents.reduce((max, e) => {
                        const order = { low: 0, medium: 1, high: 2, critical: 3 };
                        return order[e.severity] > order[max] ? e.severity : max;
                      }, 'low' as string);
                      return (
                        <tr key={ip} className="hover:bg-gray-50">
                          <td className="py-2 px-3 text-sm font-mono text-gray-900">{ip}</td>
                          <td className="py-2 px-3 text-sm text-gray-600">{count}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${SEVERITY_COLORS[maxSeverity]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[maxSeverity]}`} />
                              {maxSeverity}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-sm text-gray-400">
                        No IP data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Events View */}
      {view === 'events' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Domains</option>
              {uniqueDomains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {stats.unresolved > 0 && (
              <button
                onClick={handleBulkResolve}
                className="ml-auto px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                Resolve All ({stats.unresolved})
              </button>
            )}
          </div>

          {/* Events Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <RefreshCcw className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <Shield className="w-12 h-12 mb-3 text-gray-300" />
                <p>No security events found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Severity</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Event</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Domain</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">IP</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Path</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {events.map((event) => {
                      const Icon = SEVERITY_ICONS[event.severity] || Info;
                      return (
                        <tr
                          key={event.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${SEVERITY_COLORS[event.severity]}`}>
                              <Icon className="w-3 h-3" />
                              {event.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900 text-sm">
                              {EVENT_LABELS[event.event_type] || event.event_type}
                            </div>
                            {event.attack_vector && (
                              <div className="text-xs text-gray-400">{event.attack_vector}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-gray-400" />
                              {event.source_domain}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-gray-600">
                            {event.ip_address || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                            {event.path || '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(event.created_at).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {event.resolved ? (
                              <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Resolved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-600 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                Open
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {!event.resolved && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResolve(event.id);
                                }}
                                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                              >
                                Resolve
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Threats View — only critical/high attack events */}
      {view === 'threats' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-600" />
              Active Threats
            </h2>
            {events.filter((e) => !e.resolved && ['critical', 'high'].includes(e.severity)).length > 0 && (
              <button
                onClick={handleBulkResolve}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                Resolve All Threats
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events
              .filter((e) => ['critical', 'high'].includes(e.severity))
              .map((event) => {
                const Icon = SEVERITY_ICONS[event.severity];
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${
                      event.severity === 'critical' ? 'border-red-200' : 'border-orange-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          event.severity === 'critical' ? 'bg-red-100' : 'bg-orange-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${event.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {EVENT_LABELS[event.event_type] || event.event_type}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(event.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {!event.resolved && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium animate-pulse">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      {event.source_domain && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {event.source_domain}
                        </div>
                      )}
                      {event.ip_address && (
                        <div className="flex items-center gap-1">
                          <Server className="w-3 h-3" /> {event.ip_address}
                        </div>
                      )}
                      {event.path && (
                        <div className="flex items-center gap-1 truncate">
                          <Eye className="w-3 h-3" /> {event.path}
                        </div>
                      )}
                      {event.payload_snippet && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700 truncate">
                          {event.payload_snippet}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            {events.filter((e) => ['critical', 'high'].includes(e.severity)).length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center p-12 text-gray-500">
                <Shield className="w-12 h-12 mb-3 text-emerald-300" />
                <p className="font-medium">No active threats detected</p>
                <p className="text-sm text-gray-400 mt-1">All clear across all monitored domains</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                Event Details
              </h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Event Type" value={EVENT_LABELS[selectedEvent.event_type] || selectedEvent.event_type} />
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Severity</label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${SEVERITY_COLORS[selectedEvent.severity]}`}>
                      {selectedEvent.severity}
                    </span>
                  </p>
                </div>
                <DetailField label="Timestamp" value={new Date(selectedEvent.created_at).toLocaleString()} icon={Clock} />
                <DetailField label="Domain" value={selectedEvent.source_domain} icon={Globe} />
                <DetailField label="IP Address" value={selectedEvent.ip_address || 'Not recorded'} icon={Server} />
                <DetailField label="Method" value={selectedEvent.method || '-'} />
                <DetailField label="Path" value={selectedEvent.path || '-'} icon={Eye} />
                <DetailField label="Attack Vector" value={selectedEvent.attack_vector || '-'} icon={Zap} />
              </div>
              {selectedEvent.user_agent && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">User Agent</label>
                  <p className="mt-1 text-gray-900 text-sm">{selectedEvent.user_agent}</p>
                </div>
              )}
              {selectedEvent.payload_snippet && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Payload</label>
                  <pre className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-900 overflow-x-auto">
                    {selectedEvent.payload_snippet}
                  </pre>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Metadata</label>
                <pre className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-900 overflow-x-auto">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
              {selectedEvent.resolved && selectedEvent.resolved_at && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Resolved at {new Date(selectedEvent.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {!selectedEvent.resolved && (
                <button
                  onClick={() => {
                    handleResolve(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Mark as Resolved
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: typeof Activity;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-gray-100`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function DetailField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Clock;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      <p className="mt-1 text-gray-900">{value}</p>
    </div>
  );
}
