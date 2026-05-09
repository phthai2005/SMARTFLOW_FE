import { useState } from "react";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, Ban, CheckCircle, Car, Bike, Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useListUsers({ limit: 50 });
  const updateMutation = useUpdateUser();

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    updateMutation.mutate({
      id,
      data: { isActive: !currentStatus }
    }, {
      onSuccess: () => {
        toast({ 
          title: "Thành công", 
          description: `Người dùng đã bị ${currentStatus ? "khóa" : "mở khóa"}.` 
        });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      }
    });
  };

  const getVehicleIcon = (type: string) => {
    switch(type) {
      case "car": return <Car className="w-4 h-4" />;
      case "truck": return <Truck className="w-4 h-4" />;
      case "motorcycle": return <Zap className="w-4 h-4" />; // generic icon for moto
      case "bicycle": return <Bike className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };
  
  const getVehicleLabel = (type: string) => {
    switch(type) {
      case "car": return "Ô tô";
      case "truck": return "Xe tải";
      case "motorcycle": return "Xe máy";
      case "bicycle": return "Xe đạp";
      default: return type;
    }
  };

  const filteredUsers = (data?.items || []).filter((user: any) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone && user.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Người dùng</h2>
          <p className="text-slate-500">Quản lý người dùng ứng dụng và người đóng góp dữ liệu</p>
        </div>
        
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Tìm theo tên, email, sđt..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Thông tin</TableHead>
                <TableHead>Phương tiện</TableHead>
                <TableHead>Đóng góp</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Đăng ký</TableHead>
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
              ) : !filteredUsers?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                    Không tìm thấy người dùng
                  </TableCell>
                </TableRow>
              ) : (
                (filteredUsers || []).map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                      {user.phone && <div className="text-xs text-slate-400 mt-0.5">{user.phone}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2 py-1 rounded inline-flex text-sm">
                        {getVehicleIcon(user.vehicleType)}
                        <span>{getVehicleLabel(user.vehicleType)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-blue-600">{user.reportCount} báo cáo</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
                        {user.isActive ? "Hoạt động" : "Bị khóa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {format(new Date(user.registeredAt), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={user.isActive ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        disabled={updateMutation.isPending}
                      >
                        {user.isActive ? (
                          <><Ban className="w-4 h-4 mr-1.5" /> Khóa</>
                        ) : (
                          <><CheckCircle className="w-4 h-4 mr-1.5" /> Mở khóa</>
                        )}
                      </Button>
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
