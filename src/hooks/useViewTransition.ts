import { useNavigate } from 'react-router-dom';
export function useViewTransition() {
  const navigate = useNavigate();
  return (to: string) => {
    // @ts-expect-error View Transition API
    if (document.startViewTransition) {
      // @ts-expect-error View Transition API
      document.startViewTransition(() => navigate(to));
    } else {
      navigate(to);
    }
  };
}
