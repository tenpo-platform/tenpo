"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Featured camps with richer data
const featuredCamps = [
  {
    id: 1,
    title: "Elite Soccer Academy Summer Camp",
    academy: "Austin Youth Soccer",
    sport: "Soccer",
    location: "Austin, TX",
    ageRange: "8-14",
    dates: "Jun 15 - Jun 19",
    price: 299,
    originalPrice: 349,
    rating: 4.9,
    reviews: 127,
    spotsLeft: 3,
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80",
    tags: ["Popular", "Almost Full"],
    verified: true,
  },
  {
    id: 2,
    title: "Championship Basketball Skills",
    academy: "Dallas Hoops",
    sport: "Basketball",
    location: "Dallas, TX",
    ageRange: "10-16",
    dates: "Jul 8 - Jul 12",
    price: 249,
    rating: 4.8,
    reviews: 89,
    spotsLeft: 8,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    tags: ["New"],
    verified: true,
  },
  {
    id: 3,
    title: "Junior Tennis Champions",
    academy: "Houston Tennis Club",
    sport: "Tennis",
    location: "Houston, TX",
    ageRange: "6-12",
    dates: "Jun 22 - Jun 26",
    price: 199,
    rating: 4.7,
    reviews: 64,
    spotsLeft: 12,
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
    tags: [],
    verified: true,
  },
  {
    id: 4,
    title: "Swim Like a Pro",
    academy: "Aquatic Excellence",
    sport: "Swimming",
    location: "San Antonio, TX",
    ageRange: "5-14",
    dates: "Jul 1 - Jul 5",
    price: 179,
    rating: 4.9,
    reviews: 203,
    spotsLeft: 5,
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    tags: ["Top Rated"],
    verified: true,
  },
]

// Parent stories (more emotional than testimonials)
const parentStories = [
  {
    id: 1,
    quote: "My shy 8-year-old came home from soccer camp with three new best friends and couldn't stop talking about what he learned. That's when I knew we made the right choice.",
    author: "Sarah M.",
    role: "Mom of Jake, 8",
    childImage: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&q=80",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    sport: "Soccer",
    transformation: "Shy → Confident",
  },
  {
    id: 2,
    quote: "Finding camps used to mean endless Google searches and phone calls. Now I discover, compare, and book in one place. It's changed how we plan our summers.",
    author: "Michael T.",
    role: "Dad of twins, 11",
    childImage: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&q=80",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    sport: "Basketball",
    transformation: "Stressed → Organized",
  },
  {
    id: 3,
    quote: "Coach Martinez saw something special in Emma. She went from barely making the school team to MVP. These camps connect young athletes with coaches who truly invest in them.",
    author: "Lisa R.",
    role: "Mom of Emma, 14",
    childImage: "https://images.unsplash.com/photo-1529898329745-e6e0b08c0c16?w=400&q=80",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    sport: "Volleyball",
    transformation: "Beginner → MVP",
  },
]

// Stats that animate
const impactStats = [
  { value: 10247, label: "Athletes trained", suffix: "" },
  { value: 98, label: "Parent satisfaction", suffix: "%" },
  { value: 500, label: "Verified camps", suffix: "+" },
  { value: 4.8, label: "Average rating", suffix: "/5" },
]

// Trust badge icons
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2"/>
      <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
  )
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  )
}

// Trust badges
const trustBadges = [
  { icon: ShieldIcon, label: "Background Checked", description: "All coaches verified" },
  { icon: CheckCircleIcon, label: "Verified Programs", description: "Quality standards met" },
  { icon: CreditCardIcon, label: "Secure Payments", description: "Protected checkout" },
  { icon: RefreshIcon, label: "Easy Refunds", description: "Flexible cancellation" },
]

