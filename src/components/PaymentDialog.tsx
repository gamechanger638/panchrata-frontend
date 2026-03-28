import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPaymentOrder, verifyPayment } from "@/services/paymentsApi";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Heart, Zap } from "lucide-react";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentDialog({ isOpen, onClose }: PaymentDialogProps) {
  const [amount, setAmount] = useState<string>("20");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setLoading(true);
      const res = await createPaymentOrder(parseFloat(amount));
      const order = res.data;
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_rYj5v1R8vX5H2u";

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Panchratna Census",
        description: "Support Software Maintenance",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast({ title: "Success", description: "Payment successful! Thank you for your support." });
            onClose();
          } catch (e) {
            toast({ title: "Error", description: "Payment verification failed.", variant: "destructive" });
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#4f7cff",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
      });
      rzp.open();
    } catch (e: any) {
      toast({ title: "Error", description: "Could not initiate payment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-current" /> सॉफ्टवेयर सपोर्ट (Support Software)
          </DialogTitle>
          <DialogDescription>
            सॉफ्टवेयर को चलाने और मेंटेनेंस के लिए ₹10-₹20 का योगदान दें। (Contribute ₹10-₹20 to keep the software running).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">योगदान राशि (Contribution Amount - ₹)</Label>
            <div className="flex gap-2">
              {[10, 20, 50, 100].map((val) => (
                <Button 
                  key={val} 
                  variant={amount === val.toString() ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setAmount(val.toString())}
                  className="flex-1"
                >
                  ₹{val}
                </Button>
              ))}
            </div>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2"
              placeholder="Enter amount"
            />
          </div>
          
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center gap-2">
             <div className="p-3 bg-white rounded-full shadow-sm">
                <Zap className="h-6 w-6 text-primary" />
             </div>
             <p className="text-xs text-center text-muted-foreground">
                Payment is secured by Razorpay. You can pay via UPI, QR, or Card.
             </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePayment} className="w-full h-12 text-lg font-bold" disabled={loading || !amount || parseFloat(amount) <= 0}>
            {loading ? "Processing..." : "अभी भुगतान करें (Pay Now)"}
            <CreditCard className="ml-2 h-5 w-5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
