import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import {} from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import AboutUs from '../src/views/admin/default/components/tempAbout';
import ContactUs from './views/admin/default/components/tempContact';
import MissionandVision from './views/admin/default/components/Mision';
import Highlights from './views/admin/default/components/Highlight';
import RTLLayout from './layouts/rtl';
import {
  ChakraProvider,
  // extendTheme
} from '@chakra-ui/react';
import initialTheme from './theme/theme'; //  { themeGreen }
import { useState } from 'react';
import Mission from './views/admin/default/components/Mision';
// Chakra imports

export default function Main() {
  // eslint-disable-next-line
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  return (
    <ChakraProvider theme={currentTheme}>
      <Routes>
        <Route path="auth/*" element={<AuthLayout />} />
        <Route
          path="admin/*"
          element={
            <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
          }
        />
        <Route
          path="admin/aboutUs*"
          element={
            <AboutUs theme={currentTheme} setCurrentTheme={setCurrentTheme} />
          }
        />
        <Route path="admin/Highlights" element={<Highlights theme={currentTheme} setCurrentTheme={setCurrentTheme} />} />

        <Route
          path="admin/MissionandVission*"
          element={
            <Mission theme={currentTheme} setCurrentTheme={setCurrentTheme} />
          }
        />
        <Route path="admin/contactUs" element={<ContactUs />} />

        <Route
          path="rtl/*"
          element={
            <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
          }
        />
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </ChakraProvider>
  );
}
