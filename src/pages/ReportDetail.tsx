import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle,
  ClipboardList,
  KeyRound,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import type { DailyReportResponse } from '../api/types';

const riskTone: Record<string, { label: string; color: string; bg: string }> = {
  LOW: { label: '低风险', color: 'var(--color-success)', bg: 'var(--color-success-dim)' },
  MEDIUM: { label: '中风险', color: 'var(--color-warning)', bg: 'var(--color-warning-dim)' },
  HIGH: { label: '高风险', color: 'var(--color-danger)', bg: 'var(--color-danger-dim)' },
  EMERGENCY: { label: '紧急', color: 'var(--color-danger)', bg: 'var(--color-danger-dim)' },
};

export default function ReportDetail() {
  const { date } = useParams<{ date: string }>();
  const reportDate = date || new Date().toISOString().slice(0, 10);
  const [report, setReport] = useState<DailyReportResponse | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('deepseek-v4-flash');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiError, setAiError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setAiError('');
    try {
      setReport(await client.fetchDailyReport(reportDate));
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const generateWithDeepSeek = async () => {
    const key = apiKey.trim();
    setAiError('');
    if (!key) {
      setAiError('请输入 DeepSeek API Key');
      return;
    }

    setAiLoading(true);
    try {
      setReport(await client.generateDeepSeekDailyReport({
        date: reportDate,
        api_key: key,
        model: model.trim() || 'deepseek-v4-flash',
      }));
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'DeepSeek 生成失败');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [reportDate]);

  const risk = useMemo(() => riskTone[report?.risk_level || 'LOW'] || riskTone.LOW, [report]);
  const reportSource = report?.ai_generated
    ? `DeepSeek · ${report.ai_model || model}`
    : '本地规则报告';

  return (
    <div style={{ padding: 'var(--space-6)', height: '100%', overflow: 'auto' }}>
      <div className="report-toolbar">
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', margin: 0 }}>
            日报详情 · {reportDate}
          </h2>
          <div style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            基于当日告警事件生成监控运行摘要
          </div>
        </div>
        <Button variant="secondary" onClick={fetchData} disabled={loading || aiLoading}>
          <RefreshCw size={16} />
          本地刷新
        </Button>
      </div>

      <section className="ai-panel">
        <div className="ai-panel-title">
          <Bot size={18} />
          <span>DeepSeek 模型生成</span>
        </div>
        <div className="ai-controls">
          <div className="field">
            <label>API Key</label>
            <div className="input-wrap">
              <KeyRound size={16} />
              <input
                value={apiKey}
                onChange={event => setApiKey(event.target.value)}
                type="password"
                placeholder="sk-..."
                autoComplete="off"
              />
            </div>
          </div>
          <div className="field model-field">
            <label>模型</label>
            <input
              value={model}
              onChange={event => setModel(event.target.value)}
              placeholder="deepseek-v4-flash"
            />
          </div>
          <Button variant="primary" onClick={generateWithDeepSeek} loading={aiLoading} disabled={loading}>
            <Bot size={16} />
            生成模型报告
          </Button>
        </div>
        {aiError && <div className="inline-error">{aiError}</div>}
      </section>

      {loading ? (
        <Skeleton variant="card" count={4} />
      ) : error ? (
        <div className="error-panel">
          <AlertTriangle size={32} style={{ marginBottom: 'var(--space-3)' }} />
          <div style={{ marginBottom: 'var(--space-3)' }}>{error}</div>
          <Button variant="secondary" onClick={fetchData}>重试</Button>
        </div>
      ) : report ? (
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <section className="report-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: risk.bg, color: risk.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>AI 风险判断</div>
                  <div style={{ color: risk.color, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>{risk.label}</div>
                </div>
              </div>
              <span className="source-pill">{reportSource}</span>
            </div>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, margin: 0 }}>{report.summary}</p>
          </section>

          <div className="stats-grid">
            <StatBlock label="总告警" value={report.total_alerts} icon={ClipboardList} tone="info" />
            <StatBlock label="风险等级" value={risk.label} icon={ShieldAlert} tone="danger" />
            <StatBlock label="异常类型" value={report.top_exceptions.length} icon={BarChart3} tone="warning" />
            <StatBlock label="高峰时段" value={report.hourly_trend[0]?.hour || '-'} icon={Activity} tone="success" />
          </div>

          <div className="two-col">
            <ListPanel title="关键发现" icon={AlertTriangle} items={report.key_findings} />
            <ListPanel title="处置建议" icon={CheckCircle} items={report.recommendations} />
          </div>

          <div className="two-col">
            <RankPanel title="严重级别分布" items={report.by_severity} empty="暂无告警级别数据" />
            <RankPanel title="高频异常 Top" items={report.top_exceptions} empty="暂无异常数据" />
          </div>

          <section className="report-section">
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)', margin: '0 0 var(--space-4)' }}>小时趋势</h3>
            {report.hourly_trend.length === 0 ? (
              <div style={{ color: 'var(--text-disabled)' }}>暂无小时趋势数据</div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                {report.hourly_trend.map(point => (
                  <div key={point.hour} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 40px', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{point.hour}</span>
                    <div style={{ height: 8, background: 'var(--bg-canvas)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, point.count * 20)}%`, height: '100%', background: 'var(--color-info)' }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', textAlign: 'right' }}>{point.count}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      <style>{`
        .report-toolbar{display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);margin-bottom:var(--space-5)}
        .ai-panel,.report-section,.error-panel{background:var(--bg-surface);border:1px solid rgba(255,255,255,.08);border-radius:var(--radius-md);padding:var(--space-5)}
        .ai-panel{margin-bottom:var(--space-4)}
        .ai-panel-title{display:flex;align-items:center;gap:var(--space-2);font-weight:var(--font-semibold);color:var(--text-primary);margin-bottom:var(--space-4)}
        .ai-controls{display:grid;grid-template-columns:minmax(240px,1fr) 180px auto;align-items:end;gap:var(--space-3)}
        .field{display:grid;gap:var(--space-2)}
        .field label{font-size:var(--text-xs);color:var(--text-secondary)}
        .field input,.input-wrap{height:40px;background:var(--bg-canvas);border:1px solid rgba(255,255,255,.1);border-radius:var(--radius-sm);color:var(--text-primary)}
        .field input{width:100%;padding:0 var(--space-3);outline:none}
        .input-wrap{display:flex;align-items:center;gap:var(--space-2);padding:0 var(--space-3);color:var(--text-secondary)}
        .input-wrap input{height:100%;border:0;background:transparent;padding:0}
        .inline-error{margin-top:var(--space-3);color:var(--color-danger);font-size:var(--text-sm)}
        .error-panel{text-align:center;color:var(--color-danger)}
        .source-pill{display:inline-flex;align-items:center;height:28px;padding:0 var(--space-3);border-radius:var(--radius-full);background:var(--bg-canvas);color:var(--text-secondary);font-size:var(--text-xs);white-space:nowrap}
        .stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3)}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)}
        @media (max-width: 960px){
          .report-toolbar{align-items:flex-start;flex-direction:column}
          .ai-controls{grid-template-columns:1fr}
          .stats-grid,.two-col{grid-template-columns:1fr}
          .model-field{max-width:none}
        }
      `}</style>
    </div>
  );
}

function StatBlock({ label, value, icon: Icon, tone }: { label: string; value: number | string; icon: typeof Activity; tone: 'info' | 'success' | 'warning' | 'danger' }) {
  const colors = {
    info: ['var(--color-info-dim)', 'var(--color-info)'],
    success: ['var(--color-success-dim)', 'var(--color-success)'],
    warning: ['var(--color-warning-dim)', 'var(--color-warning)'],
    danger: ['var(--color-danger-dim)', 'var(--color-danger)'],
  }[tone];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors[0], color: colors[1] }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ color: 'var(--text-primary)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>{value}</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{label}</div>
      </div>
    </div>
  );
}

function ListPanel({ title, icon: Icon, items }: { title: string; icon: typeof AlertTriangle; items: string[] }) {
  return (
    <section className="report-section">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)', margin: '0 0 var(--space-4)' }}>
        <Icon size={18} />
        {title}
      </h3>
      <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
        {items.map((item, index) => (
          <div key={index} style={{ color: 'var(--text-primary)', lineHeight: 1.7, padding: 'var(--space-3)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)' }}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function RankPanel({ title, items, empty }: { title: string; items: { label: string; value: number }[]; empty: string }) {
  return (
    <section className="report-section">
      <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)', margin: '0 0 var(--space-4)' }}>{title}</h3>
      {items.length === 0 ? (
        <div style={{ color: 'var(--text-disabled)' }}>{empty}</div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {items.map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-semibold)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
