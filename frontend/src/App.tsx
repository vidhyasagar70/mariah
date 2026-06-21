import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ModalProvider } from './context/ModalContext'
import BulkPricingModal from './components/BulkPricingModal'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ProductsSection from './components/ProductsSection'
import WhyChooseSection from './components/WhyChooseSection'
import IndustriesSection from './components/IndustriesSection'
import ProcessSection from './components/ProcessSection'
import GlobalNetworkSection from './components/GlobalNetworkSection'
import DomesticSupplySection from './components/DomesticSupplySection'
import ContactSection from './components/ContactSection'
import BlogListing from './pages/BlogListing'
import BlogDetail from './pages/BlogDetail'
import AdminPortal from './pages/AdminPortal'
import FloatingActions from './components/FloatingActions'
import Footer from './components/Footer'

// ─── Landing Page (all sections) ─────────────────────────────────
function LandingPage() {
  return (
    <>
      <BulkPricingModal />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProductsSection />
        <WhyChooseSection />
        <IndustriesSection />
        <ProcessSection />
        <GlobalNetworkSection />
        <DomesticSupplySection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingActions />
    </>
  )
}

// ─── Blog + Admin wrapper (no landing sections) ───────────────────
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BulkPricingModal />
      <Navbar />
      {children}
      <Footer />
      <FloatingActions />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ModalProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/blogs" element={<PublicLayout><BlogListing /></PublicLayout>} />
          <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </ModalProvider>
    </BrowserRouter>
  )
}

export default App
