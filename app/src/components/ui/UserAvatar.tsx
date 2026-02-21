import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarGradient, getInitials } from '@/lib/avatarStyles';

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  className?: string;
  fallbackClassName?: string;
}

/** Avatar estilo Instagram: foto real ou iniciais em gradiente quando não há foto */
export function UserAvatar({ name, avatar, className, fallbackClassName }: UserAvatarProps) {
  const gradient = getAvatarGradient(name);
  const initials = getInitials(name);

  return (
    <Avatar className={className}>
      <AvatarImage src={avatar || undefined} alt={name} />
      <AvatarFallback
        className={`bg-gradient-to-br ${gradient} text-white font-semibold ${fallbackClassName || ''}`}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
