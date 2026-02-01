import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { api, Robot } from '@/lib/api';
import { toast } from 'sonner';

interface RobotCardProps {
  robot: Robot;
  onUpdate: () => void;
}

export default function RobotCard({ robot, onUpdate }: RobotCardProps) {
  const [loading, setLoading] = useState(false);

  const handleControl = async (action: 'start' | 'stop' | 'pause') => {
    setLoading(true);
    try {
      await api.controlRobot(robot.id, action);
      toast.success(`Робот ${action === 'start' ? 'запущен' : action === 'stop' ? 'остановлен' : 'поставлен на паузу'}`);
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка управления роботом');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCleaning = async () => {
    setLoading(true);
    try {
      await api.updateRobot(robot.id, { has_cleaning: !robot.has_cleaning });
      toast.success(`Режим мойки ${!robot.has_cleaning ? 'включен' : 'выключен'}`);
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка обновления');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteRobot(robot.id);
      toast.success('Робот удален');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка удаления');
    } finally {
      setLoading(false);
    }
  };

  const getTaskDisplay = () => {
    const taskMap: Record<string, string> = {
      idle: 'Готов',
      cleaning: 'Моет окна',
      paused: 'На паузе',
    };
    return taskMap[robot.current_task] || robot.current_task;
  };

  const getTaskColor = () => {
    const colorMap: Record<string, string> = {
      idle: 'text-muted-foreground',
      cleaning: 'text-accent',
      paused: 'text-secondary',
    };
    return colorMap[robot.current_task] || 'text-muted-foreground';
  };

  return (
    <Card className="p-6 bg-card/95 backdrop-blur border-border/50 animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Icon name="Bot" size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">{robot.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{robot.model}</p>
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Icon name="Battery" size={16} className="text-primary" />
                  <span>{robot.battery_level}%</span>
                </div>
                <div className={`flex items-center gap-1 ${robot.status === 'online' ? 'text-secondary' : 'text-muted-foreground'}`}>
                  <Icon name="Wifi" size={16} />
                  <span>{robot.status === 'online' ? 'Онлайн' : 'Оффлайн'}</span>
                </div>
                <div className={`flex items-center gap-1 ${getTaskColor()}`}>
                  <Icon name="Activity" size={16} />
                  <span>{getTaskDisplay()}</span>
                </div>
              </div>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Icon name="Trash2" size={18} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить робота?</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены? Робот {robot.name} будет удален из системы.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30">
          <Label htmlFor={`cleaning-${robot.id}`} className="flex items-center gap-2 cursor-pointer">
            <Icon name="Droplet" size={18} className="text-primary" />
            <span>Режим с мойкой</span>
          </Label>
          <Switch
            id={`cleaning-${robot.id}`}
            checked={robot.has_cleaning}
            onCheckedChange={handleToggleCleaning}
            disabled={loading || robot.is_active}
          />
        </div>

        {robot.has_cleaning && (
          <div className="flex gap-2">
            {!robot.is_active ? (
              <Button
                onClick={() => handleControl('start')}
                disabled={loading || robot.status !== 'online'}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              >
                <Icon name="Play" size={18} className="mr-2" />
                Начать мойку
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => handleControl('pause')}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Icon name="Pause" size={18} className="mr-2" />
                  Пауза
                </Button>
                <Button
                  onClick={() => handleControl('stop')}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  <Icon name="Square" size={18} className="mr-2" />
                  Стоп
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
