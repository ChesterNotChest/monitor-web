import { useNavigate } from 'react-router-dom';
export function useViewTransition() {
  const navigate = useNavigate();
  return (to: string) => {
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(() => navigate(to));
    } else {
      navigate(to);
    }
  };
}
