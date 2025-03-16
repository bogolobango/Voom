import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type PaymentMethod = "paypal" | "airtel" | "card";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => onChange(value as PaymentMethod)}
          className="space-y-3"
        >
          <div className={`p-3 rounded-md border ${selectedMethod === "paypal" ? "border-red-600 bg-red-50" : "border-gray-200"}`}>
            <RadioGroupItem
              value="paypal"
              id="payment-paypal"
              className="sr-only"
            />
            <Label
              htmlFor="payment-paypal"
              className="flex items-center cursor-pointer"
            >
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center">
                {selectedMethod === "paypal" && (
                  <div className="h-3 w-3 rounded-full bg-red-600" />
                )}
              </div>
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 124 33"
                  className="h-6 mr-2"
                >
                  <path
                    fill="#253B80"
                    d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z"
                  />
                  <path
                    fill="#179BD7"
                    d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.562.482z"
                  />
                </svg>
                <span>PayPal</span>
              </span>
            </Label>
          </div>

          <div className={`p-3 rounded-md border ${selectedMethod === "airtel" ? "border-red-600 bg-red-50" : "border-gray-200"}`}>
            <RadioGroupItem
              value="airtel"
              id="payment-airtel"
              className="sr-only"
            />
            <Label
              htmlFor="payment-airtel"
              className="flex items-center cursor-pointer"
            >
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center">
                {selectedMethod === "airtel" && (
                  <div className="h-3 w-3 rounded-full bg-red-600" />
                )}
              </div>
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-6 mr-2"
                >
                  <path
                    fill="#E40000"
                    d="M39.65,29.8c0.32-0.52,0.49-1.12,0.49-1.77c0-1.9-1.54-3.44-3.44-3.44c-0.65,0-1.25,0.18-1.77,0.49 c-0.72-1.62-2.33-2.74-4.22-2.74c-0.46,0-0.91,0.07-1.33,0.19v-3.79c0-2.54-2.05-4.59-4.59-4.59c-2.54,0-4.59,2.05-4.59,4.59v10.43 c-0.97-1.15-2.42-1.88-4.05-1.88c-2.93,0-5.3,2.37-5.3,5.3c0,2.93,2.37,5.3,5.3,5.3c1.27,0,2.44-0.45,3.35-1.2 c0.91,0.75,2.07,1.2,3.35,1.2c1.41,0,2.69-0.55,3.64-1.44c0.97,0.91,2.26,1.46,3.69,1.46c1.42,0,2.72-0.56,3.69-1.47 c0.94,0.9,2.23,1.47,3.64,1.47c2.93,0,5.3-2.37,5.3-5.3C42.81,32.13,41.53,30.54,39.65,29.8z"
                  />
                </svg>
                <span>airtel</span>
              </span>
            </Label>
          </div>

          <div className={`p-3 rounded-md border ${selectedMethod === "card" ? "border-red-600 bg-red-50" : "border-gray-200"}`}>
            <RadioGroupItem
              value="card"
              id="payment-card"
              className="sr-only"
            />
            <Label
              htmlFor="payment-card"
              className="flex items-center cursor-pointer"
            >
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center">
                {selectedMethod === "card" && (
                  <div className="h-3 w-3 rounded-full bg-red-600" />
                )}
              </div>
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span>Credit or debit card</span>
              </span>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
