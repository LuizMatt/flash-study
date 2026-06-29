import { FieldProps } from './components/field';
import AuthForm from './components/form';

const inputs: FieldProps[] = [
  {
    id: 'email',
    label: 'Email',
    placeholder: 'joão@gmail.com',
  },
  {
    id: 'password',
    label: 'Senha',
    placeholder: '******',
  },
];

export default function LoginPage() {
  return <AuthForm inputs={inputs} type="login" />;
}