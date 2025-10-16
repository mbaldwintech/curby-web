import { LoginForm } from '@core/components';
import { login } from './actions';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm loginAction={login} />
      </div>
    </div>
  );
}
