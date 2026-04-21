import { useState } from "react";
import { useListAdmins, useCreateAdmin, useUpdateAdmin, useDeleteAdmin, getListAdminsQueryKey } from "@workspace/api-client-react";
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
import { CreateAdminBodyRole } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Admins() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);

  const { data, isLoading } = useListAdmins();
  
  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();
  const deleteMutation = useDeleteAdmin();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      data: {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        district: formData.get("district") as string,
        role: formData.get("role") as CreateAdminBodyRole,
        geoPolygon: formData.get("geoPolygon") as string || undefined,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Thêm thành công", description: "Tài khoản admin mới đã được tạo." });
        setIsCreateOpen(false);
        queryClient.invalidateQueries({ queryKey: getListAdminsQueryKey() });
      }
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAdmin) return;
    
    const formData = new FormData(e.currentTarget);
    
    updateMutation.mutate({
      id: editingAdmin.id,
      data: {
        name: formData.get("name") as string,
        district: formData.get("district") as string,
        role: formData.get("role") as CreateAdminBodyRole,
        isActive: formData.get("isActive") === "on",
      }
    }, {
      onSuccess: () => {
        toast({ title: "Cập nhật thành công", description: "Thông tin admin đã được lưu." });
        setEditingAdmin(null);
        queryClient.invalidateQueries({ queryKey: getListAdminsQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Xóa thành công", description: "Tài khoản admin đã bị xóa." });
        queryClient.invalidateQueries({ queryKey: getListAdminsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Admin</h2>
          <p className="text-slate-500">Quản lý tài khoản và phân quyền cho nhân viên quản trị hệ thống</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Thêm tài khoản Admin mới</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Họ tên</Label>
                  <Input id="name" name="name" placeholder="Nguyễn Văn A" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="admin@city.gov.vn" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Phân quyền</Label>
                  <div className="col-span-3">
                    <Select name="role" defaultValue="district_admin" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Quản trị viên cấp cao</SelectItem>
                        <SelectItem value="district_admin">Quản lý khu vực</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="district" className="text-right">Khu vực</Label>
                  <Input id="district" name="district" placeholder="Quận/Huyện" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>Tạo tài khoản</Button>
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
                <TableHead>Tài khoản</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Khu vực quản lý</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
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
              ) : !data?.items.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                    Chưa có tài khoản admin nào
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{admin.name}</div>
                      <div className="text-xs text-slate-500">{admin.email}</div>
                    </TableCell>
                    <TableCell>
                      {admin.role === "super_admin" ? (
                        <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Super Admin</Badge>
                      ) : (
                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">District Admin</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {admin.district}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={admin.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500"}>
                        {admin.isActive ? "Hoạt động" : "Khóa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {format(new Date(admin.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog open={editingAdmin?.id === admin.id} onOpenChange={(open) => !open && setEditingAdmin(null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingAdmin(admin)}>
                              <Edit2 className="w-4 h-4 text-slate-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleUpdate}>
                              <DialogHeader>
                                <DialogTitle>Cập nhật Admin</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-name" className="text-right">Họ tên</Label>
                                  <Input id="edit-name" name="name" defaultValue={admin.name} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label className="text-right">Email</Label>
                                  <div className="col-span-3 text-sm text-slate-500 font-medium">{admin.email}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-role" className="text-right">Phân quyền</Label>
                                  <div className="col-span-3">
                                    <Select name="role" defaultValue={admin.role} required>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="super_admin">Quản trị viên cấp cao</SelectItem>
                                        <SelectItem value="district_admin">Quản lý khu vực</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-district" className="text-right">Khu vực</Label>
                                  <Input id="edit-district" name="district" defaultValue={admin.district} className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-isActive" className="text-right">Trạng thái</Label>
                                  <div className="col-span-3 flex items-center space-x-2">
                                    <Switch id="edit-isActive" name="isActive" defaultChecked={admin.isActive} />
                                    <Label htmlFor="edit-isActive">Hoạt động</Label>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" disabled={updateMutation.isPending}>Lưu thay đổi</Button>
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
                              <AlertDialogTitle>Xóa tài khoản này?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Quyền truy cập hệ thống của người dùng này sẽ bị thu hồi vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(admin.id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Xóa tài khoản
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
