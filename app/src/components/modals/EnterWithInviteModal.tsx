import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link2 } from 'lucide-react';
import { toast } from 'sonner';

interface EnterWithInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnter: (poolId: string, code?: string) => boolean;
}

/** Extrai pool e code de URL ou string (ex: ?pool=123&code=ABC ou https://...?pool=123&code=ABC) */
function parseInviteInput(input: string): { poolId: string; code?: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    let query = trimmed;
    if (trimmed.includes('?')) {
      query = trimmed.slice(trimmed.indexOf('?') + 1);
    } else if (!trimmed.includes('pool=')) {
      return null;
    }
    const params = new URLSearchParams(query);
    const poolId = params.get('pool');
    if (!poolId) return null;
    return { poolId, code: params.get('code') ?? undefined };
  } catch {
    return null;
  }
}

export function EnterWithInviteModal({
  isOpen,
  onClose,
  onEnter,
}: EnterWithInviteModalProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInviteInput(input);
    if (!parsed) {
      toast.error('Link inválido', {
        description: 'Cole o link completo de convite que você recebeu.',
      });
      return;
    }
    const ok = onEnter(parsed.poolId, parsed.code);
    if (ok) {
      setInput('');
      onClose();
    } else {
      toast.info('Carregando bolão...', {
        description: 'O bolão será aberto assim que estiver disponível.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Entrar com convite
          </DialogTitle>
          <DialogDescription>
            Cole o link de convite que você recebeu para acessar o bolão.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="invite-link">Link de convite</Label>
            <Input
              id="invite-link"
              placeholder="https://...?pool=123&code=ABC ou cole apenas ?pool=123&code=ABC"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-500">
              Entrar no bolão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
