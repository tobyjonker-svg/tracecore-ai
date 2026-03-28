/**
 * Admin Payment Dashboard
 * Tracks incoming payments, manages confirmation workflow, and exports data
 * Connected to tRPC backend for real data
 */

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import {
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Check,
  X,
  Loader2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type PaymentStatus = 'all' | 'pending' | 'completed' | 'failed';

interface PaymentDetail {
  id: number;
  amount: number;
  currency: string;
  status: string;
  paystackReference: string | null;
  paymentMethod: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminPaymentDashboard() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');
  const [searchRef, setSearchRef] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Fetch payments list
  const { data: payments = [], isLoading, refetch } = trpc.payment.list.useQuery({
    limit: 100,
    offset: 0,
  });

  // Fetch payment statistics
  const { data: stats = {
    totalCount: 0,
    pendingCount: 0,
    completedCount: 0,
    failedCount: 0,
    totalRevenue: 0,
  } } = trpc.payment.stats.useQuery();

  // Mutations
  const confirmMutation = trpc.payment.confirm.useMutation({
    onSuccess: () => {
      toast.success('Payment confirmed');
      refetch();
      setIsDetailModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to confirm payment');
    },
  });

  const rejectMutation = trpc.payment.reject.useMutation({
    onSuccess: () => {
      toast.success('Payment rejected');
      refetch();
      setIsRejectModalOpen(false);
      setRejectReason('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject payment');
    },
  });

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesSearch = searchRef === '' || 
        (p.paystackReference?.toLowerCase().includes(searchRef.toLowerCase()) ?? false);
      return matchesStatus && matchesSearch;
    });
  }, [payments, statusFilter, searchRef]);

  const handleConfirmPayment = (payment: PaymentDetail) => {
    confirmMutation.mutate({ id: payment.id });
  };

  const handleRejectPayment = () => {
    if (!selectedPayment || !rejectReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    rejectMutation.mutate({
      id: selectedPayment.id,
      reason: rejectReason,
    });
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Amount', 'Currency', 'Status', 'Reference', 'Method', 'Created', 'Updated'];
    const rows = filteredPayments.map(p => [
      p.id,
      `R${(p.amount / 100).toFixed(2)}`,
      p.currency,
      p.status,
      p.paystackReference || '-',
      p.paymentMethod || '-',
      new Date(p.createdAt).toLocaleString(),
      new Date(p.updatedAt).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'completed':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Please log in to view payments</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 page-enter max-w-6xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">
            Payment Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Track and manage customer payments
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Payments */}
        <div className="tc-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Payments</p>
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalCount}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>

        {/* Pending */}
        <div className="tc-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
        </div>

        {/* Confirmed */}
        <div className="tc-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Confirmed</p>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.completedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Completed</p>
        </div>

        {/* Failed */}
        <div className="tc-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Failed</p>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.failedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Rejected</p>
        </div>

        {/* Total Revenue */}
        <div className="tc-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Revenue</p>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">
            R{(stats.totalRevenue / 100).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Confirmed only</p>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="tc-card space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference..."
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PaymentStatus)}>
            <SelectTrigger className="w-full md:w-40 bg-muted/50 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Confirmed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="tc-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground font-medium">#{payment.id}</td>
                    <td className="px-4 py-3 text-sm text-foreground font-medium">
                      R{(payment.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground truncate">
                      {payment.paystackReference || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                        getStatusColor(payment.status)
                      )}>
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmPayment(payment)}
                              disabled={confirmMutation.isPending}
                              className="p-1.5 hover:bg-emerald-500/10 rounded transition-colors"
                              title="Confirm payment"
                            >
                              <Check className="w-4 h-4 text-emerald-400" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsRejectModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                              title="Reject payment"
                            >
                              <X className="w-4 h-4 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {isDetailModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <h2 className="text-lg font-bold text-foreground mb-4">Payment Details</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment ID:</span>
                <span className="text-sm font-medium text-foreground">#{selectedPayment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="text-sm font-medium text-foreground">
                  R{(selectedPayment.amount / 100).toFixed(2)} {selectedPayment.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className={cn(
                  'text-sm font-medium px-2 py-1 rounded border',
                  getStatusColor(selectedPayment.status)
                )}>
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reference:</span>
                <span className="text-sm font-medium text-foreground">
                  {selectedPayment.paystackReference || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Method:</span>
                <span className="text-sm font-medium text-foreground">
                  {selectedPayment.paymentMethod || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm font-medium text-foreground">
                  {new Date(selectedPayment.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {selectedPayment.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleConfirmPayment(selectedPayment)}
                  disabled={confirmMutation.isPending}
                  className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="w-4 h-4" />
                  Confirm
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setIsRejectModalOpen(true);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            )}

            <Button
              onClick={() => setIsDetailModalOpen(false)}
              variant="outline"
              className="w-full mt-2"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <h2 className="text-lg font-bold text-foreground mb-4">Reject Payment</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting payment #{selectedPayment.id}
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground text-sm mb-4"
              rows={4}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleRejectPayment}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                Reject
              </Button>
              <Button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