// Animated stat counter component
function AnimatedStatCounter({ value, label, suffix }: { value: number; label: string; suffix: string }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const duration = 2000

  useEffect(() => {
    const currentRef = ref.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.5 }
    )

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    let animationId: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * value))
      if (progress < 1) {
        animationId = requestAnimationFrame(step)
      }
    }
    animationId = requestAnimationFrame(step)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [value, hasStarted])

  return (
    <div ref={ref} className="text-center">
      <p className="text-h3 md:text-h2 font-medium text-primary-foreground">
        {value === 4.8 ? (count / 10).toFixed(1) : count.toLocaleString()}{suffix}
      </p>
      <p className="text-body2 text-primary-foreground/80">{label}</p>
    </div>
  )
}

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

// Hero background videos
const heroVideos = [
  "/videos/athletic-training.mp4",
  "/videos/sports-montage.mp4",
  "/videos/soccer-tackle.mp4",
]

export default function SampleLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStoryIndex, setActiveStoryIndex] = useState(0)
  const [hoveredCamp, setHoveredCamp] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Scroll tracking for parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Video ended handler - cycle to next video
  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length)
  }

  // Update video source when index changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play()
    }
  }, [currentVideoIndex])

  // Auto-rotate stories
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % parentStories.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  // Section reveal animations
  const howItWorksReveal = useScrollReveal()
  const storiesReveal = useScrollReveal()
  const campsReveal = useScrollReveal()

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className={cn(
          "mx-4 mt-4 rounded-full border transition-all duration-300",
          scrollY > 100
            ? "bg-card/95 backdrop-blur-md shadow-lg border-border"
            : "bg-card/80 backdrop-blur-sm border-transparent"
        )}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-14">
              <Link href="/sample-landing" className="flex items-center">
                <Image
                  src="/images/logo/wordmark/wordmark-pitch-green.svg"
                  alt="Tenpo"
                  width={120}
                  height={38}
                  className="h-10 w-auto"
                />
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => scrollToSection("featured-camps")}
                  className="text-body2 text-foreground/70 hover:text-foreground transition-colors"
                >
                  Find Camps
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-body2 text-foreground/70 hover:text-foreground transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection("for-organizers")}
                  className="text-body2 text-foreground/70 hover:text-foreground transition-colors"
                >
                  List Your Camp
                </button>
              </nav>

              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Log In
                </Button>
                <Button size="sm" className="rounded-full">
                  Get Started
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mx-4 mt-2 bg-card rounded-2xl border shadow-xl p-4">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => scrollToSection("featured-camps")}
                className="text-body1 text-foreground/70 hover:text-foreground text-left p-3 hover:bg-muted rounded-lg transition-colors"
              >
                Find Camps
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-body1 text-foreground/70 hover:text-foreground text-left p-3 hover:bg-muted rounded-lg transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("for-organizers")}
                className="text-body1 text-foreground/70 hover:text-foreground text-left p-3 hover:bg-muted rounded-lg transition-colors"
              >
                List Your Camp
              </button>
              <div className="flex gap-2 pt-2 border-t mt-2">
                <Button variant="secondary" className="flex-1 rounded-full">Log In</Button>
                <Button className="flex-1 rounded-full">Get Started</Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section - Immersive Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideos[currentVideoIndex]} type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-foreground/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-12 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-lg border border-border">
            <span className="flex items-center justify-center w-5 h-5 bg-success-muted rounded-full">
              <svg className="w-3 h-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-caption font-medium text-foreground">Trusted by 10,000+ Athletes</span>
          </div>

          {/* Animated headline */}
          <h1 className="text-h3 sm:text-h2 md:text-h1 font-medium text-background mb-6 leading-tight drop-shadow-lg">
            Every{" "}
            <span className="relative inline-block font-display text-secondary">
              Champion
              <svg className="absolute -bottom-1 left-0 w-full h-3 text-secondary" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,8 Q50,0 100,8 T200,8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>
            <br />
            starts somewhere
          </h1>

          <p className="text-body1 md:text-subtitle1 text-background/90 mb-10 max-w-2xl mx-auto drop-shadow-md">
            The easiest way to find, compare, and book youth sports camps.
            From soccer to swimming, discover programs that spark joy and build confidence.
          </p>

          {/* Search Box */}
          <div className="bg-card rounded-2xl shadow-2xl p-3 md:p-4 max-w-2xl mx-auto border border-border">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  placeholder="Soccer camps for 12-year-olds in Los Angeles"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-0 bg-muted/50 focus:bg-card transition-colors text-body1 w-full"
                />
              </div>
              <Button size="lg" className="h-12 px-6 rounded-xl">
                Search
              </Button>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
              <span className="text-caption text-foreground/50">Popular:</span>
              {["Summer Camps", "Soccer", "Basketball", "Swimming", "This Weekend"].map((tag) => (
                <button
                  key={tag}
                  className="text-caption px-3 py-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-caption text-background/80 drop-shadow-sm">
                <badge.icon className="w-4 h-4" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="flex flex-col items-center gap-2 text-background/70 hover:text-background transition-colors"
          >
            <span className="text-caption drop-shadow-sm">Explore</span>
            <svg className="w-5 h-5 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </section>

      {/* Impact Stats - Animated */}
      <section className="py-16 bg-primary relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-background rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-background rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat) => (
              <AnimatedStatCounter
                key={stat.label}
                value={stat.value === 4.8 ? 48 : stat.value}
                label={stat.label}
                suffix={stat.suffix}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Visual Steps */}
      <section
        id="how-it-works"
        ref={howItWorksReveal.ref}
        className="py-16 md:py-24 bg-background"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-h4 md:text-h3 text-foreground mb-4">
              From search to <span className="font-display text-primary">see you there</span>
            </h2>
            <p className="text-body1 text-foreground/70 max-w-2xl mx-auto">
              Finding the right camp shouldn&apos;t feel like a second job. Here&apos;s how easy it is.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: 1,
                title: "Find the right fit",
                description: "See exactly what your athlete gets—photos, schedules, coach bios, and honest reviews from other parents.",
                visual: (
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <div className="flex gap-2 mb-3">
                      <div className="h-8 bg-card rounded-lg flex-1 shadow-sm" />
                      <div className="h-8 w-24 bg-primary/10 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 bg-card rounded-lg shadow-sm" />
                      <div className="h-16 bg-card rounded-lg shadow-sm" />
                      <div className="h-16 bg-card rounded-lg shadow-sm" />
                    </div>
                  </div>
                ),
              },
              {
                step: 2,
                title: "Feel confident choosing",
                description: "Every camp is verified. Compare options side-by-side and know you're picking a winner.",
                visual: (
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg" />
                        <div className="flex-1">
                          <div className="h-3 bg-card rounded w-3/4 mb-1" />
                          <div className="h-2 bg-warning/30 rounded w-16" />
                        </div>
                        <div className="text-warning text-lg">★★★★★</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-success/10 rounded-lg" />
                        <div className="flex-1">
                          <div className="h-3 bg-card rounded w-2/3 mb-1" />
                          <div className="h-2 bg-warning/30 rounded w-14" />
                        </div>
                        <div className="text-warning text-lg">★★★★☆</div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                step: 3,
                title: "You're all set",
                description: "Book in seconds, get instant confirmation, and show up ready to play.",
                visual: (
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center h-24">
                      <div className="relative">
                        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
            /* eslint-disable-next-line react-hooks/refs */
            ].map((item, index) => (
              <div
                key={item.step}
                className={cn(
                  "text-center transition-all duration-700",
                  howItWorksReveal.isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {item.visual}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-body1 font-medium mb-4">
                  {item.step}
                </div>
                <h3 className="text-h6 font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-body2 text-foreground/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Camps - Interactive Cards */}
      <section
        id="featured-camps"
        ref={campsReveal.ref}
        className="py-16 md:py-24 bg-muted/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-warning/10 text-warning-foreground rounded-full px-3 py-1 text-caption font-medium mb-4">
                <span className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                Filling up fast
              </div>
              <h2 className="text-h4 md:text-h3 text-foreground mb-2">
                <span className="font-display">Popular</span> This Summer
              </h2>
              <p className="text-body1 text-foreground/70">
                Top-rated camps families are booking right now
              </p>
            </div>
            <Button variant="secondary" className="mt-4 md:mt-0 rounded-full">
              View All Camps →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* eslint-disable-next-line react-hooks/refs */}
            {featuredCamps.map((camp, index) => (
              <Card
                key={camp.id}
                className={cn(
                  "overflow-hidden cursor-pointer transition-all duration-300 border-0 shadow-sm",
                  hoveredCamp === camp.id ? "shadow-xl -translate-y-2" : "hover:shadow-md",
                  campsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredCamp(camp.id)}
                onMouseLeave={() => setHoveredCamp(null)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={camp.image}
                    alt={camp.title}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-500",
                      hoveredCamp === camp.id && "scale-110"
                    )}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {camp.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "text-caption font-medium px-2 py-1 rounded-full",
                          tag === "Popular" && "bg-primary text-primary-foreground",
                          tag === "Almost Full" && "bg-error text-error-foreground",
                          tag === "New" && "bg-info text-info-foreground",
                          tag === "Top Rated" && "bg-warning text-background"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Verified badge */}
                  {camp.verified && (
                    <div className="absolute top-3 right-3 w-7 h-7 bg-card rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Bottom info on image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-caption text-background/80">{camp.dates}</p>
                    <p className="text-body2 text-background font-medium">{camp.location}</p>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-body1 font-medium text-foreground line-clamp-1">{camp.title}</h3>
                      <p className="text-caption text-foreground/60">{camp.academy}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-body2 font-medium">{camp.rating}</span>
                      <span className="text-caption text-foreground/60">({camp.reviews})</span>
                    </div>
                    <span className="text-foreground/30">•</span>
                    <span className="text-caption text-foreground/60">Ages {camp.ageRange}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-h6 font-medium text-primary">${camp.price}</span>
                      {camp.originalPrice && (
                        <span className="text-caption text-foreground/40 line-through">${camp.originalPrice}</span>
                      )}
                    </div>
                    {camp.spotsLeft <= 5 && (
                      <span className="text-caption text-error font-medium">
                        {camp.spotsLeft} spots left
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Parent Stories - Emotional Section */}
      <section
        ref={storiesReveal.ref}
        className="py-16 md:py-24 bg-card overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h4 md:text-h3 text-foreground mb-4">
              Real Stories, <span className="font-display text-primary">Real Transformations</span>
            </h2>
            <p className="text-body1 text-foreground/70 max-w-2xl mx-auto">
              See how Tenpo camps are helping young athletes build confidence, skills, and friendships
            </p>
          </div>

          <div className="relative">
            {/* Story Cards */}
            <div className="flex gap-6 overflow-hidden">
              {parentStories.map((story, index) => (
                <div
                  key={story.id}
                  className={cn(
                    "flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] transition-all duration-500",
                    activeStoryIndex === index ? "opacity-100 scale-100" : "opacity-50 scale-95"
                  )}
                >
                  <Card className="h-full bg-gradient-to-br from-secondary/30 to-tertiary/30 border-0">
                    <CardContent className="p-6 md:p-8">
                      {/* Transformation badge */}
                      <div className="inline-flex items-center gap-2 bg-card rounded-full px-3 py-1 text-caption font-medium mb-6 shadow-sm">
                        <span className="text-foreground/60">{story.transformation.split(" → ")[0]}</span>
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="text-primary font-semibold">{story.transformation.split(" → ")[1]}</span>
                      </div>

                      {/* Quote */}
                      <blockquote className="text-body1 text-foreground mb-6 leading-relaxed">
                        &ldquo;{story.quote}&rdquo;
                      </blockquote>

                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-card">
                          <Image
                            src={story.avatar}
                            alt={story.author}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-body2 font-medium text-foreground">{story.author}</p>
                          <p className="text-caption text-foreground/60">{story.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-8">
              {parentStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStoryIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    activeStoryIndex === index
                      ? "w-8 bg-primary"
                      : "bg-foreground/20 hover:bg-foreground/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Organizers - Bold Section */}
      <section id="for-organizers" className="py-16 md:py-24 bg-accent text-accent-foreground relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-background/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-background/10 rounded-full px-3 py-1 text-caption font-medium mb-6">
                <span>For Coaches & Academies</span>
              </div>
              <h2 className="text-h4 md:text-h3 mb-6">
                Fill your camps <span className="font-display text-secondary">faster.</span><br/>
                Spend less time on admin.
              </h2>
              <p className="text-body1 text-accent-foreground/80 mb-8">
                Join 200+ coaches and academies reaching more families through Tenpo.
                Handle registrations, payments, and communications in one place.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: "2x", label: "Average registration increase" },
                  { value: "5hrs", label: "Admin time saved weekly" },
                  { value: "0%", label: "Payment processing fees*" },
                  { value: "24hr", label: "Average listing approval" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-background/10 rounded-xl p-4">
                    <p className="text-h5 font-medium text-secondary">{stat.value}</p>
                    <p className="text-caption text-accent-foreground/70">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" size="lg" className="rounded-full">
                  List Your Camp Free
                </Button>
                <Button variant="ghost" size="lg" className="rounded-full text-accent-foreground border border-accent-foreground/20 hover:bg-background/10">
                  See How It Works
                </Button>
              </div>

              <p className="text-caption text-accent-foreground/50 mt-4">
                *For the first year. No setup fees, no contracts.
              </p>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80"
                  alt="Coach training athletes"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-2xl p-5 max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-body2 font-medium text-foreground">Registration up 156%</p>
                    <p className="text-caption text-foreground/60">Austin Youth Soccer</p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-card" />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-caption font-medium flex items-center justify-center border-2 border-card">
                    +47
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Clean & Focused */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-secondary/50 via-background to-tertiary/50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-h4 md:text-h2 text-foreground mb-6">
            Summer camps are filling up.
            <br />
            <span className="text-primary font-display">Don&apos;t miss out.</span>
          </h2>
          <p className="text-body1 md:text-subtitle1 text-foreground/70 mb-10 max-w-xl mx-auto">
            Join 10,000+ families who&apos;ve found the perfect sports camp for their athletes.
            Start exploring today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full px-8 text-body1">
              Find Camps Near Me
            </Button>
            <Button variant="secondary" size="lg" className="rounded-full px-8 text-body1">
              Create Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Image
                src="/images/logo/wordmark/wordmark-chalk.svg"
                alt="Tenpo"
                width={130}
                height={42}
                className="h-11 w-auto mb-4"
              />
              <p className="text-body2 text-background/70 mb-6 max-w-xs">
                The easiest way to find, compare, and book youth sports camps.
              </p>
              <div className="flex gap-3">
                {["twitter", "instagram", "facebook"].map((social) => (
                  <Link
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-background/60 rounded" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-body2 font-medium mb-4">For Families</h4>
              <ul className="space-y-3 text-body2 text-background/70">
                <li><Link href="#" className="hover:text-background transition-colors">Browse Camps</Link></li>
                <li><Link href="#" className="hover:text-background transition-colors">How It Works</Link></li>
                <li><Link href="#" className="hover:text-background transition-colors">Reviews</Link></li>
                <li><Link href="#" className="hover:text-background transition-colors">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-body2 font-medium mb-4">For Organizers</h4>
              <ul className="space-y-3 text-body2 text-background/70">
                <li><Link href="#" className="hover:text-background transition-colors">List Your Camp</Link></li>
                <li><Link href="#" className="hover:text-background transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-background transition-colors">Resources</Link></li>
                <li><Link href="#" className="hover:text-background transition-colors">Success Stories</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-body2 font-medium mb-4">Company</h4>
              <ul className="space-y-3 text-body2 text-background/70">
                <li><Link href="#" className="hover:text-background transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-background transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-background transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-background transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-caption text-background/50">
              © {new Date().getFullYear()} Tenpo. All rights reserved.
            </p>
            <p className="text-caption text-background/50">
              Made with ❤️ in Austin, Texas
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
