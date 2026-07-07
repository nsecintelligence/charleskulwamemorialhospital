import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  User,
  Globe,
  RefreshCcw,
  Filter,
  X,
} from 'lucide-react';

interface SecurityLog {
  id: string;
  created_at: string;
  event_type: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  path: string | null;
  resource: string | null;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
}

const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-700 border-blue-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

const SEVERITY_ICONS = {
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
  SQL_INJECTION_ATTEMPT: 'SQL Injection Attempt',
  XSS_ATTEMPT: 'XSS Attempt',
  PATH_TRAVERSAL_ATTEMPT: 'Path Traversal',
  UNAUTHORIZED_ACCESS: 'Unauthorized Access',
  FORBIDDEN_ACCESS: 'Forbidden Access',
  INVALID_INPUT: 'Invalid Input',
  FILE_UPLOAD_REJECTED: 'File Upload Rejected',
  PASSWORD_RESET_REQUESTED: 'Password Reset',
  ACCOUNT_LOCKED: 'Account Locked',
  SUSPICIOUS_USER_AGENT: 'Suspicious User Agent',
};

export default function SecurityLogs() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('event_type', filter);
      }
      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, severityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResolve = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('security_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', logId);

      if (error) throw error;
      fetchLogs();
    } catch (error) {
      console.error('Error resolving log:', error);
    }
  };

  const getStats = () => {
    const total = logs.length;
    const critical = logs.filter((l) => l.severity === 'critical').length;
    const high = logs.filter((l) => l.severity === 'high').length;
    const unresolved = logs.filter((l) => !l.resolved).length;
    return { total, critical, high, unresolved };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            Security Logs
          </h1>
          <p className="text-gray-600 mt-1">Monitor and investigate security events</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Events</div>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
          <div className="text-sm text-red-600">Critical</div>
        </div>
        <div className="bg-white rounded-xl border border-orange-200 p-4">
          <div className="text-2xl font-bold text-orange-700">{stats.high}</div>
          <div className="text-sm text-orange-600">High Severity</div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4">
          <div className="text-2xl font-bold text-amber-700">{stats.unresolved}</div>
          <div className="text-sm text-amber-600">Unresolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">All Events</option>
          {Object.entries(EVENT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCcw className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : logs.length === 0 ? (
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
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Path</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const Icon = SEVERITY_ICONS[log.severity];
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                            SEVERITY_COLORS[log.severity]
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {EVENT_LABELS[log.event_type] || log.event_type}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {log.path || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {log.resolved ? (
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
                        {!log.resolved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(log.id);
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

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Event Type</label>
                  <p className="mt-1 text-gray-900 font-medium">
                    {EVENT_LABELS[selectedLog.event_type] || selectedLog.event_type}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Severity</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                        SEVERITY_COLORS[selectedLog.severity]
                      }`}
                    >
                      {selectedLog.severity}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Timestamp
                  </label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedLog.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Path
                  </label>
                  <p className="mt-1 text-gray-900">{selectedLog.path || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                    <User className="w-3 h-3" /> User ID
                  </label>
                  <p className="mt-1 text-gray-900 font-mono text-xs">
                    {selectedLog.user_id || 'Anonymous'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">IP Address</label>
                  <p className="mt-1 text-gray-900">
                    {selectedLog.ip_address || 'Not recorded'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">User Agent</label>
                <p className="mt-1 text-gray-900 text-sm">{selectedLog.user_agent || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Details</label>
                <pre className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-900 overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
              {selectedLog.resolved && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm">
                    Resolved at {new Date(selectedLog.resolved_at || '').toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {!selectedLog.resolved && (
                <button
                  onClick={() => {
                    handleResolve(selectedLog.id);
                    setSelectedLog(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Mark as Resolved
                </button>
              )}
              <button
                onClick={() => setSelectedLog(null)}
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
