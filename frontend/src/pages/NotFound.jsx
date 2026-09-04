import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink-900 text-center px-6">
      <p className="font-display text-8xl text-volt-500 leading-none">404</p>
      <h1 className="font-display text-3xl text-bone-100 mt-2 mb-2">Off the map</h1>
      <p className="text-sm text-ink-400 mb-6 max-w-xs">This page doesn't exist, or you don't have access to it.</p>
      <Link to="/">
        <Button>Back home</Button>
      </Link>
    </div>
  );
}
