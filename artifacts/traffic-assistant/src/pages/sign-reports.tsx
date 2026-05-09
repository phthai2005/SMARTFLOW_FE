import { useState } from "react";
import { useListSignReports, useUpdateSignReport, getListSignReportsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Filter, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type StatusFilter = "all" | "visible" | "hidden";

export default function SignReports() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListSignReports({
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    limit: 50,
  });

  const updateMutation = useUpdateSignReport();

  const handleToggleVisibility = (id: number, currentVisibility: "visible" | "hidden") => {
    const newVisibility = currentVisibility === "visible" ? "hidden" : "visible";
    
    updateMutation.mutate({
      id,
      data: { visibility: newVisibility }
    }, {
      onSuccess: () => {
        toast({
          title: "Đã cập nhật trạng thái",
          description: `Biển báo đã được ${newVisibility === "visible" ? "hiển thị" : "ẩn"}.`,
        });
        queryClient.invalidateQueries({ queryKey: getListSignReportsQueryKey() });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể cập nhật trạng thái biển báo.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Biển báo lỗi</h2>
          <p className="text-slate-500">Danh sách các biển báo được người dùng báo cáo lỗi hoặc thiếu</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc trạng thái hiển thị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="visible">Đang hiển thị</SelectItem>
              <SelectItem value="hidden">Đã ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Mã Biển</TableHead>
                <TableHead>Loại lỗi</TableHead>
                <TableHead>Số lượt báo cáo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Báo cáo gần nhất</TableHead>
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
              ) : !data?.items || data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                    Không có biển báo lỗi nào
                  </TableCell>
                </TableRow>
              ) : (
                (data?.items || []).map((report: any) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{report.signCode}</div>
                      <div className="text-xs text-slate-500">ID: {report.signId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        report.reportType === "missing" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-700 border-red-200"
                      }>
                        {report.reportType === "missing" ? "Báo thiếu" : "Báo sai"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{report.reportCount}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        report.visibility === "visible" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-300"
                      }>
                        {report.visibility === "visible" ? "Hiển thị" : "Đã ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{format(new Date(report.lastReportedAt), "dd/MM/yyyy HH:mm")}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant={report.visibility === "visible" ? "outline" : "default"} 
                        size="sm" 
                        className={report.visibility === "visible" ? "text-slate-600 hover:text-slate-900" : ""}
                        onClick={() => handleToggleVisibility(report.id, report.visibility)}
                        disabled={updateMutation.isPending}
                      >
                        {report.visibility === "visible" ? (
                          <><EyeOff className="w-4 h-4 mr-2" /> Ẩn biển báo</>
                        ) : (
                          <><Eye className="w-4 h-4 mr-2" /> Hiện biển báo</>
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
