"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Download,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  AlertCircle,
  ExternalLink,
  Receipt,
} from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity?: number;
  unitPrice?: number;
  total: number;
}

interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  lineItems: LineItem[];
  subtotal: number;
  tax?: number;
  total: number;
}

interface InvoiceWidgetProps {
  currentInvoice?: Invoice;
  pastInvoices?: Invoice[];
  onPay?: () => void;
  stripeCheckoutUrl?: string;
}

// Demo data
const demoCurrentInvoice: Invoice = {
  id: "INV-2024-0012",
  date: "Dec 1, 2024",
  dueDate: "Dec 15, 2024",
  status: "pending",
  lineItems: [
    { id: "1", description: "Growth Plan - Monthly", total: 2500 },
    { id: "2", description: "Overage Videos (3 extra)", quantity: 3, unitPrice: 15, total: 45 },
    { id: "3", description: "Add-on: Priority Support", total: 100 },
  ],
  subtotal: 2645,
  tax: 0,
  total: 2645,
};

const demoPastInvoices: Invoice[] = [
  {
    id: "INV-2024-0011",
    date: "Nov 1, 2024",
    dueDate: "Nov 15, 2024",
    status: "paid",
    lineItems: [{ id: "1", description: "Growth Plan - Monthly", total: 2500 }],
    subtotal: 2500,
    total: 2500,
  },
  {
    id: "INV-2024-0010",
    date: "Oct 1, 2024",
    dueDate: "Oct 15, 2024",
    status: "paid",
    lineItems: [
      { id: "1", description: "Growth Plan - Monthly", total: 2500 },
      { id: "2", description: "Overage Videos (5 extra)", quantity: 5, unitPrice: 15, total: 75 },
    ],
    subtotal: 2575,
    total: 2575,
  },
];

const statusConfig = {
  paid: { label: "Paid", color: "bg-green-100 text-green-700", icon: Check },
  pending: { label: "Due Soon", color: "bg-amber-100 text-amber-700", icon: Clock },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700", icon: AlertCircle },
};

export function InvoiceWidget({
  currentInvoice = demoCurrentInvoice,
  pastInvoices = demoPastInvoices,
  onPay,
  stripeCheckoutUrl,
}: InvoiceWidgetProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePay = async () => {
    setIsProcessing(true);
    if (stripeCheckoutUrl) {
      window.open(stripeCheckoutUrl, "_blank");
    } else {
      onPay?.();
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    setIsProcessing(false);
  };

  const currentStatus = statusConfig[currentInvoice.status];
  const StatusIcon = currentStatus.icon;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Billing</CardTitle>
              <p className="text-sm text-gray-500">Invoice #{currentInvoice.id}</p>
            </div>
          </div>
          <Badge className={currentStatus.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {currentStatus.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current invoice */}
        <div className="border rounded-lg overflow-hidden">
          {/* Invoice header */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Current Invoice</p>
              <p className="text-xs text-gray-500">
                Issued {currentInvoice.date} • Due {currentInvoice.dueDate}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>

          {/* Line items */}
          <div className="px-4 py-3 space-y-2">
            {currentInvoice.lineItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-700">{item.description}</span>
                  {item.quantity && item.unitPrice && (
                    <span className="text-gray-400 ml-2">
                      ({item.quantity} × {formatCurrency(item.unitPrice)})
                    </span>
                  )}
                </div>
                <span className="text-gray-900 font-medium">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-gray-50 px-4 py-3 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Due</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(currentInvoice.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Pay button */}
        {currentInvoice.status !== "paid" && (
          <Button
            className="w-full"
            size="lg"
            onClick={handlePay}
            disabled={isProcessing}
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay {formatCurrency(currentInvoice.total)}
                {stripeCheckoutUrl && <ExternalLink className="w-4 h-4 ml-2" />}
              </>
            )}
          </Button>
        )}

        {currentInvoice.status === "paid" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-green-700 font-medium">Invoice Paid</p>
            <p className="text-green-600 text-sm">Thank you for your payment!</p>
          </div>
        )}

        {/* Payment methods note */}
        <p className="text-xs text-gray-400 text-center">
          Secure payment via Stripe • Cards, ACH, and Apple Pay accepted
        </p>

        {/* Payment history */}
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <span>Payment History</span>
            {showHistory ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showHistory && (
            <div className="space-y-2 mt-2">
              {pastInvoices.map((invoice) => {
                const status = statusConfig[invoice.status];
                const Icon = status.icon;
                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        invoice.status === "paid" ? "bg-green-100" : "bg-gray-200"
                      }`}>
                        <Icon className={`w-3 h-3 ${
                          invoice.status === "paid" ? "text-green-600" : "text-gray-500"
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.total)}
                        </p>
                        <p className="text-xs text-gray-500">{invoice.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                      <Download className="w-3 h-3 mr-1" />
                      Receipt
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
