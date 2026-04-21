import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, Briefcase, CheckCircle2, Clock, Mail, Phone, MoreVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTeamStore } from '@/store/useTeamStore';

export default function Team() {
  const teamMembers = useTeamStore((state) => state.teamMembers);

  const totalCases = teamMembers.reduce((acc, curr) => acc + curr.activeCases, 0);
  const totalPendingTasks = teamMembers.reduce((acc, curr) => acc + curr.pendingTasks, 0);

  const stats = [
    { title: "إجمالي الفريق", value: teamMembers.length.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "قضايا نشطة", value: totalCases.toString(), icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "مهام معلقة", value: totalPendingTasks.toString(), icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">إدارة الفريق والإنتاجية</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">متابعة أداء المحامين، توزيع القضايا، والإنتاجية العامة للمكتب.</p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white gap-2" onClick={() => toast.success("تم فتح نموذج إضافة عضو")}>
          <Plus size={18} />
          إضافة عضو جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm dark:bg-navy-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-navy-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="border-none shadow-sm dark:bg-navy-800 overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-50 dark:border-white/5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white dark:border-navy-700">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-primary-50 text-primary-700 font-bold">
                      {member.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-bold text-navy-900 dark:text-white">{member.name}</CardTitle>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{member.role}</p>
                  </div>
                </div>
                <Badge className={cn(
                  "font-bold",
                  member.status === 'نشط' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                )}>
                  {member.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">قضايا</p>
                  <p className="text-lg font-bold text-navy-900 dark:text-white">{member.activeCases}</p>
                </div>
                <div className="space-y-1 border-x border-slate-50 dark:border-white/5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">مهام</p>
                  <p className="text-lg font-bold text-navy-900 dark:text-white">{member.pendingTasks}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">مكتملة</p>
                  <p className="text-lg font-bold text-navy-900 dark:text-white">{member.completedTasks}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">معدل الإنجاز</span>
                  <span className="font-bold text-navy-900 dark:text-white">
                    {Math.round((member.completedTasks / (member.completedTasks + member.pendingTasks)) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(member.completedTasks / (member.completedTasks + member.pendingTasks)) * 100} 
                  className="h-2 bg-slate-100 dark:bg-white/5"
                />
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 dark:border-white/10" onClick={() => { window.location.href = `mailto:${member.email}`; }}>
                    <Mail size={14} className="text-slate-500" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 dark:border-white/10" onClick={() => toast.info(`الاتصال بـ ${member.name}`)}>
                    <Phone size={14} className="text-slate-500" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400 text-xs font-bold" onClick={() => toast.info(`عرض ملف ${member.name}`)}>
                  عرض الملف الشخصي
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
