"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EthicsGateModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EthicsGateModal({ open, onConfirm, onCancel }: EthicsGateModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 mb-3">
          <ShieldAlert className="h-5 w-5" />
          <h2 className="font-semibold">Ethics & safety check</h2>
        </div>
        <ul className="text-sm text-muted space-y-2 mb-4 list-disc list-inside">
          <li>Do I have permission to use this data or URL?</li>
          <li>Am I avoiding personal or sensitive information (PII)?</li>
        </ul>
        <p className="text-xs text-muted mb-4">
          PyForge encourages responsible data science. Only run code on data you are allowed to process.
        </p>
        <div className="flex gap-2">
          <Button variant="accent" size="sm" className="flex-1" onClick={onConfirm}>
            I confirm — run code
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
