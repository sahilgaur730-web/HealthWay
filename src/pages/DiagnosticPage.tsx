import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import DiagnosticDashboard from '../components/diagnostic/DiagnosticDashboard';

export default function DiagnosticPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <DiagnosticDashboard allowOrdering={true} />
      </div>
    </DashboardLayout>
  );
}
