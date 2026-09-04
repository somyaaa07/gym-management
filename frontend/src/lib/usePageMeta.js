import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function usePageMeta(title, subtitle = '') {
  const { setMeta } = useOutletContext();
  useEffect(() => {
    setMeta({ title, subtitle });
  }, [title, subtitle, setMeta]);
}
