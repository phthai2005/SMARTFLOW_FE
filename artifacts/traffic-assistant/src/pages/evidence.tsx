import { useState } from "react";
import { useListEvidence, useGetEvidenceStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MapPin, Target, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Evidence() {
  const [limit, setLimit] = useState(24);
  const { data: stats, isLoading: statsLoading } = useGetEvidenceStats();
  const { data: evidenceList, isLoading: evidenceLoading } = useListEvidence({ limit });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Kho ảnh bằng chứng</h2>
          <p className="text-slate-500">Dữ liệu từ thiết bị Edge đẩy về phục vụ training model và phạt nguội</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 text-white">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <p className="text-slate-400 font-medium mb-4">Tổng dung lượng kho ảnh</p>
            {statsLoading ? <Skeleton className="h-10 w-24 bg-slate-800" /> : (
              <div className="text-4xl font-bold">{stats?.totalImages.toLocaleString()} <span className="text-lg text-slate-400 font-normal">ảnh</span></div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="text-emerald-600" />
              <p className="text-emerald-800 font-medium">Hình ảnh hợp lệ</p>
            </div>
            {statsLoading ? <Skeleton className="h-10 w-24 bg-emerald-200/50" /> : (
              <div className="text-3xl font-bold text-emerald-900">{stats?.approvedCount.toLocaleString()}</div>
            )}
            <p className="text-sm text-emerald-600 mt-2">Dùng để training lại model</p>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-amber-600" />
              <p className="text-amber-800 font-medium">Chờ duyệt xác minh</p>
            </div>
            {statsLoading ? <Skeleton className="h-10 w-24 bg-amber-200/50" /> : (
              <div className="text-3xl font-bold text-amber-900">{stats?.pendingCount.toLocaleString()}</div>
            )}
            <p className="text-sm text-amber-600 mt-2">Từ các nguồn cảnh báo thấp</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="font-semibold text-lg text-slate-800 mt-8 mb-4">Ảnh mới nhất từ thiết bị</h3>
      
      {evidenceLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-xl" />
          ))}
        </div>
      ) : !evidenceList?.items || evidenceList.items.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
          Chưa có dữ liệu hình ảnh
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(evidenceList?.items || []).map((img: any) => (
            <Card key={img.id} className="overflow-hidden group">
              <div className="relative aspect-video bg-slate-100">
                <img 
                  src={img.imageUrl || img.image_url} 
                  alt="Evidence" 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {img.signCode && (
                    <Badge className="bg-black/70 hover:bg-black/80 backdrop-blur-md border-0">{img.signCode}</Badge>
                  )}
                  {img.decision === "approved" && <Badge className="bg-emerald-500/90 hover:bg-emerald-500 border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> OK</Badge>}
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                  <div className="flex items-center text-white text-xs gap-1.5 opacity-90">
                    <Target className="w-3 h-3" /> {img.deviceId || img.device_id}
                  </div>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <MapPin className="w-3 h-3" />
                  {(img.latitude || img.lat || 0).toFixed(5)}, {(img.longitude || img.lng || 0).toFixed(5)}
                </div>
                <div className="text-xs text-slate-400">
                  {format(new Date(img.capturedAt || img.created_at || Date.now()), "dd/MM/yyyy HH:mm:ss")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {evidenceList?.items && evidenceList.items.length < (stats?.totalImages || 0) && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={() => setLimit(prev => prev + 24)}
            className="px-8"
          >
            Xem thêm hình ảnh
          </Button>
        </div>
      )}
    </div>
  );
}
