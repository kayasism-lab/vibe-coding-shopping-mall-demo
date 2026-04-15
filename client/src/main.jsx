import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { OrderProvider } from './context/OrderContext.jsx'
import { ProductProvider } from './context/ProductContext.jsx'
import './index.css'
import './styles/tokens.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProductProvider>
        <OrderProvider>
          <App />
        </OrderProvider>
      </ProductProvider>
    </BrowserRouter>
  </StrictMode>,
)
