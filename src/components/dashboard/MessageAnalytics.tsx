import { motion } from "framer-motion";
import { 
  Mail, 
  MessageCircle, 
  Linkedin, 
  Send, 
  CheckCircle2, 
  Eye, 
  MessageSquare, 
  AlertTriangle,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useMessageAnalytics } from "@/hooks/useMessageAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const channelIcons: Record<string, React.ElementType> = {
  email: Mail,
  whatsapp: MessageCircle,
  linkedin: Linkedin,
};

const channelColors: Record<string, string> = {
  email: "hsl(var(--primary))",
  whatsapp: "hsl(142, 71%, 45%)",
  linkedin: "hsl(210, 100%, 45%)",
};

export function MessageAnalytics() {
  const { data: analytics, isLoading } = useMessageAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalMessages === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-2">No Messages Yet</h3>
        <p className="text-muted-foreground">
          Start sending messages to see analytics here
        </p>
      </motion.div>
    );
  }

  const statCards = [
    {
      title: "Delivery Rate",
      value: `${analytics.deliveryRate.toFixed(1)}%`,
      subtitle: `${analytics.totalDelivered} of ${analytics.totalMessages}`,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Read Rate",
      value: `${analytics.readRate.toFixed(1)}%`,
      subtitle: `${analytics.totalRead} read`,
      icon: Eye,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Response Rate",
      value: `${analytics.responseRate.toFixed(1)}%`,
      subtitle: `${analytics.totalResponded} responses`,
      icon: MessageSquare,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Failure Rate",
      value: `${analytics.failureRate.toFixed(1)}%`,
      subtitle: `${analytics.totalFailed} failed`,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  const chartConfig = {
    sent: { label: "Sent", color: "hsl(var(--muted-foreground))" },
    delivered: { label: "Delivered", color: "hsl(var(--primary))" },
    read: { label: "Read", color: "hsl(var(--accent))" },
    responded: { label: "Responded", color: "hsl(142, 71%, 45%)" },
  };

  const pieData = analytics.byChannel.map(c => ({
    name: c.channel.charAt(0).toUpperCase() + c.channel.slice(1),
    value: c.total,
    fill: channelColors[c.channel] || "hsl(var(--muted))",
  }));

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
                <p className="text-xs text-muted-foreground/70">{stat.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                7-Day Message Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-56">
                <LineChart data={analytics.byDay}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="sent" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="delivered" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responded" 
                    stroke="hsl(142, 71%, 45%)" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Channel Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                Messages by Channel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {analytics.byChannel.map((channel) => {
                    const Icon = channelIcons[channel.channel] || Mail;
                    return (
                      <div key={channel.channel} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: channelColors[channel.channel] }} />
                            <span className="capitalize">{channel.channel}</span>
                          </div>
                          <span className="font-medium">{channel.total}</span>
                        </div>
                        <Progress 
                          value={(channel.total / analytics.totalMessages) * 100} 
                          className="h-1.5"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{channel.deliveryRate.toFixed(0)}% delivered</span>
                          <span>{channel.responseRate.toFixed(0)}% response</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Channel Performance Bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Channel Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48">
              <BarChart data={analytics.byChannel.map(c => ({
                channel: c.channel.charAt(0).toUpperCase() + c.channel.slice(1),
                delivered: c.delivered,
                read: c.read,
                responded: c.responded,
              }))}>
                <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="delivered" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="read" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="responded" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Responding Leads */}
      {analytics.topLeads.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Most Engaged Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topLeads.map((lead, index) => (
                  <div key={lead.leadId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{lead.leadName}</p>
                        {lead.company && (
                          <p className="text-xs text-muted-foreground">{lead.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-primary">
                        {lead.responseRate.toFixed(0)}% response
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lead.responseCount}/{lead.messageCount} messages
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
