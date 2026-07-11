import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import PracticeAreas from '@/components/sections/PracticeAreas'
import Differentials from '@/components/sections/Differentials'
import HowItWorks from '@/components/sections/HowItWorks'
import BlogPreview from '@/components/sections/BlogPreview'
import FAQ from '@/components/sections/FAQ'
import Contact from '@/components/sections/Contact'
import CallToAction from '@/components/sections/CallToAction'
import WhatsAppFloat from '@/components/ui/WhatsAppFloat'

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <PracticeAreas />
        <Differentials />
        <HowItWorks />
        <BlogPreview />
        <FAQ />
        <CallToAction />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
