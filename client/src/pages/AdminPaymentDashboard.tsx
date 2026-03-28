/**
 * TraceCore AI — Admin Payment Dashboard
 * Track incoming payments, confirm them, and manage account upgrades
 */

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, User, Mail, DollarSign, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { TIER_CONFIG } from '@shared/tiers';

interface Payment {
  id: string;
  email: string;
  tier: 'pro' | 'pro_plus';
  amount: number;
  reference: string;
  status: 'pending' | 'confirmed' | 'failed';
  submittedAt: Date;
  confirmedAt?: Date;
  notes?: string;
}

const MOCK_PAYMENTS: Payment[] = [
  {
    id: '1',
    email: 'customer1@example.com',
    tier: 'pro',
    amount: 299,
    reference: 'TRACECORE-1711612800000',
    status: 'pending',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    notes: 'Awaiting payment confirmation',
  },
  {
    id: '2',
    email: 'customer2@example.com',
    tier: 'pro_plus',
    amount: 599,
    reference: 'TRACECORE-1711609200000',
    status: 'confirmed',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    confirmedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  },
];

export default function AdminPaymentDashboard() {
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [confirmNotes, setConfirmNotes] = useState('');

  const filteredPayments = payments.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesEmail = p.email.toLowerCase().includes(searchEmail.toLowerCase());
    return matchesStatus && matchesEmail;
  });

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    confirmed: payments.filter(p => p.status === 'confirmed').length,
    totalRevenue: payments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  const handleConfirmPayment = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'confirmed', confirmedAt: new Date(), notes: confirmNotes }
        : p
    ));
    toast.success('Payment confirmed! Account upgraded.');
    setSelectedPayment(null);
    setConfirmNotes('');
  };

  const handleRejectPayment = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'failed', notes: 'Payment rejected by admin' }
        : p
    ));
    toast.error('Payment rejected.');
    setSelectedPayment(null);
  };

  const handleExportCSV = () => {
    const csv = [
      ['Email', 'Tier', 'Amount', 'Reference', 'Status', 'Submitted', 'Confirmed'],
      ...payments.map(p => [
        p.email,
        p.tier,
        `R${p.amount}`,
        p.reference,
        p.status,
        new Date(p.submittedAt).toLocaleString(),
        p.confirmedAt ? new Date(p.confirmedAt).toLocaleString() : '-',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Payments exported to CSV');
  };

  return (
    <div className="flex flex-col h-full page-enter">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Payment Dashboard</h1>
              <p className="text-xs text-muted-foreground">Manage customer payments and upgrades</p>
            </div>
          </div>
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-border">
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Payments</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-500">{stats.confirmed}</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-primary">R{stats.totalRevenue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-border flex gap-3 items-center">
        <Input
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          {(['all', 'pending', 'confirmed', 'failed'] as const).map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filteredPayments.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No payments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPayments.map(payment => (
              <div
                key={payment.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{payment.email}</p>
                        <p className="text-xs text-muted-foreground">{payment.reference}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {TIER_CONFIG[payment.tier].name} Plan
                      </span>
                      <span className="font-semibold text-foreground">R{payment.amount}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(payment.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {payment.status === 'pending' && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Pending
                      </div>
                    )}
                    {payment.status === 'confirmed' && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Confirmed
                      </div>
                    )}
                    {payment.status === 'failed' && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <h2 className="text-lg font-bold text-foreground mb-4">Payment Details</h2>

            {/* Payment Info */}
            <div className="space-y-3 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{selectedPayment.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tier:</span>
                <span className="font-medium text-foreground">{TIER_CONFIG[selectedPayment.tier].name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-primary text-lg">R{selectedPayment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-mono text-xs text-foreground">{selectedPayment.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${
                  selectedPayment.status === 'pending' ? 'text-amber-600' :
                  selectedPayment.status === 'confirmed' ? 'text-emerald-600' :
                  'text-red-600'
                }`}>
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="text-sm text-foreground">{new Date(selectedPayment.submittedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Action Section */}
            {selectedPayment.status === 'pending' && (
              <>
                <div className="mb-4">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Confirmation Notes (Optional)
                  </label>
                  <textarea
                    value={confirmNotes}
                    onChange={(e) => setConfirmNotes(e.target.value)}
                    placeholder="Add any notes about this payment..."
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleConfirmPayment(selectedPayment.id)}
                    className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm Payment
                  </Button>
                  <Button
                    onClick={() => handleRejectPayment(selectedPayment.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              </>
            )}

            {selectedPayment.status === 'confirmed' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-600 text-sm">
                <p className="font-medium mb-1">✓ Payment Confirmed</p>
                <p className="text-xs">
                  Confirmed on {new Date(selectedPayment.confirmedAt!).toLocaleString()}
                </p>
              </div>
            )}

            <Button
              onClick={() => setSelectedPayment(null)}
              variant="outline"
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
