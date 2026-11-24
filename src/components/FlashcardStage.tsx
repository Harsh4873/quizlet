import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface Props {
  position: number;
  total: number;
  children: ReactNode;
}

export function FlashcardStage({ position, total, children }: Props) {
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  const wasNative = useRef(false);

  useEffect(() => {
    const frame = screen.current;
    const modal = dialog.current;
    function onFullscreenChange() {
      if (document.fullscreenElement === frame) {
        wasNative.current = true;
        if (!modal?.open) void document.exitFullscreen().catch(() => {});
      } else if (wasNative.current) {
        wasNative.current = false;
        if (modal?.open) modal.close();
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    screen.current?.querySelectorAll('.flashcard-face').forEach((face) => { face.scrollTop = 0; });
    screen.current?.querySelector<HTMLButtonElement>('.flashcard')?.focus({ preventScroll: true });
  }, [expanded, position]);

  function enter() {
    dialog.current?.showModal();
    setExpanded(true);
    // The modal already fills the window if browser policy denies native fullscreen.
    const frame = screen.current;
    if (document.fullscreenEnabled && frame?.requestFullscreen) {
      void frame.requestFullscreen().then(() => {
        // Native exit can precede delivery of the first fullscreenchange event.
        wasNative.current = document.fullscreenElement === frame;
        if (!wasNative.current && dialog.current?.open) dialog.current.close();
      }).catch(() => {});
    }
  }

  function leave() {
    if (document.fullscreenElement === screen.current) void document.exitFullscreen().catch(() => {});
    dialog.current?.close();
  }

  const controls = (
    <div className="flashcard-stage-heading">
      <span className="card-counter" aria-label={`Card ${position} of ${total}`}>{position} / {total}</span>
      {expanded ? (
        <button type="button" className="chip" onClick={leave}>
          <Minimize2 size={15} aria-hidden /> Exit fullscreen
        </button>
      ) : (
        <button type="button" ref={enterButton} className="chip" onClick={enter} aria-haspopup="dialog">
          <Maximize2 size={15} aria-hidden /> Fullscreen
        </button>
      )}
    </div>
  );

  return (
    <>
      {!expanded && <>{controls}{children}</>}
      <dialog ref={dialog} className="flashcard-stage-dialog" aria-label="Fullscreen flashcards"
        onCancel={(event) => { event.preventDefault(); leave(); }}
        onClose={() => {
          setExpanded(false);
          requestAnimationFrame(() => enterButton.current?.focus({ preventScroll: true }));
        }}>
        <div ref={screen} className="flashcard-stage-expanded">
          {expanded && <>{controls}{children}</>}
        </div>
      </dialog>
    </>
  );
}
