import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Departments from './pages/Departments';
import Gallery from './pages/Gallery';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Clinic from './pages/Clinic';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/Services';
import AdminDepartments from './pages/admin/Departments';
import AdminAbout from './pages/admin/About';
import AdminGallery from './pages/admin/Gallery';
import AdminNews from './pages/admin/News';
import AdminFAQ from './pages/admin/FAQ';
import AdminContact from './pages/admin/Contact';
import AdminHomepage from './pages/admin/Homepage';
import AdminTopBar from './pages/admin/TopBar';
import AdminHeroSlides from './pages/admin/HeroSlides';
import AdminForms from './pages/admin/Forms';
import AdminPrices from './pages/admin/Prices';
import AdminAppointments from './pages/admin/Appointments';
import AdminSecurityLogs from './pages/admin/SecurityLogs';
import AdminSpecialistDoctors from './pages/admin/SpecialistDoctors';
import AdminLogin from './pages/admin/Login';
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="departments" element={<Departments />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetail />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="contact" element={<Contact />} />
          <Route path="clinic" element={<Clinic />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="faq" element={<AdminFAQ />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="homepage" element={<AdminHomepage />} />
          <Route path="hero-slides" element={<AdminHeroSlides />} />
          <Route path="top-bar" element={<AdminTopBar />} />
          <Route path="forms" element={<AdminForms />} />
          <Route path="prices" element={<AdminPrices />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="security" element={<AdminSecurityLogs />} />
          <Route path="specialist-doctors" element={<AdminSpecialistDoctors />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
