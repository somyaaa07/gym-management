import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
}) {
  return (
    <Modal open={open} onClose={onClose} title="" width="max-w-sm">
      <div className="flex flex-col items-start gap-3 -mt-2">
        <div className="rounded-full bg-ember-500/10 p-2.5">
          <AlertTriangle size={20} className="text-ember-500" />
        </div>
        <h3 className="font-display text-2xl text-bone-100 leading-none">{title}</h3>
        {description && <p className="text-sm text-ink-400">{description}</p>}
        <div className="flex gap-2 mt-3 w-full">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1 !border-ember-500 hover:!bg-ember-500 hover:!text-ink-900">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
