import { useState } from "react";
import { useListRules, useCreateRule, useUpdateRule, useDeleteRule, getListRulesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { RuleVehicleType, CreateRuleBodyVehicleType } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Rules() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const { data, isLoading } = useListRules() as any;
  
  const createMutation = useCreateRule();
  const updateMutation = useUpdateRule();
  const deleteMutation = useDeleteRule();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      data: {
        sign_code: formData.get("signCode") as string,
        sign_type: formData.get("signContent") as string,
        target_vehicle_type: formData.get("vehicleType") as string,
        alert_message: formData.get("warningMessage") as string,
        alert_severity: "warning",
        is_active: formData.get("isActive") === "on",
      } as any
    }, {
      onSuccess: () => {
        toast({ title: "Thêm thành công", description: "Luật cảnh báo mới đã được tạo." });
        setIsCreateOpen(false);
        queryClient.invalidateQueries({ queryKey: getListRulesQueryKey() });
      }
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRule) return;
    
    const formData = new FormData(e.currentTarget);
    
    updateMutation.mutate({
      id: editingRule.id,
      data: {
        alert_message: formData.get("warningMessage") as string,
        is_active: formData.get("isActive") === "on",
      } as any
    }, {
      onSuccess: () => {
        toast({ title: "Cập nhật thành công", description: "Thông tin luật đã được lưu." });
        setEditingRule(null);
        queryClient.invalidateQueries({ queryKey: getListRulesQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Xóa thành công", description: "Luật đã bị xóa khỏi hệ thống." });
        queryClient.invalidateQueries({ queryKey: getListRulesQueryKey() });
      }
    });
  };

  const translateVehicleType = (type: string) => {
    switch(type) {
      case "car": return "Ô tô";
      case "truck": return "Xe tải";
      case "motorcycle": return "Xe máy";
      case "bicycle": return "Xe đạp";
      case "all": return "Tất cả";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Cấu hình Luật</h2>
          <p className="text-slate-500">Quản lý các quy tắc và thông báo cảnh báo dựa trên OCR biển báo</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm luật mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Thêm luật cảnh báo mới</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="signCode" className="text-right">Mã biển</Label>
                  <Input id="signCode" name="signCode" placeholder="Ví dụ: P.102" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="signContent" className="text-right">Nội dung OCR</Label>
                  <Input id="signContent" name="signContent" placeholder="Nội dung đọc được từ biển" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vehicleType" className="text-right">Loại xe</Label>
                  <div className="col-span-3">
                    <Select name="vehicleType" defaultValue="all" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại phương tiện" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="car">Ô tô</SelectItem>
                        <SelectItem value="truck">Xe tải</SelectItem>
                        <SelectItem value="motorcycle">Xe máy</SelectItem>
                        <SelectItem value="bicycle">Xe đạp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="warningMessage" className="text-right">Cảnh báo</Label>
                  <Input id="warningMessage" name="warningMessage" placeholder="Thông báo hiển thị cho tài xế" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isActive" className="text-right">Trạng thái</Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch id="isActive" name="isActive" defaultChecked />
                    <Label htmlFor="isActive">Kích hoạt</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>Lưu lại</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Biển báo & OCR</TableHead>
                <TableHead>Phương tiện</TableHead>
                <TableHead>Nội dung cảnh báo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : !data?.rules || data.rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                    Chưa có cấu hình luật nào
                  </TableCell>
                </TableRow>
              ) : (
                (data?.rules || []).map((rule: any) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="font-bold text-slate-900">{rule.sign_code || rule.signCode}</div>
                      <div className="text-xs font-mono bg-slate-100 px-1 py-0.5 rounded mt-1 inline-block text-slate-600">{rule.sign_type || rule.signContent}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{translateVehicleType(rule.target_vehicle_type || rule.vehicleType)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{rule.alert_message || rule.warningMessage}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={(rule.is_active ?? rule.isActive) ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500"}>
                        {(rule.is_active ?? rule.isActive) ? "Đang chạy" : "Vô hiệu hóa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {format(new Date(rule.updated_at || rule.updatedAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog open={editingRule?.id === rule.id} onOpenChange={(open) => !open && setEditingRule(null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingRule(rule)}>
                              <Edit2 className="w-4 h-4 text-slate-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleUpdate}>
                              <DialogHeader>
                                <DialogTitle>Sửa luật cảnh báo</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-signCode" className="text-right">Mã biển</Label>
                                  <Input id="edit-signCode" name="signCode" defaultValue={rule.signCode} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-signContent" className="text-right">Nội dung OCR</Label>
                                  <Input id="edit-signContent" name="signContent" defaultValue={rule.signContent} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-vehicleType" className="text-right">Loại xe</Label>
                                  <div className="col-span-3">
                                    <Select name="vehicleType" defaultValue={rule.vehicleType} required>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="car">Ô tô</SelectItem>
                                        <SelectItem value="truck">Xe tải</SelectItem>
                                        <SelectItem value="motorcycle">Xe máy</SelectItem>
                                        <SelectItem value="bicycle">Xe đạp</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-warningMessage" className="text-right">Cảnh báo</Label>
                                  <Input id="edit-warningMessage" name="warningMessage" defaultValue={rule.warningMessage} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-isActive" className="text-right">Trạng thái</Label>
                                  <div className="col-span-3 flex items-center space-x-2">
                                    <Switch id="edit-isActive" name="isActive" defaultChecked={rule.isActive} />
                                    <Label htmlFor="edit-isActive">Kích hoạt</Label>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" disabled={updateMutation.isPending}>Cập nhật</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa luật cảnh báo này?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Luật cảnh báo cho {rule.signCode} sẽ bị xóa hoàn toàn khỏi hệ thống.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(rule.id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Xóa bỏ
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
