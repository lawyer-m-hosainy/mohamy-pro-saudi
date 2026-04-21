import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Search, Filter, MoreHorizontal, Phone, Building2, User, Edit, Trash2 } from "lucide-react";
import { useClientsStore } from "@/store/useClientsStore";
import React, { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Clients() {
  const clients = useClientsStore(state => state.clients);
  const addClient = useClientsStore(state => state.addClient);
  const updateClient = useClientsStore(state => state.updateClient);
  const deleteClient = useClientsStore(state => state.deleteClient);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"الكل" | "فرد" | "منشأة">("الكل");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredClients = useMemo(() => {
    return (clients || []).filter(c => {
      const matchesSearch = c.name?.includes(searchQuery) || 
                            c.nationalId?.includes(searchQuery) || 
                            c.commercialRegistration?.includes(searchQuery);
      const matchesType = filterType === "الكل" || c.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [clients, searchQuery, filterType]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const currentClients = useMemo(() => {
    return filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "فرد" as "فرد" | "منشأة",
    nationalId: "",
    commercialRegistration: "",
    vatNumber: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("يرجى ملء البيانات الأساسية");
      return;
    }

    if (editingClientId) {
      updateClient(editingClientId, formData);
      toast.success("تم تحديث بيانات العميل بنجاح");
    } else {
      const newClient = {
        id: `C-${Date.now()}`,
        ...formData,
      };
      addClient(newClient as any);
      toast.success("تم إضافة العميل بنجاح");
    }
    
    setIsOpen(false);
    setEditingClientId(null);
    setFormData({
      name: "",
      type: "فرد",
      nationalId: "",
      commercialRegistration: "",
      vatNumber: "",
      phone: "",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">إدارة العملاء</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">إدارة بيانات الأفراد والمنشآت والتحقق من الهوية.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setEditingClientId(null);
        }}>
          <Button type="button" className="bg-primary-500 hover:bg-primary-600 text-white gap-2" onClick={() => {
            setEditingClientId(null);
            setFormData({
              name: "",
              type: "فرد",
              nationalId: "",
              commercialRegistration: "",
              vatNumber: "",
              phone: "",
            });
            setIsOpen(true);
          }}>
            <UserPlus size={18} />
            إضافة عميل جديد
          </Button>
          <DialogContent className="sm:max-w-[500px] border-none shadow-2xl dark:bg-navy-900">
            <DialogHeader>
              <DialogTitle className="text-navy-900 dark:text-white">
                {editingClientId ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">نوع العميل</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}
                  >
                    <SelectTrigger className="dark:bg-white/5 dark:border-white/10">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-navy-800 dark:border-white/10">
                      <SelectItem value="فرد">فرد</SelectItem>
                      <SelectItem value="منشأة">منشأة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">اسم العميل</Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="الاسم الكامل" 
                    className="dark:bg-white/5 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {formData.type === 'فرد' ? (
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">رقم الهوية / الإقامة</Label>
                    <Input 
                      id="nationalId"
                      value={formData.nationalId}
                      onChange={e => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                      placeholder="1XXXXXXXXX" 
                      className="dark:bg-white/5 dark:border-white/10"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="cr">رقم السجل التجاري</Label>
                    <Input 
                      id="cr"
                      value={formData.commercialRegistration}
                      onChange={e => setFormData(prev => ({ ...prev, commercialRegistration: e.target.value }))}
                      placeholder="7XXXXXXXXX" 
                      className="dark:bg-white/5 dark:border-white/10"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الجوال</Label>
                  <Input 
                    id="phone"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+9665XXXXXXXX" 
                    dir="ltr"
                    className="dark:bg-white/5 dark:border-white/10"
                  />
                </div>
              </div>

              {formData.type === 'منشأة' && (
                <div className="space-y-2">
                  <Label htmlFor="vat">الرقم الضريبي (إن وجد)</Label>
                  <Input 
                    id="vat"
                    value={formData.vatNumber}
                    onChange={e => setFormData(prev => ({ ...prev, vatNumber: e.target.value }))}
                    placeholder="3XXXXXXXXXXXXXX" 
                    className="dark:bg-white/5 dark:border-white/10"
                  />
                </div>
              )}

              <DialogFooter className="mt-6">
                <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                  {editingClientId ? "حفظ التعديلات" : "حفظ العميل"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm dark:bg-navy-800">
        <CardHeader className="p-4 border-b border-slate-50 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="البحث بالاسم، رقم الهوية، أو السجل التجاري..." 
                className="ps-10 bg-slate-50 dark:bg-white/5 border-none focus-visible:ring-primary-500/20"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 text-slate-600 dark:text-slate-400 dark:border-white/10">
                  <Filter size={18} />
                  تصفية {filterType !== "الكل" && `(${filterType})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dark:bg-navy-800 dark:border-white/10 w-32">
                <DropdownMenuItem onClick={() => { setFilterType("الكل"); setCurrentPage(1); }} className="cursor-pointer dark:focus:bg-white/5">
                  الكل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setFilterType("فرد"); setCurrentPage(1); }} className="cursor-pointer dark:focus:bg-white/5">
                  فرد فقط
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setFilterType("منشأة"); setCurrentPage(1); }} className="cursor-pointer dark:focus:bg-white/5">
                  منشأة فقط
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-white/5">
              <TableRow>
                <TableHead className="text-start font-bold text-navy-900 dark:text-white">العميل</TableHead>
                <TableHead className="text-start font-bold text-navy-900 dark:text-white">النوع</TableHead>
                <TableHead className="text-start font-bold text-navy-900 dark:text-white">رقم الهوية/السجل</TableHead>
                <TableHead className="text-start font-bold text-navy-900 dark:text-white">الرقم الضريبي</TableHead>
                <TableHead className="text-start font-bold text-navy-900 dark:text-white">رقم التواصل</TableHead>
                <TableHead className="text-end font-bold text-navy-900 dark:text-white">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClients.length > 0 ? currentClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                        {client.type === 'منشأة' ? <Building2 size={16} /> : <User size={16} />}
                      </div>
                      <span className="font-bold text-navy-900 dark:text-white">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={client.type === 'منشأة' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"}>
                      {client.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                    {client.nationalId || client.commercialRegistration}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                    {client.vatNumber || '-'}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span dir="ltr">{client.phone}</span>
                  </TableCell>
                  <TableCell className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy-900 dark:hover:text-white">
                          <MoreHorizontal size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="dark:bg-navy-800 dark:border-white/10 w-40">
                        <DropdownMenuItem onClick={() => {
                          setEditingClientId(client.id);
                          setFormData({
                            name: client.name || "",
                            type: (client.type as "فرد" | "منشأة") || "فرد",
                            nationalId: client.nationalId || "",
                            commercialRegistration: client.commercialRegistration || "",
                            vatNumber: client.vatNumber || "",
                            phone: client.phone || "",
                          });
                          setIsOpen(true);
                        }} className="cursor-pointer dark:focus:bg-white/5 gap-2 flex items-center">
                          <Edit size={16} className="text-slate-500" />
                          <span>تعديل</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
                            deleteClient(client.id);
                            toast.success("تم حذف العميل بنجاح");
                          }
                        }} className="cursor-pointer text-red-600 dark:text-red-400 dark:focus:bg-red-500/10 gap-2 flex items-center">
                          <Trash2 size={16} />
                          <span>حذف</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    لا يوجد عملاء مطابقين للبحث أو مسجلين.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-50 dark:border-white/5 bg-white dark:bg-navy-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              صفحة {currentPage} من {totalPages}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
