import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return { class: 'bg-green-100 text-green-600', label: 'Active' };
      case 'inactive':
        return { class: 'bg-red-100 text-red-600', label: 'Offline' };
      case 'paused':
        return { class: 'bg-amber-100 text-amber-600', label: 'Paused' };
      case 'connecting':
        return { class: 'bg-blue-100 text-blue-600', label: 'Connecting' };
      case 'subscriber':
        return { class: 'bg-primary/10 text-primary', label: 'Subscriber' };
      case 'moderator':
        return { class: 'bg-green-100 text-green-600', label: 'Moderator' };
      case 'regular':
        return { class: 'bg-neutral-200 text-neutral-700', label: 'Regular' };
      default:
        return { class: 'bg-neutral-200 text-neutral-700', label: status };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge className={cn(config.class, "font-normal", className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
