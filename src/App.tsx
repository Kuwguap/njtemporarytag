import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Index } from './pages/Index'
import { CheckoutDelivery } from './pages/CheckoutDelivery'
import { CheckoutSelect } from './pages/CheckoutSelect'
import { CheckoutSuccess } from './pages/CheckoutSuccess'
import { OrderComplete } from './pages/OrderComplete'
import { Admin } from './pages/Admin'
import { Terms } from './pages/Terms'
import { Privacy } from './pages/Privacy'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/checkout" element={<CheckoutDelivery />} />
          <Route path="/checkout/select" element={<CheckoutSelect />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/order/complete" element={<OrderComplete />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}
