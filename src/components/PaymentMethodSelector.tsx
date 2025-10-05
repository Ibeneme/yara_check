import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, Banknote } from "lucide-react";

interface PaymentMethodSelectorProps {
  amount: number;
  onSelectMethod: (method: 'stripe' | 'paystack' | 'flutterwave') => void;
  onCancel: () => void;
  isProcessing: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  onSelectMethod,
  onCancel,
  isProcessing
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center">Choose Payment Method</CardTitle>
          <p className="text-center text-gray-600">
            Payment required: ${(amount / 100).toFixed(2)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => onSelectMethod('paystack')}
            disabled={isProcessing}
            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Pay with Paystack</div>
                <div className="text-sm opacity-90">USD ${(amount / 100).toFixed(2)}</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => onSelectMethod('flutterwave')}
            disabled={isProcessing}
            className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <div className="flex items-center space-x-3">
              <Banknote className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Pay with Flutterwave</div>
                <div className="text-sm opacity-90">USD ${(amount / 100).toFixed(2)}</div>
              </div>
            </div>
          </Button>
          
          <Button
            onClick={() => onSelectMethod('stripe')}
            disabled={isProcessing}
            variant="outline"
            className="w-full h-16"
          >
            <div className="flex items-center space-x-3">
              <CreditCard className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Pay with Stripe</div>
                <div className="text-sm opacity-90">USD ${(amount / 100).toFixed(2)}</div>
              </div>
            </div>
          </Button>
          
          <Button
            onClick={onCancel}
            disabled={isProcessing}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodSelector;