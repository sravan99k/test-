import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Brain, ShieldCheck, AlertTriangle, Shield, ChevronDown, ChevronUp, Info, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatbotTriggersProps {
  triggers: Array<{
    id: string;
    studentId: string;
    studentName: string;
    privacySafeMessage: string;
    category: string;
    subcategory: string;
    severity: 'monitor' | 'low' | 'medium' | 'high' | 'critical';
    indicators: string[];
    recommendedActions: string[];
    timestamp: Date;
    engagementMetrics?: {
      interactionCount: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
  }>;
  onReview?: (trigger: any) => void;
  className?: string;
  maxItems?: number;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/10 text-red-600 border-red-200';
    case 'high':
      return 'bg-orange-500/10 text-orange-600 border-orange-200';
    case 'medium':
      return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'low':
      return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'monitor':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="h-5 w-5" />;
    case 'high':
      return <AlertTriangle className="h-5 w-5" />;
    case 'medium':
      return <Info className="h-5 w-5" />;
    default:
      return <Shield className="h-5 w-5" />;
  }
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const ChatbotTriggers = ({
  triggers,
  onReview,
  className = "",
  maxItems = 5
}: ChatbotTriggersProps) => {
  const [expandedTriggers, setExpandedTriggers] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedTriggers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Sort triggers by severity (critical first) and then by timestamp (newest first)
  const sortedTriggers = [...triggers]
    .sort((a, b) => {
      const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3, 'monitor': 4 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
    .slice(0, maxItems);

  if (sortedTriggers.length === 0) {
    return (
      <Card className={cn("border-none bg-white shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[32px] overflow-hidden", className)}>
        <CardHeader className="pb-8 pt-10 text-center flex flex-col items-center">
          <div className="p-5 rounded-[32px] bg-emerald-50 text-emerald-500 mb-4 border border-emerald-100 shadow-inner">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">System Status: Secure</CardTitle>
          <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">No active behavioral risks detected in the current cycle</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="divide-y divide-slate-50">
        {sortedTriggers.map((trigger) => {
          const isExpanded = expandedTriggers.has(trigger.id);
          const severityColor = getSeverityColor(trigger.severity);
          const SeverityIcon = getSeverityIcon(trigger.severity);

          return (
            <div
              key={trigger.id}
              className="p-6 hover:bg-slate-50/50 transition-all duration-300 cursor-pointer group"
              onClick={() => toggleExpand(trigger.id)}
            >
              <div className="flex items-start gap-5">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 border shadow-sm transition-transform group-hover:scale-105",
                  severityColor
                )}>
                  {SeverityIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {trigger.category} • {trigger.subcategory}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border-0",
                            severityColor
                          )}
                        >
                          {trigger.severity}
                        </Badge>

                      </div>
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                        {trigger.studentName && (trigger.severity === 'critical' || trigger.severity === 'high') ? trigger.studentName : 'Educational Insight Participant'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatTimeAgo(new Date(trigger.timestamp))}</span>
                    </div>
                  </div>

                  <div className="mt-3 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 relative">
                    <p className="text-[13px] font-medium text-slate-700 leading-relaxed italic pr-4">
                      "{trigger.privacySafeMessage}"
                    </p>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {trigger.indicators.length > 0 && (
                            <div>
                              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Clinical Context Markers</h4>
                              <div className="flex flex-wrap gap-2">
                                {trigger.indicators.map((indicator, idx) => (
                                  <Badge key={idx} variant="secondary" className="bg-white text-slate-600 border border-slate-100 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-tight shadow-sm">
                                    {indicator}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {trigger.recommendedActions.length > 0 && (
                            <div className="bg-emerald-50/30 p-5 rounded-3xl border border-emerald-100/50">
                              <h4 className="text-[9px] font-black text-emerald-900 uppercase tracking-[0.2em] mb-4">Support Protocol</h4>
                              <ul className="space-y-3">
                                {trigger.recommendedActions.map((action, idx) => (
                                  <li key={idx} className="flex items-start gap-3">
                                    <div className="h-4 w-4 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[8px] font-black">
                                      {idx + 1}
                                    </div>
                                    <span className="text-[12px] font-bold text-slate-700 leading-snug">{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Action Panel */}
                        <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 flex flex-col justify-between shadow-xl shadow-slate-200">
                          <div className="space-y-2">
                            <h5 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Clinical Review Required</h5>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              Teacher intervention required to close this analytical signal. Logging a note will archive this event and update the student evidence logs.
                            </p>
                          </div>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onReview) onReview(trigger);
                            }}
                            className="w-full h-12 bg-white text-slate-900 hover:bg-blue-50 hover:text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                          >
                            Log Protocol Note
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <button
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-slate-900 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(trigger.id);
                      }}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Hide Intelligence
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Expand Intelligence details
                        </>
                      )}
                    </button>


                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 border-t border-slate-50 bg-slate-50/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none pt-0.5">Real-time analytical monitoring active</span>
          </div>
          <Button variant="ghost" size="sm" className="h-10 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white hover:text-slate-900 rounded-xl transition-all">
            Launch full intelligence center
          </Button>
        </div>
      </div>
    </div>
  );
};
