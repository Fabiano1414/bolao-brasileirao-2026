import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trophy, Users, Lock, Gift, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { usePoolsContext } from '@/context/PoolsContext';
import { useAuth } from '@/hooks/useAuth';
import type { Pool } from '@/types';

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pool: Pool) => void;
}

const steps = [
  { id: 1, title: 'Informações Básicas', icon: Trophy },
  { id: 2, title: 'Configurações', icon: Lock },
  { id: 3, title: 'Prêmio', icon: Gift },
];

export const CreatePoolModal = ({ isOpen, onClose, onSuccess }: CreatePoolModalProps) => {
  const { user } = useAuth();
  const { createPool } = usePoolsContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: true,
    prize: '',
  });

  /** Reseta o formulário ao abrir o modal para criar um novo bolão */
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', description: '', isPrivate: true, prize: '' });
      setCurrentStep(1);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const pool = await createPool({
        name: formData.name,
        description: formData.description,
        isPrivate: formData.isPrivate,
        prize: formData.prize,
        ownerId: user.id,
        owner: user,
      });
      onSuccess(pool);
      onClose();
    } catch (error) {
      console.error('Error creating pool:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.length >= 3;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Criar Novo Bolão
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex justify-center gap-4 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                  currentStep >= step.id
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                } ${currentStep === step.id ? 'scale-110' : ''}`}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div key={currentStep} className="animate-fade-in-up">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Bolão *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Bolão dos Amigos"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva seu bolão..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Bolão Privado</div>
                    <div className="text-sm text-gray-500">Apenas quem tiver o código pode entrar</div>
                  </div>
                </div>
                <Switch
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Convidar Amigos</div>
                    <div className="text-sm text-gray-500">Envie convites por email ou WhatsApp</div>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="prize">Prêmio (opcional)</Label>
                <Input
                  id="prize"
                  value={formData.prize}
                  onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                  placeholder="Ex: R$ 500,00 ou 12 cervejas"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Defina um prêmio para o vencedor do bolão. Pode ser dinheiro, uma rodada de cerveja, ou qualquer outra coisa!
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                  <Trophy className="w-5 h-5" />
                  Resumo
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Nome:</span> {formData.name}</p>
                  <p><span className="font-medium">Privacidade:</span> {formData.isPrivate ? 'Privado' : 'Público'}</p>
                  {formData.prize && <p><span className="font-medium">Prêmio:</span> {formData.prize}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handleBack}
            className="rounded-xl"
          >
            {currentStep === 1 ? 'Cancelar' : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </>
            )}
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl"
            >
              {isLoading ? 'Criando...' : 'Criar Bolão'}
              <Trophy className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
