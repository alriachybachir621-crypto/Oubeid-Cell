import React, { useEffect, useState } from 'react';
import { Delete, Lock, X } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
  ADMIN_EMAIL,
  PASSCODE_SUFFIX,
  auth,
  db,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import type { Language } from '../types';
import { getT } from '../i18n/translations';

interface PinModalProps {
  lang: Language;
  open: boolean;
  adminInitialized: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ATTEMPTS_KEY = 'oubeid_pin_attempts';
const LOCK_KEY = 'oubeid_pin_lock_until';
const LOCK_DURATION_MS = 5 * 60 * 1000;

export const PinModal: React.FC<PinModalProps> = ({
  lang,
  open,
  adminInitialized,
  onClose,
  onSuccess,
}) => {
  const t = getT(lang);
  const [pin, setPin] = useState('');
  const [setupFirstPin, setSetupFirstPin] = useState('');
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [forceLoginMode, setForceLoginMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lockUntil, setLockUntil] = useState<number>(() => {
    const raw = localStorage.getItem(LOCK_KEY);
    return raw ? Number(raw) : 0;
  });
  const [now, setNow] = useState(Date.now());

  const isSetupMode = !adminInitialized && !forceLoginMode;
  const isLocked = lockUntil > now;
  const remainingSec = Math.max(0, Math.ceil((lockUntil - now) / 1000));

  useEffect(() => {
    if (!open) {
      setPin('');
      setSetupFirstPin('');
      setSetupStep(1);
      setErrorMsg('');
      return;
    }
    const storedLock = Number(localStorage.getItem(LOCK_KEY) || '0');
    setLockUntil(storedLock);
    setNow(Date.now());
  }, [open]);

  useEffect(() => {
    if (!isLocked) return;
    const interval = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockUntil) {
        localStorage.removeItem(LOCK_KEY);
        localStorage.removeItem(ATTEMPTS_KEY);
        setLockUntil(0);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isLocked, lockUntil]);

  const recordFailedAttempt = () => {
    const prev = Number(localStorage.getItem(ATTEMPTS_KEY) || '0') + 1;
    if (prev >= 5) {
      const until = Date.now() + LOCK_DURATION_MS;
      localStorage.setItem(LOCK_KEY, String(until));
      localStorage.setItem(ATTEMPTS_KEY, '0');
      setLockUntil(until);
      setNow(Date.now());
      setErrorMsg(t.pin.locked);
    } else {
      localStorage.setItem(ATTEMPTS_KEY, String(prev));
      setErrorMsg(t.pin.wrongCode);
    }
  };

  const submitPin = async (code: string) => {
    if (isLocked || submitting) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (isSetupMode) {
        if (setupStep === 1) {
          setSetupFirstPin(code);
          setSetupStep(2);
          setPin('');
          setSubmitting(false);
          return;
        }

        if (code !== setupFirstPin) {
          setSetupFirstPin('');
          setSetupStep(1);
          setPin('');
          setErrorMsg(t.pin.mismatch);
          setSubmitting(false);
          return;
        }

        try {
          await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, code + PASSCODE_SUFFIX);
          try {
            await setDoc(doc(db, 'app_meta', 'admin_status'), {
              initialized: true,
              updatedAt: new Date().toISOString(),
            });
          } catch (fsErr) {
            handleFirestoreError(fsErr, OperationType.WRITE, 'app_meta/admin_status');
          }
          localStorage.removeItem(ATTEMPTS_KEY);
          localStorage.removeItem(LOCK_KEY);
          setPin('');
          onSuccess();
        } catch (err: unknown) {
          const codeErr = (err as { code?: string })?.code || '';
          if (codeErr === 'auth/email-already-in-use') {
            setForceLoginMode(true);
            setSetupStep(1);
            setSetupFirstPin('');
            setPin('');
            setErrorMsg(t.pin.alreadyExists);
          } else if (codeErr === 'auth/operation-not-allowed') {
            setErrorMsg(t.pin.providerDisabled);
            setPin('');
          } else {
            setErrorMsg(t.pin.wrongCode);
            setPin('');
          }
        }
      } else {
        try {
          await signInWithEmailAndPassword(auth, ADMIN_EMAIL, code + PASSCODE_SUFFIX);
          localStorage.removeItem(ATTEMPTS_KEY);
          localStorage.removeItem(LOCK_KEY);
          setPin('');
          onSuccess();
        } catch (err: unknown) {
          const codeErr = (err as { code?: string })?.code || '';
          setPin('');
          if (codeErr === 'auth/operation-not-allowed') {
            setErrorMsg(t.pin.providerDisabled);
          } else if (codeErr === 'auth/too-many-requests') {
            const until = Date.now() + LOCK_DURATION_MS;
            localStorage.setItem(LOCK_KEY, String(until));
            setLockUntil(until);
            setNow(Date.now());
            setErrorMsg(t.pin.locked);
          } else {
            recordFailedAttempt();
          }
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDigit = (digit: string) => {
    if (isLocked || submitting || pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      void submitPin(next);
    }
  };

  const handleBackspace = () => {
    if (isLocked || submitting) return;
    setPin((prev) => prev.slice(0, -1));
  };

  if (!open) return null;

  const mins = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const secs = String(remainingSec % 60).padStart(2, '0');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs bg-white rounded-3xl p-6 border border-black/10 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
        dir="ltr"
      >
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-full bg-[#F2F2F2] flex items-center justify-center">
            <Lock className="w-4 h-4 text-[#0D0D0D]" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[#F2F2F2] flex items-center justify-center cursor-pointer"
            aria-label={t.pin.cancel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-display text-base font-bold text-[#0D0D0D]">
            {isSetupMode ? t.pin.setupTitle : t.pin.enterCode}
          </h3>
          {isSetupMode && (
            <p className="text-xs text-zinc-500">
              {setupStep === 1 ? t.pin.setupStep1 : t.pin.setupStep2}
            </p>
          )}
        </div>

        {/* 4-dot PIN indicator */}
        <div className="flex items-center justify-center gap-4 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                idx < pin.length
                  ? 'bg-[#0D0D0D] border-[#0D0D0D] scale-110'
                  : 'bg-transparent border-zinc-300'
              }`}
            />
          ))}
        </div>

        {/* Error / Lockout display */}
        {(errorMsg || isLocked) && (
          <div className="rounded-xl bg-[#E4002B]/8 border border-[#E4002B]/20 px-3 py-2 text-center text-xs font-semibold text-[#E4002B]">
            {isLocked ? (
              <div>
                <div>{t.pin.locked}</div>
                <div className="tabular-nums mt-0.5">
                  {t.pin.tryAgainIn} {mins}:{secs}
                </div>
              </div>
            ) : (
              errorMsg
            )}
          </div>
        )}

        {/* 4-digit numeric keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isLocked || submitting}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-[#F2F2F2] text-[#0D0D0D] font-display text-lg font-bold hover:bg-zinc-200 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            disabled={isLocked || submitting}
            onClick={() => setPin('')}
            className="h-14 rounded-2xl bg-white border border-black/10 text-xs font-semibold text-zinc-600 hover:bg-[#F2F2F2] active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            {t.pin.clear}
          </button>
          <button
            type="button"
            disabled={isLocked || submitting}
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-[#F2F2F2] text-[#0D0D0D] font-display text-lg font-bold hover:bg-zinc-200 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            disabled={isLocked || submitting}
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-white border border-black/10 text-[#0D0D0D] flex items-center justify-center hover:bg-[#F2F2F2] active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
