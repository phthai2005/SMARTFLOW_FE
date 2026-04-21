import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  MapPin, 
  AlertTriangle, 
  BookOpenCheck, 
  ShieldAlert, 
  Users, 
  Cpu, 
  Image as ImageIcon,
  Menu,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/crowdsourcing", label: "Báo cáo thực địa", icon: MapPin },
  { href: "/sign-reports", label: "Biển báo lỗi", icon: AlertTriangle },
  { href: "/rules", label: "Cấu hình Luật", icon: BookOpenCheck },
  { href: "/evidence", label: "Kho ảnh", icon: ImageIcon },
  { href: "/admins", label: "Quản lý Admin", icon: ShieldAlert },
  { href: "/users", label: "Người dùng", icon: Users },
  { href: "/models", label: "Model AI", icon: Cpu },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-[#0B1120]">
          <div className="flex items-center gap-2 font-bold text-white tracking-wider text-lg">
            <Cpu className="h-6 w-6 text-blue-500" />
            <span>SMARTFLOW</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive 
                      ? "bg-blue-600/10 text-blue-400" 
                      : "hover:bg-slate-800/50 hover:text-slate-100"
                  )}>
                    <Icon className={cn("h-5 w-5", isActive ? "text-blue-400" : "text-slate-400")} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800/50 transition-colors cursor-pointer text-sm font-medium text-slate-400 hover:text-slate-100">
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </div>
        </div>
      </aside>
    </>
  );
}
