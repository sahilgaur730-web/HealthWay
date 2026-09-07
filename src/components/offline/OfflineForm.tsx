import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, Database, AlertTriangle } from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';
import { useLanguage } from '../../context/LanguageContext';
import OfflineNotice from './OfflineNotice';

interface OfflineFormProps {
  children: React.ReactNode;
  formType: string;
  formNameMr?: string;
  submitUrl: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  onSubmitSuccess?: (result: any) => void;
}

export default function OfflineForm({
  children,
  formType,
  formNameMr,
  submitUrl,
  method = 'POST',
  onSubmitSuccess
}: OfflineFormProps) {
  const { lang } = useLanguage();
  const { submitData } = useOffline();
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'submitting' | 'synced_online' | 'queued_offline' | 'error'
  >('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const handleSubmit = async (formData: any) => {
    setSubmissionStatus('submitting');
    try {
      const res = await submitData(formType, submitUrl, method, formData);

      if (res.online && res.success) {
        setSubmissionStatus('synced_online');
        setFeedbackMessage(
          lang === 'mr'
            ? 'नोंद थेट राज्य सर्व्हरवर यशस्वीरित्या सबमिट केली गेली.'
            : 'Record submitted and verified online with state database.'
        );
      } else if (res.queued) {
        setSubmissionStatus('queued_offline');
        setFeedbackMessage(
          lang === 'mr'
            ? 'ऑफलाइन मोड: माहिती स्थानिक कॅशमध्ये सुरक्षित जतन केली गेली. ऑनलाइन येताच सिंक होईल.'
            : 'Offline Mode: Data saved locally. Will synchronize automatically upon reconnection.'
        );
      } else {
        setSubmissionStatus('error');
        setFeedbackMessage(
          lang === 'mr' ? 'माहिती जतन करताना अडचण आली.' : 'Error saving record. Please retry.'
        );
      }

      if (onSubmitSuccess) {
        onSubmitSuccess(res);
      }

      setTimeout(() => {
        setSubmissionStatus('idle');
      }, 6000);
    } catch {
      setSubmissionStatus('error');
      setFeedbackMessage(
        lang === 'mr' ? 'तांत्रिक त्रुटी आढळली.' : 'Unexpected transaction fault.'
      );
      setTimeout(() => setSubmissionStatus('idle'), 5000);
    }
  };

  return (
    <div className="space-y-4">
      <OfflineNotice formName={formType} formNameMr={formNameMr} />

      {/* Submission Feedback Banner */}
      {submissionStatus === 'submitting' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-900 font-semibold animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-[#1A4B8C]" />
          <span>{lang === 'mr' ? 'माहिती जतन करत आहे...' : 'Processing submission...'}</span>
        </div>
      )}

      {submissionStatus === 'synced_online' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {submissionStatus === 'queued_offline' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-semibold">
          <Database className="w-4 h-4 text-amber-700" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {submissionStatus === 'error' && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-900 font-semibold">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      <div>
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              onSubmitOffline: handleSubmit
            })
          : children}
      </div>
    </div>
  );
}
