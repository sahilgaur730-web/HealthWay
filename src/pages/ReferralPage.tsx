import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ReferralTracker from '../components/referral/ReferralTracker';

export default function ReferralPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <ReferralTracker />
      </div>
    </DashboardLayout>
  );
}
