import { useState } from "react";
import { useListModels, useCreateModel, useDeployModel, getListModelsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Cpu, Upload, CloudLightning, Activity, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Models() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data, isLoading } = useListModels();
  
  const createMutation = useCreateModel();
  const deployMutation = useDeployModel();

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      data: {
        version: formData.get("version") as string,
        filename: formData.get("filename") as string,
        releaseNote: formData.get("releaseNote") as string,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Tải lên thành công", description: "Model AI mới đã sẵn sàng để triển khai." });
        setIsUploadOpen(false);
        queryClient.invalidateQueries({ queryKey: getListModelsQueryKey() });
      }
    });
  };

  const handleDeploy = (id: number) => {
    deployMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ 
          title: "Bắt đầu triển khai", 
          description: "Lệnh cập nhật OTA đã được gửi tới các thiết bị biên." 
        });
        queryClient.invalidateQueries({ queryKey: getListModelsQueryKey() });
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "deployed":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Đã triển khai</Badge>;
      case "deploying":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 animate-pulse">Đang triển khai (OTA)</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Triển khai thất bại</Badge>;
      case "draft":
      default:
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">Bản nháp</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Model AI</h2>
          <p className="text-slate-500">Quản lý các phiên bản YOLO/OCR cho thiết bị edge device</p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Tải lên Model mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleUpload}>
              <DialogHeader>
                <DialogTitle>Tải lên bản build Model AI</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="version" className="text-right">Phiên bản</Label>
                  <Input id="version" name="version" placeholder="1.2.0" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="filename" className="text-right">Tên file</Label>
                  <Input id="filename" name="filename" placeholder="yolov8_traffic_v1.2.0.pt" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="releaseNote" className="text-right mt-2">Release Notes</Label>
                  <Textarea id="releaseNote" name="releaseNote" placeholder="Cải thiện độ chính xác nhận diện biển cấm dừng đỗ..." className="col-span-3 h-24" required />
                </div>
                <div className="col-span-4 bg-slate-50 border p-3 rounded-md mt-2 flex gap-3 text-sm text-slate-600">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                  <p>Hệ thống tự động mô phỏng file upload để testing. Ghi tên file định dạng .pt hoặc .tflite để xác nhận.</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>Hoàn tất</Button>
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
                <TableHead>Phiên bản / File</TableHead>
                <TableHead>Mô tả thay đổi</TableHead>
                <TableHead>Trạng thái OTA</TableHead>
                <TableHead>Cập nhật lần cuối</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : !data?.items || data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                    Chưa có Model AI nào
                  </TableCell>
                </TableRow>
              ) : (
                (data?.items || []).map((model: any) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <span className="font-bold text-slate-900">v{model.version}</span>
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-1">{model.filename}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-[250px] truncate">{model.releaseNote}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        {getStatusBadge(model.status)}
                        {model.status === "deployed" && (
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Activity className="h-3 w-3" /> {model.deviceCount} thiết bị
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{model.deployedAt ? format(new Date(model.deployedAt), "dd/MM/yyyy HH:mm") : format(new Date(model.uploadedAt), "dd/MM/yyyy")}</div>
                      <div className="text-xs text-slate-500">{model.deployedAt ? "Đã deploy" : "Tải lên"}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {model.status !== "deployed" && model.status !== "deploying" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                              <CloudLightning className="w-4 h-4 mr-2" />
                              Triển khai OTA
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận triển khai OTA?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Phiên bản <b>v{model.version}</b> sẽ được đẩy xuống toàn bộ thiết bị Edge. Quá trình này có thể mất vài phút đến vài giờ tùy theo kết nối mạng của thiết bị.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeploy(model.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Xác nhận Deploy
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
