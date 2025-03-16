import { Card, CardContent } from "@/components/ui/card";

interface RequiredInfoProps {
  hasPhoneNumber: boolean;
  hasProfilePicture: boolean;
  onAddPhone: () => void;
  onAddProfilePicture: () => void;
}

export function RequiredInfo({
  hasPhoneNumber,
  hasProfilePicture,
  onAddPhone,
  onAddProfilePicture,
}: RequiredInfoProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Required for your booking</h2>
        <div className="space-y-3 divide-y divide-gray-200">
          <div className="flex justify-between items-center py-2">
            <div>
              <span className="font-medium block">Phone number</span>
              <span className="text-sm text-gray-500">
                Please verify your phone number to receive updates from your host.
              </span>
            </div>
            <button
              onClick={onAddPhone}
              className="text-red-600 text-sm font-medium"
            >
              {hasPhoneNumber ? "Edit" : "Add"}
            </button>
          </div>
          <div className="flex justify-between items-center py-2">
            <div>
              <span className="font-medium block">Profile Picture</span>
              <span className="text-sm text-gray-500">
                Your host values knowing who is using their car.
              </span>
            </div>
            <button
              onClick={onAddProfilePicture}
              className="text-red-600 text-sm font-medium"
            >
              {hasProfilePicture ? "Change Profile" : "Add"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
