import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Booking, Car, PayoutMethod, PayoutTransaction } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowDownToLine,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Phone,
  Plus,
  Smartphone,
  Trash2,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import { useLocation } from "wouter";

type EarningsData = {
  totalEarnings: number;
  pendingPayouts: number;
  completedBookings: number;
  activeBookings: number;
  totalListings: number;
  currency: string;
};

export default function HostEarnings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<"overview" | "methods" | "add-method" | "request-payout">("overview");
  const [newMethod, setNewMethod] = useState({
    methodType: "momo",
    phoneNumber: "",
    accountName: "",
    accountNumber: "",
  });
  const [payoutAmount, setPayoutAmount] = useState("");

  const { data: user } = useQuery<User>({ queryKey: ["/api/users/me"] });
  const { data: earnings, isLoading: isLoadingEarnings } = useQuery<EarningsData>({
    queryKey: ["/api/host/earnings"],
    enabled: !!user,
  });
  const { data: payoutMethods, isLoading: isLoadingMethods } = useQuery<PayoutMethod[]>({
    queryKey: ["/api/payout-methods"],
    enabled: !!user,
  });
  const { data: payoutTransactions } = useQuery<PayoutTransaction[]>({
    queryKey: ["/api/payouts"],
    enabled: !!user,
  });

  const addMethodMutation = useMutation({
    mutationFn: async (data: typeof newMethod) => {
      const res = await apiRequest("POST", "/api/payout-methods", {
        ...data,
        isDefault: !payoutMethods || payoutMethods.length === 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payout-methods"] });
      toast({ title: "Payout method added" });
      setActiveView("methods");
      setNewMethod({ methodType: "momo", phoneNumber: "", accountName: "", accountNumber: "" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to add method", description: err.message, variant: "destructive" });
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/payout-methods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payout-methods"] });
      toast({ title: "Payout method removed" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/payout-methods/${id}/default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payout-methods"] });
      toast({ title: "Default method updated" });
    },
  });

  const requestPayoutMutation = useMutation({
    mutationFn: async (data: { payoutMethodId: number; amount: number }) => {
      const res = await apiRequest("POST", "/api/payouts/request", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/host/earnings"] });
      toast({ title: "Payout requested", description: "Your payout will be processed within 3-5 business days." });
      setActiveView("overview");
      setPayoutAmount("");
    },
    onError: (err: Error) => {
      toast({ title: "Payout failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoadingEarnings || isLoadingMethods) {
    return (
      <>
        <Header title="Earnings & Payouts" showBack />
        <main className="container mx-auto px-4 py-6 mb-20"><LoadingScreen /></main>
        <BottomNav />
      </>
    );
  }

  const availableBalance = (earnings?.totalEarnings || 0) -
    (payoutTransactions?.filter(p => p.status === "completed" || p.status === "pending").reduce((s, p) => s + p.amount, 0) || 0);
  const defaultMethod = payoutMethods?.find(m => m.isDefault);

  return (
    <>
      <Header title="Earnings & Payouts" showBack onBack={() => navigate("/host-dashboard")} />
      <main className="container mx-auto px-4 py-6 mb-20 md:mb-6">
        {activeView === "overview" && (
          <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="col-span-2 bg-gradient-to-br from-red-600 to-red-700 text-white">
                <CardContent className="pt-6">
                  <p className="text-red-100 text-sm">Available Balance</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(Math.max(availableBalance, 0))}</p>
                  <div className="flex items-center mt-4 gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                      onClick={() => {
                        if (!payoutMethods || payoutMethods.length === 0) {
                          toast({ title: "Add a payout method first", description: "You need a payout method before requesting a payout." });
                          setActiveView("add-method");
                          return;
                        }
                        setActiveView("request-payout");
                      }}
                      disabled={availableBalance <= 0}
                    >
                      <ArrowDownToLine className="h-4 w-4 mr-1" /> Withdraw
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                      onClick={() => setActiveView("methods")}
                    >
                      <Wallet className="h-4 w-4 mr-1" /> Payout Methods
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-gray-500">Earned</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(earnings?.totalEarnings || 0)}</p>
                  <p className="text-xs text-gray-400 mt-1">{earnings?.completedBookings || 0} completed trips</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(earnings?.pendingPayouts || 0)}</p>
                  <p className="text-xs text-gray-400 mt-1">{earnings?.activeBookings || 0} active trips</p>
                </CardContent>
              </Card>
            </div>

            {/* How Payouts Work */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How Payouts Work</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full shrink-0">
                      <Banknote className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">You earn 85% of each booking</p>
                      <p className="text-xs text-gray-500">Voom takes a 15% platform fee</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full shrink-0">
                      <CreditCard className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Earnings available after trip completion</p>
                      <p className="text-xs text-gray-500">Funds release once the renter returns the car</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full shrink-0">
                      <Smartphone className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Withdraw via Mobile Money or Bank</p>
                      <p className="text-xs text-gray-500">Payouts processed within 3-5 business days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payout History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                {payoutTransactions && payoutTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {payoutTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            tx.status === "completed" ? "bg-green-100" :
                            tx.status === "pending" ? "bg-yellow-100" : "bg-red-100"
                          }`}>
                            {tx.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                             tx.status === "pending" ? <Clock className="h-4 w-4 text-yellow-600" /> :
                             <XCircle className="h-4 w-4 text-red-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{formatCurrency(tx.amount)}</p>
                            <p className="text-xs text-gray-500">
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "Processing"}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          tx.status === "completed" ? "bg-green-100 text-green-800" :
                          tx.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                        }`}>{tx.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">No payouts yet. Complete a trip to start earning!</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === "methods" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Payout Methods</h2>
              <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => setActiveView("add-method")}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            {payoutMethods && payoutMethods.length > 0 ? (
              <div className="space-y-3">
                {payoutMethods.map((method) => (
                  <Card key={method.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 p-2 rounded-full">
                            {method.methodType === "momo" ? <Phone className="h-5 w-5 text-red-600" /> :
                             <CreditCard className="h-5 w-5 text-red-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {method.methodType === "momo" ? "Mobile Money" :
                               method.methodType === "bank" ? "Bank Transfer" : method.methodType}
                            </p>
                            <p className="text-xs text-gray-500">
                              {method.phoneNumber || method.accountNumber || "•••• ••••"}
                            </p>
                            {method.isDefault && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!method.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => setDefaultMutation.mutate(method.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMethodMutation.mutate(method.id)}
                          >
                            <Trash2 className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Wallet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No payout methods yet</p>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => setActiveView("add-method")}>
                    Add Payout Method
                  </Button>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" className="w-full" onClick={() => setActiveView("overview")}>
              Back to Earnings
            </Button>
          </div>
        )}

        {activeView === "add-method" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Add Payout Method</h2>

            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "momo", label: "Mobile Money", icon: Phone },
                { type: "bank", label: "Bank Transfer", icon: CreditCard },
              ].map((opt) => (
                <button
                  key={opt.type}
                  className={`border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                    newMethod.methodType === opt.type
                      ? "border-red-600 bg-red-50"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                  onClick={() => setNewMethod({ ...newMethod, methodType: opt.type })}
                >
                  <opt.icon className={`h-6 w-6 ${newMethod.methodType === opt.type ? "text-red-600" : "text-gray-500"}`} />
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>

            {newMethod.methodType === "momo" && (
              <div className="space-y-4">
                <div>
                  <Label>Account Name</Label>
                  <Input
                    placeholder="Name on your MoMo account"
                    value={newMethod.accountName}
                    onChange={(e) => setNewMethod({ ...newMethod, accountName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+237 6XX XXX XXX"
                    value={newMethod.phoneNumber}
                    onChange={(e) => setNewMethod({ ...newMethod, phoneNumber: e.target.value })}
                  />
                </div>
              </div>
            )}

            {newMethod.methodType === "bank" && (
              <div className="space-y-4">
                <div>
                  <Label>Account Name</Label>
                  <Input
                    placeholder="Name on your bank account"
                    value={newMethod.accountName}
                    onChange={(e) => setNewMethod({ ...newMethod, accountName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input
                    placeholder="Your bank account number"
                    value={newMethod.accountNumber}
                    onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setActiveView("methods")}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={addMethodMutation.isPending ||
                  (newMethod.methodType === "momo" && !newMethod.phoneNumber) ||
                  (newMethod.methodType === "bank" && !newMethod.accountNumber)}
                onClick={() => addMethodMutation.mutate(newMethod)}
              >
                {addMethodMutation.isPending ? "Adding..." : "Add Method"}
              </Button>
            </div>
          </div>
        )}

        {activeView === "request-payout" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Request Payout</h2>

            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(Math.max(availableBalance, 0))}</p>
              </CardContent>
            </Card>

            <div>
              <Label>Amount (FCFA)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                max={availableBalance}
              />
              <p className="text-xs text-gray-500 mt-1">
                Min: 1,000 FCFA &middot; Max: {formatCurrency(Math.max(availableBalance, 0))}
              </p>
            </div>

            <div>
              <Label>Payout Method</Label>
              {defaultMethod ? (
                <Card className="mt-2">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Phone className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">
                        {defaultMethod.methodType === "momo" ? "Mobile Money" : "Bank Transfer"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {defaultMethod.phoneNumber || defaultMethod.accountNumber}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-auto">Default</span>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No default method. <button className="text-red-600 underline" onClick={() => setActiveView("add-method")}>Add one</button></p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setActiveView("overview")}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={
                  requestPayoutMutation.isPending ||
                  !defaultMethod ||
                  !payoutAmount ||
                  parseInt(payoutAmount) < 1000 ||
                  parseInt(payoutAmount) > availableBalance
                }
                onClick={() => {
                  if (defaultMethod) {
                    requestPayoutMutation.mutate({
                      payoutMethodId: defaultMethod.id,
                      amount: parseInt(payoutAmount),
                    });
                  }
                }}
              >
                {requestPayoutMutation.isPending ? "Processing..." : "Request Payout"}
              </Button>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
