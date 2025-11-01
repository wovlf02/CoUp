import Header from '@/components/common/Header/Header';
import Sidebar from '@/components/common/Sidebar/Sidebar';
import Footer from '@/components/common/Footer/Footer';
import LayoutProvider from '@/components/common/LayoutProvider';

export default function MainLayout({ children }) {
  return (
    <LayoutProvider>
      <div className="main-layout">
        <Header />
        <div className="content-wrapper">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </LayoutProvider>
  );
}
