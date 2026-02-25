import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Trophy, Users, ArrowRight, Sparkles, Eye, EyeOff, Camera, KeyRound, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { disableFirebaseAndReload, enableFirebaseAndReload, isFirebaseManuallyDisabled } from '@/lib/firebase';
import { usePoolsContext } from '@/context/PoolsContext';
import { fileToAvatarDataUrl } from '@/lib/avatarUpload';
import { loginSchema, registerSchema, resetPasswordSchema, resetPasswordEmailOnlySchema, type LoginFormData, type RegisterFormData, type ResetPasswordFormData } from '@/lib/validation';

interface HeroProps {
  onCreatePool: () => void;
  onViewPools?: () => void;
  onViewAdmin?: () => void;
}

export const Hero = ({ onCreatePool, onViewPools, onViewAdmin }: HeroProps) => {
  const { user, login, register, resetPassword, isAdmin, useFirebase } = useAuth();
  const { pools } = usePoolsContext();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [registerPhoto, setRegisterPhoto] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const resetForm = useForm({
    resolver: zodResolver(useFirebase ? resetPasswordEmailOnlySchema : resetPasswordSchema),
    defaultValues: { email: '', newPassword: '', confirmPassword: '' },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoginLoading(true);
    const result = await login(data.email, data.password);
    setIsLoginLoading(false);
    if (result === 'ok') {
      toast.success('Login feito!', { description: 'Bem-vindo de volta.' });
    } else if (result === 'not_found') {
      toast.error('Email não cadastrado', { description: 'Crie uma conta primeiro para entrar.' });
    } else if (result === 'wrong_password') {
      const lastErr = import.meta.env.DEV && (window as { __lastAuthError?: string }).__lastAuthError;
      toast.error('Email ou senha incorretos', {
        description: lastErr
          ? `Detalhe: ${lastErr}. Verifique os dados ou use "Esqueci minha senha".`
          : 'Verifique os dados. Se esqueceu a senha, clique abaixo para redefinir.',
        action: {
          label: 'Esqueci minha senha',
          onClick: () => {
            setShowResetForm(true);
            resetForm.setValue('email', data.email);
          },
        },
      });
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsResetLoading(true);
    const result = await resetPassword(data.email, data.newPassword);
    setIsResetLoading(false);
    if (result === 'ok') {
      toast.success('Senha alterada!', { description: 'Faça login com sua nova senha.' });
      setShowResetForm(false);
      resetForm.reset();
    } else if (result === 'email_sent') {
      toast.success('Email enviado!', { description: 'Verifique a caixa de entrada e a pasta de spam. O link expira em 1 hora.' });
      setShowResetForm(false);
      resetForm.reset();
    } else if (result === 'error') {
      toast.error('Erro ao enviar email', {
        description: 'Tente novamente. Se persistir, verifique o Console (F12) e a configuração do Firebase.',
      });
    } else {
      toast.error('Email não encontrado', { description: 'Nenhuma conta com esse email. Verifique ou crie uma conta.' });
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsRegisterLoading(true);
    const result = await register(data.name, data.email, data.password, registerPhoto || undefined);
    setIsRegisterLoading(false);
    if (result === 'ok') {
      setRegisterPhoto(null);
      registerForm.reset();
      toast.success('Conta criada!', { description: 'Você já está logado. Bem-vindo!' });
    } else {
      const err = result.error;
      const rawCode = 'rawCode' in result ? result.rawCode : 'code' in result ? result.code : undefined;
      const codePrefix = rawCode ? `[${rawCode}] ` : '';
      const messages: Record<string, { title: string; description: string }> = {
        email_in_use: {
          title: 'Não foi possível criar a conta',
          description:
            rawCode === 'local_storage'
              ? `${codePrefix}Email já no sistema (modo local). Limpe F12 → Application → Local Storage ou use janela anônima.`
              : `${codePrefix}Email pode já estar cadastrado. Use outro ou faça login na aba "Entrar".`,
        },
        weak_password: {
          title: 'Senha fraca',
          description: `${codePrefix}Use pelo menos 6 caracteres.`,
        },
        invalid_email: {
          title: 'Email inválido',
          description: `${codePrefix}Verifique o formato do email.`,
        },
        operation_not_allowed: {
          title: 'Cadastro desabilitado',
          description: `${codePrefix}Habilite Firebase Console > Autenticação > Método de login > Email/Senha.`,
        },
        unknown: {
          title: 'Não foi possível criar a conta',
          description: `${codePrefix || `[${rawCode ?? 'unknown'}] `}Verifique a configuração do Firebase.`,
        },
      };
      const { title, description } = messages[err] ?? messages.unknown;
      toast.error(title, { description });
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setRegisterPhoto(dataUrl);
    } catch {
      setRegisterPhoto(null);
    }
    e.target.value = '';
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1920&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1D24]/95 via-[#1A1D24]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1D24] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div className="animate-fade-in-up">
            <div
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm mb-6 animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Temporada 2026 do Brasileirão</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight mb-6 animate-fade-in-up"
              style={{ fontFamily: 'Exo, sans-serif', animationDelay: '0.2s' }}
            >
              Crie seu{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C853] to-[#2962FF]">
                Bolão
              </span>
              <br />
              e Domine o
              <br />
              Brasileirão
            </h1>

            <p
              className="text-base sm:text-xl text-gray-300 mb-8 max-w-lg animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              Desafie seus amigos, faça seus palpites e veja quem realmente entende de futebol.
            </p>

            <div
              className="flex flex-wrap gap-4 animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              {isAdmin && onViewAdmin && (
                <Button
                  onClick={onViewAdmin}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-6 px-8 rounded-xl text-lg shadow-lg shadow-violet-500/25 transition-all hover:scale-105"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Painel Admin
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              <Button
                onClick={onCreatePool}
                className="bg-gradient-to-r from-[#00C853] to-[#00A843] hover:from-[#00B34A] hover:to-[#00963A] text-white font-bold py-4 sm:py-6 px-6 sm:px-8 rounded-xl text-base sm:text-lg shadow-lg shadow-green-500/25 transition-all hover:scale-105"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Criar Bolão Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => onViewPools?.()}
                className="border-white/30 text-white hover:bg-white/10 font-semibold py-6 px-8 rounded-xl text-lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Ver Bolões
              </Button>
            </div>

            <div
              className="flex flex-wrap gap-6 sm:gap-8 mt-8 sm:mt-12 animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
              <div>
                <div className="text-3xl font-bold text-white">
                  {new Set(pools.flatMap(p => p.members.map(m => m.userId))).size}
                </div>
                <div className="text-sm text-gray-400">Usuários</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{pools.length}</div>
                <div className="text-sm text-gray-400">Bolões</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {pools.filter(p => p.prize?.trim()).length}
                </div>
                <div className="text-sm text-gray-400">Com Prêmio</div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Card */}
          {!user && (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl">
                {showResetForm ? (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-6">
                      <KeyRound className="w-6 h-6 text-white" />
                      <h3 className="text-xl font-bold text-white">Recuperar Senha</h3>
                    </div>
                    <Form {...resetForm}>
                      <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                        <FormField
                          control={resetForm.control}
                          name="email"
                          render={({ field }: { field: { value: string; onChange: (e: { target: { value: string } }) => void; onBlur: () => void; name: string; ref: React.Ref<HTMLInputElement> } }) => (
                            <FormItem>
                              <Label htmlFor="reset-email" className="text-white">Email</Label>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="seu@email.com"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                              </FormControl>
                              <FormMessage className="text-amber-200" />
                              {useFirebase && (
                                <p className="text-xs text-white/70 mt-1">
                                  Enviaremos um link para redefinir sua senha.
                                </p>
                              )}
                            </FormItem>
                          )}
                        />
                        {!useFirebase && (
                        <>
                        <FormField
                          control={resetForm.control}
                          name="newPassword"
                          render={({ field }: { field: { value: string; onChange: (e: { target: { value: string } }) => void; onBlur: () => void; name: string; ref: React.Ref<HTMLInputElement> } }) => (
                            <FormItem>
                              <Label htmlFor="new-password" className="text-white">Nova senha</Label>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mínimo 6 caracteres"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                  >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-amber-200" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={resetForm.control}
                          name="confirmPassword"
                          render={({ field }: { field: { value: string; onChange: (e: { target: { value: string } }) => void; onBlur: () => void; name: string; ref: React.Ref<HTMLInputElement> } }) => (
                            <FormItem>
                              <Label htmlFor="confirm-password" className="text-white">Confirmar senha</Label>
                              <FormControl>
                                <Input
                                  {...field}
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Repita a senha"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                              </FormControl>
                              <FormMessage className="text-amber-200" />
                            </FormItem>
                          )}
                        />
                        </>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => { setShowResetForm(false); resetForm.reset(); }}
                            className="text-white hover:bg-white/10"
                          >
                            Voltar
                          </Button>
                          <Button
                            type="submit"
                            disabled={isResetLoading}
                            className="flex-1 bg-gradient-to-r from-[#2962FF] to-[#00C853] hover:from-[#1E52E0] hover:to-[#00B34A] text-white font-bold py-3 rounded-xl"
                          >
                            {isResetLoading ? (useFirebase ? 'Enviando...' : 'Alterando...') : (useFirebase ? 'Enviar link' : 'Alterar senha')}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                ) : (
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10">
                    <TabsTrigger value="login" className="text-white data-[state=active]:bg-white data-[state=active]:text-gray-900">
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger value="register" className="text-white data-[state=active]:bg-white data-[state=active]:text-gray-900">
                      Criar Conta
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }: { field: { value: string; onChange: (e: { target: { value: string } }) => void; onBlur: () => void; name: string; ref: React.Ref<HTMLInputElement> } }) => (
                            <FormItem>
                              <Label htmlFor="email" className="text-white">Email</Label>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="seu@email.com"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                              </FormControl>
                              <FormMessage className="text-amber-200" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }: { field: { value: string; onChange: (e: { target: { value: string } }) => void; onBlur: () => void; name: string; ref: React.Ref<HTMLInputElement> } }) => (
                            <FormItem>
                              <Label htmlFor="password" className="text-white">Senha</Label>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                  >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-amber-200" />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          disabled={isLoginLoading}
                          className="w-full bg-gradient-to-r from-[#2962FF] to-[#00C853] hover:from-[#1E52E0] hover:to-[#00B34A] text-white font-bold py-3 rounded-xl"
                        >
                          {isLoginLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                        <button
                          type="button"
                          onClick={() => setShowResetForm(true)}
                          className="w-full text-sm text-white/80 hover:text-white underline text-center py-1"
                        >
                          Esqueci minha senha
                        </button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                        <div className="flex flex-col items-center gap-2">
                          <Label className="text-white">Foto de perfil</Label>
                          <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="relative group"
                          >
                            <UserAvatar
                              name={registerForm.watch('name') || 'Você'}
                              avatar={registerPhoto || undefined}
                              className="w-20 h-20 border-4 border-white/30"
                              fallbackClassName="text-2xl"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-8 h-8 text-white" />
                            </span>
                          </button>
                          <p className="text-xs text-white/70">
                            Toque para escolher foto da galeria (opcional)
                          </p>
                        </div>
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }: { field: { value: string; onChange: (e: { target: { value: string } }) => void; onBlur: () => void; name: string; ref: React.Ref<HTMLInputElement> } }) => (
                            <FormItem>
                              <Label htmlFor="name" className="text-white">Nome</Label>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="text"
                                  placeholder="Seu nome completo"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                              </FormControl>
                              <FormMessage className="text-amber-200" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }: { field: { value: string; onChange: (e: { target: { value: string } }) => void; onBlur: () => void; name: string; ref: React.Ref<HTMLInputElement> } }) => (
                            <FormItem>
                              <Label htmlFor="register-email" className="text-white">Email</Label>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="seu@email.com"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                />
                              </FormControl>
                              <FormMessage className="text-amber-200" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }: { field: { value: string; onChange: (e: { target: { value: string } }) => void; onBlur: () => void; name: string; ref: React.Ref<HTMLInputElement> } }) => (
                            <FormItem>
                              <Label htmlFor="register-password" className="text-white">Senha</Label>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                  >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-amber-200" />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          disabled={isRegisterLoading}
                          className="w-full bg-gradient-to-r from-[#00C853] to-[#2962FF] hover:from-[#00B34A] hover:to-[#1E52E0] text-white font-bold py-3 rounded-xl"
                        >
                          {isRegisterLoading ? 'Criando conta...' : 'Criar Conta'}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
                )}
                {useFirebase && (
                  <button
                    type="button"
                    onClick={disableFirebaseAndReload}
                    className="mt-4 w-full text-xs text-white/60 hover:text-amber-300 underline"
                  >
                    Firebase com problemas? Usar modo local (sem internet)
                  </button>
                )}
                {!useFirebase && isFirebaseManuallyDisabled() && (
                  <button
                    type="button"
                    onClick={enableFirebaseAndReload}
                    className="mt-4 w-full text-xs text-white/60 hover:text-green-300 underline"
                  >
                    Reativar Firebase (voltar a usar autenticação online)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
