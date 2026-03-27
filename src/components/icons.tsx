import {
  TrendingUp,
  TrendingDown,
  Phone,
  PhoneOff,
  PhoneIncoming,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Users,
  Truck,
  BarChart3,
  RefreshCw,
  Plus,
  Settings,
  Search,
  Bell,
  Menu,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  type LucideProps
} from 'lucide-react';

export type Icon = React.ComponentType<LucideProps>;

export const Icons = {
  // Trends
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  arrowUpRight: ArrowUpRight,
  arrowDownRight: ArrowDownRight,

  // Phone / Calls
  phone: Phone,
  phoneOff: PhoneOff,
  phoneIncoming: PhoneIncoming,

  // Status
  checkCircle: CheckCircle,
  xCircle: XCircle,
  alertCircle: AlertCircle,
  clock: Clock,

  // Business
  dollarSign: DollarSign,
  users: Users,
  truck: Truck,
  barChart: BarChart3,

  // Actions
  refresh: RefreshCw,
  plus: Plus,
  settings: Settings,
  search: Search,
  bell: Bell,
  menu: Menu,
  moreHorizontal: MoreHorizontal,

  // Navigation
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,

  // Loading
  spinner: Loader2,
};
