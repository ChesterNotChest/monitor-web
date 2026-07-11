import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { CameraProvider } from './context/CameraContext';
import { router } from './router';

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <CameraProvider>
          <RouterProvider router={router} />
        </CameraProvider>
      </AlertProvider>
    </AuthProvider>
  );
}
