import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { CameraProvider } from './context/CameraContext';
import { WebRTCProvider } from './context/WebRTCContext';
import { router } from './router';

export default function App() {
  return (
    <AuthProvider>
      <WebRTCProvider>
        <AlertProvider>
          <CameraProvider>
            <RouterProvider router={router} />
          </CameraProvider>
        </AlertProvider>
      </WebRTCProvider>
    </AuthProvider>
  );
}
