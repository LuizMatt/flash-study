import { FieldProps } from './components/field';
import AuthForm from './components/form';

const inputs: FieldProps[] = [
  {
    id: 'name',
    label: 'Nome',
    placeholder: 'exemplo',
  },
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

export default function Register() {
  return <AuthForm inputs={inputs} type="register" />;
}