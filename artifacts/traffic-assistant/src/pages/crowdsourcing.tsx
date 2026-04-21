import { useState } from "react";
import { useListCrowdsourcingReports, useUpdateCrowdsourcingReport, getListCrowdsourcingReportsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Check, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function Crowdsourcing() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListCrowdsourcingReports({
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 50,
  });

  const updateMutation = useUpdateCrowdsourcingReport();

  const handleUpdateStatus = (id: number, newStatus: "approved" | "rejected") => {
    updateMutation.mutate({
      id,
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        toast({
          title: "Đã cập nhật trạng thái",
          description: `Báo cáo đã được ${newStatus === "approved" ? "phê duyệt" : "từ chối"}.`,
        });
        queryClient.invalidateQueries({ queryKey: getListCrowdsourcingReportsQueryKey() });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể cập nhật trạng thái báo cáo.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Báo cáo thực địa</h2>
          <p className="text-slate-500">Quản lý và xét duyệt các báo cáo biển báo từ cộng đồng</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Mã Biển / Loại</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Độ tin cậy</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
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
                    Không có báo cáo nào
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{report.signCode}</div>
                      <div className="text-xs text-slate-500">{report.signType}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{report.lat.toFixed(6)}, {report.lng.toFixed(6)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${report.confidenceScore > 0.8 ? 'bg-emerald-500' : report.confidenceScore > 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${report.confidenceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{(report.confidenceScore * 100).toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        report.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        report.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }>
                        {report.status === "approved" ? "Đã duyệt" : report.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{format(new Date(report.submittedAt), "dd/MM/yyyy")}</div>
                      <div className="text-xs text-slate-500">{format(new Date(report.submittedAt), "HH:mm")}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {report.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                            onClick={() => handleUpdateStatus(report.id, "approved")}
                            disabled={updateMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleUpdateStatus(report.id, "rejected")}
                            disabled={updateMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
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
