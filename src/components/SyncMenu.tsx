import { useEffect, useRef, useState } from 'react';
import { Cloud, CloudAlert, CloudOff, LogOut, RefreshCw, UserRoundCog } from 'lucide-react';
import type { SyncStatus } from '../model';

interface SyncMenuProps {
  status: SyncStatus;
  onEnable: () => void;
  onSignOut: () => void;
  onSwitchAccount: () => void;
}

const SYNC_POPOVER_ID = 'sync-status-popover';

function focusableIn(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea')].filter(
    (el) => !el.hasAttribute('disabled'),
  );
}

export function SyncMenu({ status, onEnable, onSignOut, onSwitchAccount }: SyncMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const signedOutRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const focusSignedOut = useRef(false);

  const closeAndReturn = () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open) return;
    const pop = popRef.current;
    if (!pop) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!pop.isConnected) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
        return;
      }
      if ((e.key === ' ' || e.key === 'Enter') && e.target === pop) {
        e.preventDefault();
        return;
      }
      if (
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')
        && pop.contains(e.target as Node)
      ) {
        e.preventDefault();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = focusableIn(pop);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === pop || !pop.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !pop.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    pop?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (status.state === 'off' && open) setOpen(false);
  }, [status.state, open]);

  useEffect(() => {
    if (status.state !== 'off' || !focusSignedOut.current) return;
    focusSignedOut.current = false;
    signedOutRef.current?.focus({ preventScroll: true });
  }, [status.state]);

  if (status.state === 'off') {
    return (
      <button ref={signedOutRef} type="button" className="btn btn-ghost btn-sm" onClick={onEnable} title="Sign in to sync sets between devices">
        <CloudOff size={16} aria-hidden /> Sync
      </button>
    );
  }

  const icon =
    status.state === 'synced' ? (
      <Cloud size={16} aria-hidden className="sync-ok" />
    ) : status.state === 'error' ? (
      <CloudAlert size={16} aria-hidden className="sync-bad" />
    ) : (
      <Cloud size={16} aria-hidden className="sync-busy" />
    );
  const label =
    status.state === 'synced' ? 'Synced' : status.state === 'error' ? 'Sync error' : 'Syncing…';

  return (
    <div className="sync-wrap" ref={wrapRef}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? SYNC_POPOVER_ID : undefined}
        ref={triggerRef}
      >
        {icon} {label}
      </button>
      {open && (
        <div
          id={SYNC_POPOVER_ID}
          className="sync-pop fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Sync status"
          tabIndex={-1}
          ref={popRef}
        >
          {status.email && <div className="sync-email">{status.email}</div>}
          {status.state === 'error' && status.error && <p className="sync-error">{status.error}</p>}
          {status.state !== 'error' && (
            <p className="sync-note">Sets and progress sync to your private Firebase account across devices.</p>
          )}
          <div className="sync-pop-actions">
            {status.wrongAccount && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  closeAndReturn();
                  onSwitchAccount();
                }}
              >
                <UserRoundCog size={14} aria-hidden /> Switch account
              </button>
            )}
            {status.state === 'error' && !status.wrongAccount && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  closeAndReturn();
                  onEnable();
                }}
              >
                <RefreshCw size={14} aria-hidden /> Retry
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                focusSignedOut.current = true;
                setOpen(false);
                onSignOut();
              }}
            >
              <LogOut size={14} aria-hidden /> Turn off sync
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
