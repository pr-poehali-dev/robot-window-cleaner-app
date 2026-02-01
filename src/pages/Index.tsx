import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

type View = 'login' | 'register' | 'home' | 'robots' | 'schedule' | 'settings';
type ConnectState = 'idle' | 'searching' | 'instructions' | 'connecting' | 'connected';

export default function Index() {
  const [view, setView] = useState<View>('login');
  const [connectState, setConnectState] = useState<ConnectState>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setView('home');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setView('home');
  };

  const handleConnectRobot = () => {
    setConnectState('searching');
    setTimeout(() => {
      setConnectState('instructions');
    }, 5000);
  };

  const handleNext = () => {
    if (connectState === 'instructions') {
      setConnectState('connecting');
      setTimeout(() => {
        setConnectState('connected');
      }, 3000);
    }
  };

  const handleDeleteAccount = () => {
    setView('login');
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
        <Card className="w-full max-w-md p-8 animate-scale-in bg-card/95 backdrop-blur border-border/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary mb-4 animate-pulse-glow">
              <Icon name="Sparkles" size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              VÖLM
            </h1>
            <p className="text-muted-foreground mt-2">Умная мойка окон</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/50"
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
              Войти
            </Button>

            <Separator className="my-6" />

            <Button
              type="button"
              variant="outline"
              className="w-full border-border/50 hover:bg-muted/50"
            >
              <Icon name="Chrome" size={20} className="mr-2" />
              Войти через Яндекс
            </Button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setView('register')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Нет аккаунта? <span className="text-primary font-semibold">Зарегистрироваться</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
        <Card className="w-full max-w-md p-8 animate-scale-in bg-card/95 backdrop-blur border-border/50">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Регистрация
            </h1>
            <p className="text-muted-foreground mt-2">Создайте аккаунт VÖLM</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  placeholder="Иван"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  placeholder="Иванов"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Дата рождения</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regEmail">Email</Label>
              <Input
                id="regEmail"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/50"
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
              Создать аккаунт
            </Button>

            <Separator className="my-6" />

            <Button
              type="button"
              variant="outline"
              className="w-full border-border/50 hover:bg-muted/50"
            >
              <Icon name="Chrome" size={20} className="mr-2" />
              Зарегистрироваться через Яндекс
            </Button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Уже есть аккаунт? <span className="text-primary font-semibold">Войти</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <nav className="bg-card/80 backdrop-blur border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon name="Sparkles" size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              VÖLM
            </h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant={view === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('home')}
              className={view === 'home' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
            >
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </Button>
            <Button
              variant={view === 'robots' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('robots')}
              className={view === 'robots' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
            >
              <Icon name="Bot" size={18} className="mr-2" />
              Роботы
            </Button>
            <Button
              variant={view === 'schedule' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('schedule')}
              className={view === 'schedule' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
            >
              <Icon name="Calendar" size={18} className="mr-2" />
              Расписание
            </Button>
            <Button
              variant={view === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('settings')}
              className={view === 'settings' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
            >
              <Icon name="Settings" size={18} className="mr-2" />
              Настройки
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'home' && (
          <div className="animate-fade-in">
            {connectState === 'idle' && (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold mb-4">Добро пожаловать!</h2>
                  <p className="text-muted-foreground text-lg">Подключите ваш первый робот</p>
                </div>
                <Button
                  size="lg"
                  onClick={handleConnectRobot}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity px-12 py-6 text-lg"
                >
                  <Icon name="Plus" size={24} className="mr-3" />
                  Подключить робота
                </Button>
              </div>
            )}

            {connectState === 'searching' && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] animate-scale-in">
                <Card className="w-full max-w-lg p-8 bg-card/95 backdrop-blur border-border/50">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary animate-pulse-glow">
                      <Icon name="Search" size={48} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Подключение робота</h2>
                    <p className="text-muted-foreground">Поиск доступных устройств...</p>
                    <Progress value={60} className="w-full" />
                  </div>
                </Card>
              </div>
            )}

            {connectState === 'instructions' && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] animate-scale-in">
                <Card className="w-full max-w-lg p-8 bg-card/95 backdrop-blur border-border/50">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary to-primary mb-4">
                        <Icon name="Wifi" size={40} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Подключение по Wi-Fi</h2>
                      <p className="text-muted-foreground">Следуйте инструкции для подключения</p>
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          1
                        </div>
                        <div>
                          <p className="font-semibold">Включите робота в розетку</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Убедитесь, что индикатор питания горит
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          2
                        </div>
                        <div>
                          <p className="font-semibold">Подождите автоматического подключения</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Робот сам появится в приложении через несколько секунд
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleNext}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                    >
                      Далее
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {connectState === 'connecting' && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] animate-scale-in">
                <Card className="w-full max-w-lg p-8 bg-card/95 backdrop-blur border-border/50">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary animate-pulse-glow">
                      <Icon name="Loader2" size={48} className="text-white animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold">Подключение...</h2>
                    <p className="text-muted-foreground">Устанавливаем соединение с роботом</p>
                    <Progress value={80} className="w-full" />
                  </div>
                </Card>
              </div>
            )}

            {connectState === 'connected' && (
              <div className="animate-fade-in space-y-6">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary mb-4 animate-pulse-glow">
                    <Icon name="Check" size={40} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Робот подключен!</h2>
                  <p className="text-muted-foreground">Теперь вы можете управлять вашим VÖLM</p>
                </div>

                <Card className="p-6 bg-card/95 backdrop-blur border-border/50">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Icon name="Bot" size={48} className="text-white" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">VÖLM Robot #1</h3>
                        <p className="text-muted-foreground">Модель: VLM-2024</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-muted/30 rounded-2xl p-4 text-center">
                          <Icon name="Battery" size={24} className="mx-auto mb-2 text-primary" />
                          <p className="text-sm text-muted-foreground mb-1">Батарея</p>
                          <p className="text-2xl font-bold">87%</p>
                        </div>

                        <div className="bg-muted/30 rounded-2xl p-4 text-center">
                          <Icon name="Wifi" size={24} className="mx-auto mb-2 text-secondary" />
                          <p className="text-sm text-muted-foreground mb-1">Статус</p>
                          <p className="text-lg font-semibold text-secondary">Онлайн</p>
                        </div>

                        <div className="bg-muted/30 rounded-2xl p-4 text-center">
                          <Icon name="Activity" size={24} className="mx-auto mb-2 text-accent" />
                          <p className="text-sm text-muted-foreground mb-1">Задача</p>
                          <p className="text-lg font-semibold">Готов</p>
                        </div>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                        <Icon name="Play" size={20} className="mr-2" />
                        Начать мойку
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {view === 'robots' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Мои роботы</h2>
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                <Icon name="Plus" size={20} className="mr-2" />
                Подключить робота
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/95 backdrop-blur border-border/50">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <Icon name="Bot" size={32} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">VÖLM Robot #1</h3>
                    <p className="text-sm text-muted-foreground mb-3">VLM-2024</p>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Icon name="Battery" size={16} className="text-primary" />
                        <span>87%</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-secondary">
                        <Icon name="Wifi" size={16} />
                        <span>Онлайн</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/95 backdrop-blur border-border/50 border-dashed opacity-50">
                <div className="flex flex-col items-center justify-center h-full text-center py-4">
                  <Icon name="Plus" size={32} className="text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Слот для второго робота</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Максимум 2 робота</p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {view === 'schedule' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-bold">Расписание</h2>
            <Card className="p-8 bg-card/95 backdrop-blur border-border/50">
              <div className="text-center py-12">
                <Icon name="Calendar" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Расписание не настроено</h3>
                <p className="text-muted-foreground mb-6">Создайте график мойки окон для вашего робота</p>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Создать расписание
                </Button>
              </div>
            </Card>
          </div>
        )}

        {view === 'settings' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-bold">Настройки</h2>
            <Card className="p-6 bg-card/95 backdrop-blur border-border/50">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Аккаунт</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Icon name="User" size={20} className="text-primary" />
                        <span>Профиль</span>
                      </div>
                      <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Icon name="Bell" size={20} className="text-secondary" />
                        <span>Уведомления</span>
                      </div>
                      <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-4 text-destructive">Опасная зона</h3>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDeleteAccount}
                  >
                    <Icon name="Trash2" size={20} className="mr-2" />
                    Удалить аккаунт
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Это действие удалит все ваши данные навсегда
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
