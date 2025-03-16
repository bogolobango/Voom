import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

interface CancellationPolicyProps {
  date: string;
}

export function CancellationPolicy({ date }: CancellationPolicyProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-2">Cancellation Policy</h2>
        <p className="text-sm text-gray-500 mb-2">
          Enjoy free cancellation up to 24 hours after booking. Cancel before {date}, for a 50% refund.{" "}
          <Link href="/cancellation-policy">
            <a className="text-red-600">Learn more</a>
          </Link>
        </p>
        <p className="text-sm text-gray-500">
          By clicking the "Confirm and Pay" button, I agree to the Host's car rules and regulations. I understand that adherence to these policies ensures a smooth rental experience for everyone involved.
        </p>
      </CardContent>
    </Card>
  );
}
