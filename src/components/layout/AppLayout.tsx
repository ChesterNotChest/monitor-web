import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';

export function AppLayout() {
  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
      <Sidebar />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <Breadcrumb />
        <main style={{flex:1,overflowY:'auto',overflowX:'hidden'}}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
