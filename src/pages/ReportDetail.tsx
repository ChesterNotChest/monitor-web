import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Activity, AlertTriangle, BarChart3, Bot, Calendar, CheckCircle,
  Clock, KeyRound, RefreshCw, ShieldAlert, Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import type { PersistedDailyReportResponse, ReportSettingsResponse } from '../api/types';

const riskTone: Record<string, { label: string; color: string; bg: string }> = {
  LOW: { label: '低风险', color: 'var(--color-success)', bg: 'var(--color-success-dim)' },
  MEDIUM: { label: '中风险', color: 'var(--color-warning)', bg: 'var(--color-warning-dim)' },
  HIGH: { label: '高风险', color: 'var(--color-danger)', bg: 'var(--color-danger-dim)' },
  EMERGENCY: { label: '紧急', color: 'var(--color-danger)', bg: 'var(--color-danger-dim)' },
};

export default function ReportDetail() {
  const { date } = useParams<{ date: string }>();
  const today = new Date().toISOString().slice(0, 10);
  const [reportDate, setReportDate] = useState(date || today);

  const [report, setReport] = useState<PersistedDailyReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genLoading, setGenLoading] = useState(false);

  // Settings
  const [settings, setSettings] = useState<ReportSettingsResponse | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('deepseek-v4-flash');
  const [saveMsg, setSaveMsg] = useState('');

  // Fetch report
  const fetchReport = async (d?: string) => {
    setLoading(true);
    setError('');
    try {
      const target = d || reportDate;
      setReport(await client.fetchPersistedDailyReport(target));
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setSettings(await client.fetchReportSettings());
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchReport(); fetchSettings(); }, [reportDate]);

  // Generate now
  const doGenerate = async () => {
    setGenLoading(true);
    setError('');
    try {
      const r = await client.generateDailyReportNow();
      setReport(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setGenLoading(false);
    }
  };

  // Save API key
  const saveSettings = async () => {
    setSaveMsg('');
    try {
      const r = await client.updateReportSettings({
        api_key: apiKeyInput || '',
        model: modelInput || 'deepseek-v4-flash',
      });
      setSettings(r);
      setSaveMsg('已保存');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (e) {
      setSaveMsg('保存失败: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const openSettings = () => {
    if (settings) {
      setApiKeyInput('');
      setModelInput(settings.model || 'deepseek-v4-flash');
    }
    setShowSettings(true);
  };

  const stats = report?.stats;
  const insights = report?.insights;
  const risk = riskTone[stats?.risk_level || 'LOW'] || riskTone.LOW;

  return (
    <div style={{ padding: 'var(--space-6)', height: '100%', overflow: 'auto' }}>
      {/* ── Toolbar ── */}
      <div className="rp-toolbar">
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', margin: 0 }}>
            日报 · {reportDate}
          </h2>
          <div style={{ color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Calendar size={14} />
            <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', outline: 'none' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" icon={KeyRound} onClick={openSettings}>API Key</Button>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => fetchReport()} disabled={loading || genLoading}>刷新</Button>
          <Button variant="primary" size="sm" icon={Zap} onClick={doGenerate} loading={genLoading} disabled={loading}>
            立即生成当天日报
          </Button>
        </div>
      </div>

      {/* ── Loading / Error ── */}
      {loading ? (
        <Skeleton variant="card" count={4} />
      ) : error ? (
        <div className="rp-error">
          <AlertTriangle size={32} style={{ marginBottom: 'var(--space-3)' }} />
          <div style={{ marginBottom: 'var(--space-3)' }}>{error}</div>
          <Button variant="secondary" onClick={() => fetchReport()}>重试</Button>
        </div>
      ) : stats ? (
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {/* ══════ Stats Layer ══════ */}
          <section className="rp-section">
            <div className="rp-section-hdr">
              <BarChart3 size={18} />
              <span>统计层</span>
              <span className="rp-pill">规则引擎 · 永远可用</span>
            </div>

            {/* KPI cards */}
            <div className="rp-kpi-grid">
              <KpiCard label="告警总数" value={stats.total_alerts} icon={Activity} tone="info" />
              <KpiCard label="风险等级" value={risk.label} icon={ShieldAlert} tone={stats.risk_level === 'LOW' ? 'success' : 'danger'} />
              <KpiCard label="异常类型" value={stats.top_exceptions.length} icon={BarChart3} tone="warning" />
              <KpiCard label="高峰时段" value={stats.hourly_trend[0]?.hour || '-'} icon={Clock} tone="success" />
            </div>

            {/* Severity + Top Exceptions */}
            <div className="rp-two-col">
              <RankPanel title="严重级别分布" items={stats.by_severity} empty="暂无数据" />
              <RankPanel title="高频异常 Top 5" items={stats.top_exceptions} empty="暂无数据" />
            </div>

            {/* Hourly trend bar chart */}
            {stats.hourly_trend.length > 0 && (
              <div style={{ marginTop: 'var(--space-2)' }}>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-3)' }}>小时趋势</h4>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
                  {stats.hourly_trend.map((p, i) => {
                    const max = Math.max(...stats.hourly_trend.map(x => x.count), 1);
                    const h = (p.count / max) * 100;
                    return (
                      <div key={i} title={`${p.hour}: ${p.count}`}
                        style={{ flex: 1, height: `${h}%`, background: 'var(--color-info)', borderRadius: '2px 2px 0 0', minHeight: 2, opacity: 0.7 + (h / 300) }} />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-disabled)', marginTop: 4 }}>
                  <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
                </div>
              </div>
            )}

            {/* by_view + entity_types */}
            <div className="rp-two-col" style={{ marginTop: 'var(--space-2)' }}>
              <RankPanel title="按视图分布" items={stats.by_view || []} empty="暂无数据" />
              <RankPanel title="实体类型分布" items={stats.entity_types || []} empty="暂无数据" />
            </div>

            {/* Time range */}
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', marginTop: 'var(--space-2)', textAlign: 'right' }}>
              数据范围: {stats.time_range_start} ~ {stats.time_range_end}
            </div>
          </section>

          {/* ══════ Insights Layer ══════ */}
          <section className="rp-section">
            <div className="rp-section-hdr">
              <Bot size={18} />
              <span>洞察层</span>
              {insights && !insights.partial
                ? <span className="rp-pill" style={{ background: 'var(--color-success-dim)', color: 'var(--color-success)' }}>AI 已生成</span>
                : insights?.partial
                  ? <span className="rp-pill" style={{ background: 'var(--color-warning-dim)', color: 'var(--color-warning)' }}>部分生成</span>
                  : <span className="rp-pill">需配置 API Key</span>
              }
              {report?.ai_model && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', marginLeft: 'auto' }}>{report.ai_model}</span>}
            </div>

            {insights ? (
              <>
                {/* Summary */}
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, margin: '0 0 var(--space-4)' }}>
                  {insights.summary}
                </p>

                {/* Key findings + Recommendations */}
                <div className="rp-two-col">
                  <ListPanel title="关键发现" items={insights.key_findings} icon={AlertTriangle} />
                  <ListPanel title="处置建议" items={insights.recommendations} icon={CheckCircle} />
                </div>

                {/* Trend forecast */}
                {insights.trend_forecast && (
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-3)' }}>
                      趋势预测
                      {insights.trend_forecast.confidence != null && (
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', marginLeft: 'var(--space-2)' }}>
                          置信度: {Math.round((insights.trend_forecast.confidence as number) * 100)}%
                        </span>
                      )}
                    </h4>
                    {(insights.trend_forecast as Record<string, unknown>).periods ? (
                      <div title={String((insights.trend_forecast as Record<string, unknown>).method || '')}>
                        {((insights.trend_forecast as Record<string, unknown>).periods as string[]).map((p: string, i: number) => {
                          const vals = (insights.trend_forecast as Record<string, unknown>).predicted as number[];
                          const max = Math.max(...(vals || [1]), 1);
                          const v = vals?.[i] || 0;
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                              <span style={{ width: 48, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{p}</span>
                              <div style={{ flex: 1, height: 6, background: 'var(--bg-canvas)', borderRadius: 3 }}>
                                <div style={{ width: `${(v / max) * 100}%`, height: '100%', background: 'var(--color-info)', borderRadius: 3 }} />
                              </div>
                              <span style={{ width: 28, fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textAlign: 'right' }}>{v}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-disabled)', fontSize: 'var(--text-sm)' }}>AI 未能提供预测数据</div>
                    )}
                  </div>
                )}

                {/* Risk distribution */}
                {insights.risk_distribution && insights.risk_distribution.length > 0 && (
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-3)' }}>风险分布</h4>
                    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                      {insights.risk_distribution.map((r: { label: string; value: number; severity: string }, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{r.label}</span>
                          <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>{r.value}</span>
                          <span style={{
                            fontSize: 'var(--text-xs)', padding: '1px 6px', borderRadius: 'var(--radius-full)',
                            background: riskTone[r.severity]?.bg || 'var(--bg-elevated)',
                            color: riskTone[r.severity]?.color || 'var(--text-secondary)',
                          }}>{r.severity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {insights.partial && (
                  <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-warning-dim)', borderRadius: 'var(--radius-sm)', color: 'var(--color-warning)', fontSize: 'var(--text-xs)' }}>
                    AI 部分步骤未能完成，已展示可用内容。可重新生成以获取完整洞察。
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-disabled)' }}>
                <Bot size={48} style={{ marginBottom: 'var(--space-3)', opacity: 0.3 }} />
                <div>洞察层需要配置 DeepSeek API Key</div>
                <div style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
                  统计层数据基于规则引擎生成，无需 API Key
                </div>
                <Button variant="primary" size="sm" style={{ marginTop: 'var(--space-3)' }} icon={KeyRound} onClick={openSettings}>
                  配置 API Key
                </Button>
              </div>
            )}
          </section>

          {/* Reported by */}
          <div style={{ textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', padding: 'var(--space-1) 0' }}>
            {report?.ai_provider ? `AI: ${report.ai_provider} · ${report.ai_model || ''}` : '规则引擎'}
            {report?.regenerated_count ? ` · 已重生成 ${report.regenerated_count} 次` : ''}
          </div>
        </div>
      ) : (
        <div className="rp-error">
          <div style={{ marginBottom: 'var(--space-3)', color: 'var(--text-disabled)' }}>该日期尚无日报数据</div>
          <Button variant="primary" icon={Zap} onClick={doGenerate} loading={genLoading}>立即生成</Button>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="rp-footer">
        <span>所有时间均为北京时间 (UTC+8)</span>
        <span>下次自动生成: {report?.next_scheduled_at || settings?.next_scheduled_at || '—'}</span>
      </div>

      {/* ── Settings Modal ── */}
      {showSettings && (
        <>
          <div onClick={() => setShowSettings(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 70 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 80,
            background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,.1)',
            padding: 'var(--space-6)', minWidth: 420, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>API Key 设置</h3>
              <div style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowSettings(false)}>✕</div>
            </div>

            {settings?.has_key && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                已配置 Key: {settings.key_preview}（来源: {settings.source === 'env' ? '.env 文件' : '手动输入'}）
              </div>
            )}

            <div style={{ display: 'grid', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>DeepSeek API Key（留空使用 .env 默认值）</label>
                <input type="password" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)}
                  placeholder="sk-..." autoComplete="off"
                  style={{ width: '100%', height: 40, padding: '0 var(--space-3)', background: 'var(--bg-canvas)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: 'var(--text-sm)' }} />
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>模型</label>
                <input value={modelInput} onChange={e => setModelInput(e.target.value)}
                  placeholder="deepseek-v4-flash"
                  style={{ width: '100%', height: 40, padding: '0 var(--space-3)', background: 'var(--bg-canvas)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', fontSize: 'var(--text-sm)' }} />
              </div>
            </div>

            {saveMsg && <div style={{ color: saveMsg.includes('失败') ? 'var(--color-danger)' : 'var(--color-success)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>{saveMsg}</div>}

            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>取消</Button>
              <Button variant="primary" size="sm" onClick={saveSettings}>保存</Button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .rp-toolbar{display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);margin-bottom:var(--space-5);flex-wrap:wrap}
        .rp-section{background:var(--bg-surface);border:1px solid rgba(255,255,255,.08);border-radius:var(--radius-md);padding:var(--space-5)}
        .rp-section-hdr{display:flex;align-items:center;gap:var(--space-2);font-weight:var(--font-semibold);color:var(--text-primary);margin-bottom:var(--space-4);flex-wrap:wrap}
        .rp-pill{display:inline-flex;align-items:center;height:24px;padding:0 var(--space-2);border-radius:var(--radius-full);background:var(--bg-canvas);color:var(--text-secondary);font-size:var(--text-xs);white-space:nowrap}
        .rp-error{text-align:center;padding:var(--space-12);color:var(--color-danger)}
        .rp-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3);margin-bottom:var(--space-4)}
        .rp-two-col{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)}
        .rp-footer{display:flex;justify-content:space-between;margin-top:var(--space-6);padding-top:var(--space-4);border-top:1px solid rgba(255,255,255,.06);font-size:var(--text-xs);color:var(--text-disabled)}
        @media(max-width:960px){.rp-kpi-grid,.rp-two-col{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}

// ── Sub-components ──

function KpiCard({ label, value, icon: Icon, tone }: { label: string; value: number | string; icon: typeof Activity; tone: string }) {
  const colors: Record<string, string[]> = {
    info: ['var(--color-info-dim)', 'var(--color-info)'],
    success: ['var(--color-success-dim)', 'var(--color-success)'],
    warning: ['var(--color-warning-dim)', 'var(--color-warning)'],
    danger: ['var(--color-danger-dim)', 'var(--color-danger)'],
  };
  const [bg, fg] = colors[tone] || colors.info;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color: fg }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ color: 'var(--text-primary)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>{value}</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{label}</div>
      </div>
    </div>
  );
}

function ListPanel({ title, items, icon: Icon }: { title: string; items: string[]; icon: typeof AlertTriangle }) {
  return (
    <div>
      <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 var(--space-3)' }}>
        <Icon size={16} />{title}
      </h4>
      <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
        {items.map((item, i) => (
          <div key={i} style={{ color: 'var(--text-primary)', lineHeight: 1.7, padding: 'var(--space-3)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)' }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function RankPanel({ title, items, empty }: { title: string; items: { label: string; value: number }[]; empty: string }) {
  return (
    <div>
      <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0 0 var(--space-3)' }}>{title}</h4>
      {items.length === 0 ? (
        <div style={{ color: 'var(--text-disabled)', fontSize: 'var(--text-sm)' }}>{empty}</div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {items.map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 'var(--text-sm)' }}>
              <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-semibold)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
