import { useGetCrowdsourcingStats, useListCrowdsourcingReports, useListModels } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, XCircle, Clock, ArrowRight, Activity, Cpu, Map } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { lazy, Suspense } from "react";

const MapView = lazy(() => import("@/components/MapView"));

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetCrowdsourcingStats();
  const { data: recentReports, isLoading: reportsLoading } = useListCrowdsourcingReports({
    status: "pending",
    limit: 5
  });
  const { data: allReports } = useListCrowdsourcingReports({ limit: 100 });
  const { data: modelsData, isLoading: modelsLoading } = useListModels();

  const totalReports = stats ? stats.totalPending + stats.totalApproved + stats.totalRejected : 0;

  const mapPoints = (allReports?.items ?? []).map((r) => ({
    lat: r.lat,
    lng: r.lng,
    label: `${r.signCode} - ${r.signType}`,
    status: r.status as "pending" | "approved" | "rejected",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Tổng quan Hệ thống</h2>
        <p className="text-slate-500">Giám sát báo cáo cộng đồng và trạng thái thiết bị</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng báo cáo</CardTitle>
            <Activity className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold">{totalReports}</div>
            )}
            <p className="text-xs text-slate-500 mt-1">Từ cộng đồng người dùng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Chờ duyệt</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold text-amber-600">{stats?.totalPending || 0}</div>
            )}
            <p className="text-xs text-slate-500 mt-1">Cần xử lý ngay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Đã duyệt</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold text-emerald-600">{stats?.totalApproved || 0}</div>
            )}
            <p className="text-xs text-slate-500 mt-1">Tỷ lệ {stats?.approvalRate || 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Từ chối</CardTitle>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-2xl font-bold text-red-600">{stats?.totalRejected || 0}</div>
            )}
            <p className="text-xs text-slate-500 mt-1">Báo cáo không hợp lệ</p>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-4 h-4 text-blue-600" />
              Bản đồ báo cáo thực địa
            </CardTitle>
            <CardDescription>Vị trí các báo cáo biển báo từ cộng đồng</CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Chờ duyệt</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Đã duyệt</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Từ chối</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden rounded-b-lg">
          <Suspense fallback={<div className="h-[400px] flex items-center justify-center bg-slate-50 text-slate-400 text-sm">Đang tải bản đồ...</div>}>
            <MapView points={mapPoints} height="400px" />
          </Suspense>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Pending Reports */}
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Báo cáo chờ duyệt gần đây</CardTitle>
              <CardDescription>Cần xác minh để cập nhật bản đồ giao thông</CardDescription>
            </div>
            <Link href="/crowdsourcing">
              <Button variant="outline" size="sm" className="gap-1">
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            {reportsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentReports?.items.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
                Không có báo cáo nào đang chờ duyệt
              </div>
            ) : (
              <div className="space-y-4">
                {recentReports?.items.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center font-bold">
                        {report.signCode}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{report.signType}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>Độ tin cậy: {(report.confidenceScore * 100).toFixed(0)}%</span>
                          <span>•</span>
                          <span>{format(new Date(report.submittedAt), "dd/MM/yyyy HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Chờ duyệt
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Models Status */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Trạng thái Model AI</CardTitle>
              <CardDescription>Phiên bản đang triển khai trên thiết bị</CardDescription>
            </div>
            <Link href="/models">
              <Button variant="ghost" size="icon">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            {modelsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {modelsData?.items.slice(0, 4).map((model) => (
                  <div key={model.id} className="flex items-start justify-between p-3 rounded-lg border">
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <Cpu className={cn("h-5 w-5", 
                          model.status === "deployed" ? "text-emerald-500" :
                          model.status === "deploying" ? "text-blue-500" :
                          model.status === "failed" ? "text-red-500" : "text-slate-400"
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">v{model.version}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">{model.filename}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={cn(
                        model.status === "deployed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        model.status === "deploying" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        model.status === "failed" ? "bg-red-50 text-red-700 border-red-200" : 
                        "bg-slate-50 text-slate-700 border-slate-200"
                      )}>
                        {model.status === "deployed" ? "Đã triển khai" :
                         model.status === "deploying" ? "Đang triển khai" :
                         model.status === "failed" ? "Lỗi" : "Bản nháp"}
                      </Badge>
                      {model.status === "deployed" && (
                        <p className="text-xs text-slate-500 mt-1">{model.deviceCount} thiết bị</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
