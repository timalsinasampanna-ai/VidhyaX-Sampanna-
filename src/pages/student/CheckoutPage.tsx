import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
  ArrowRight,
  Info,
  Phone,
  Copy,
  Check,
} from 'lucide-react';
import { PaymentSettings } from '../../types';

export const CheckoutPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { user, purchases, refreshPurchases } = useAuth();

  const isClass12 = packageId?.includes('12');
  const classGrade: 11 | 12 = isClass12 ? 12 : 11;
  const packageName = `Grade ${classGrade} Science Full Premium Notes Package`;
  const amountNpr = 599; // Server-validated fixed price

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [transactionReference, setTransactionReference] = useState('');
  const [payerPhoneNumber, setPayerPhoneNumber] = useState(user?.phoneNumber || '+97798');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Check if existing pending or approved request already exists
  const existingPending = purchases.find(
    (p) => p.classGrade === classGrade && p.status === 'pending_approval'
  );
  const existingApproved = purchases.find(
    (p) => p.classGrade === classGrade && p.status === 'approved'
  );

  useEffect(() => {
    api.getPaymentSettings().then((settings) => setPaymentSettings(settings));
  }, []);

  const handleCopyEsewaId = () => {
    if (paymentSettings?.esewaId) {
      navigator.clipboard.writeText(paymentSettings.esewaId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      const url = URL.createObjectURL(file);
      setProofPreviewUrl(url);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      setErrorMessage('Please sign in or create an account before submitting a payment request.');
      return;
    }

    if (!transactionReference.trim()) {
      setErrorMessage('Please provide your 10 to 16 digit eSewa Transaction Reference ID or Code.');
      return;
    }

    setIsLoading(true);
    try {
      await api.submitPurchaseRequest({
        userId: user.id,
        studentName: user.fullName,
        studentEmail: user.email,
        classGrade,
        paymentMethod: 'esewa',
        transactionReference: transactionReference.trim(),
        payerPhoneNumber: payerPhoneNumber.trim(),
        proofUrl: proofPreviewUrl || undefined,
      });

      await refreshPurchases();
      setSubmittedSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment request submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (existingApproved) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Already Unlocked</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            You already have active, approved lifetime access to {packageName}.
          </p>
          <Link
            to={`/class/${classGrade}`}
            className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg"
          >
            Go to Grade {classGrade} Notes
          </Link>
        </div>
      </div>
    );
  }

  if (submittedSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white">Payment Request Submitted!</h2>

          {/* Exact required wording */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed text-left">
            <p className="font-medium text-amber-300 mb-2">Important Review Timeline:</p>
            <p>
              Your premium access request has been submitted successfully. Please wait for administrator approval. Approval usually takes 5–6 hours, although processing time may vary.
            </p>
          </div>

          <div className="text-xs text-slate-400 space-y-1 text-left bg-slate-950/60 p-3 rounded-lg font-mono">
            <p>• Package: Grade {classGrade} Science Master Package</p>
            <p>• Amount: NPR 599</p>
            <p>• Transaction Reference: {transactionReference}</p>
            <p>• Payer ID: {payerPhoneNumber}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/purchases"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg"
            >
              Track Purchase Status
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
            Premium Access Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Complete Payment for Grade {classGrade} Master Notes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official digital wallet payment gateway via eSewa Nepal.
          </p>
        </div>

        {existingPending && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-bold">Pending Request Already in Queue</p>
              <p className="mt-0.5 text-slate-300">
                You already submitted a payment request (Ref: {existingPending.transactionReference}) on{' '}
                {new Date(existingPending.createdAt).toLocaleDateString()}. Please wait 5–6 hours for administrator review, or check status on your purchases page.
              </p>
              <Link to="/purchases" className="text-amber-300 underline font-medium mt-1 inline-block">
                View Purchases Status →
              </Link>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official eSewa QR & Transfer Details */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Official Merchant QR
              </span>
              <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                eSewa Nepal
              </span>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
              <img
                src={paymentSettings?.qrImageUrl || '/src/assets/images/esewa_payment_qr_1791696688922.jpg'}
                alt="eSewa QR Code Vidhya X Education"
                className="w-full max-w-[260px] h-auto object-contain rounded"
              />
              <p className="text-[11px] font-bold text-slate-800 mt-2">
                Merchant: {paymentSettings?.merchantName || 'Vidhya X Education'}
              </p>
            </div>

            {/* Merchant Details Box */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">eSewa ID:</span>
                <div className="flex items-center gap-1.5 font-mono text-white font-bold">
                  <span>{paymentSettings?.esewaId || '9841234567'}</span>
                  <button
                    onClick={handleCopyEsewaId}
                    className="p-1 hover:text-indigo-400 text-slate-400 transition-colors"
                    title="Copy eSewa ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-400">Payable Amount:</span>
                <span className="text-base font-black text-white font-mono">NPR {amountNpr}</span>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
              <p className="font-semibold text-slate-300">How to Pay:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Open your eSewa app on your smartphone.</li>
                <li>Tap <strong className="text-white">Scan QR</strong> and scan the QR code above (or transfer to ID {paymentSettings?.esewaId || '9841234567'}).</li>
                <li>In Remarks, write your student email: <strong className="text-white">{user?.email || 'your-email'}</strong></li>
                <li>Complete payment of NPR 599 and copy the 12-digit transaction code.</li>
              </ol>
            </div>
          </div>

          {/* Right Column: Payment Request Verification Form */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white">Payment Submission Details</h2>

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              {/* Package Summary Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-[11px] text-slate-400">Selected Package</p>
                  <p className="font-bold text-white text-sm">{packageName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Amount</p>
                  <p className="font-black text-emerald-400 text-lg font-mono">NPR {amountNpr}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.fullName || 'Student'}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Student Registered Email</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'student@vidhyax.edu.np'}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Payer Mobile / eSewa Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={payerPhoneNumber}
                  onChange={(e) => setPayerPhoneNumber(e.target.value)}
                  placeholder="+97798XXXXXXXX"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  eSewa Transaction Reference ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g. 208104192837 or ESEWA2081..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Found on your eSewa transaction receipt under "Ref ID" or "Transaction ID".
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Optional Payment Screenshot Proof
                </label>
                <div className="border border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center cursor-pointer bg-slate-950/40 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {proofPreviewUrl ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={proofPreviewUrl}
                        alt="Proof preview"
                        className="w-12 h-12 object-cover rounded border border-slate-700"
                      />
                      <span className="text-emerald-400 font-medium">Screenshot attached: {proofFile?.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <Upload className="w-5 h-5 text-indigo-400" />
                      <span>Click to upload payment confirmation screenshot</span>
                      <span className="text-[10px] text-slate-600">JPG, PNG (Max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transparent Human Review Timeline Disclosure */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Approval Notice:</strong> Our academic team verifies each transaction reference against the bank statement. Approval usually takes <strong className="text-white">5–6 hours</strong>. You will receive an immediate in-app confirmation once verified.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Submitting Payment Request...' : 'Submit Payment Request'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
