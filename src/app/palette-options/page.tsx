"use client"

import Image from "next/image"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ============================================
// PALETTE CONFIGURATIONS
// ============================================

type PaletteMode = "pitch-green" | "midnight" | "carbon"

interface PaletteConfig {
  name: string
  description: string
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  accent2: string
  accent2Foreground: string
  headerLogo: string
  footerLogo: string
  headerBg: string
  headerText: string
}

const palettes: Record<PaletteMode, PaletteConfig> = {
  "pitch-green": {
    name: "Pitch Green Primary",
    description: "Default palette: Pitch Green primary, Midnight accent, Carbon accent-2",
    primary: "#043625",
    primaryForeground: "#FFFFFF",
    accent: "#0B1E3C",
    accentForeground: "#FFFFFF",
    accent2: "#392F36",
    accent2Foreground: "#FFFFFF",
    headerLogo: "/images/logo/wordmark/wordmark-chalk.svg",
    footerLogo: "/images/logo/wordmark/wordmark-pitch-green.svg",
    headerBg: "#043625",
    headerText: "#FFFFFF",
  },
  midnight: {
    name: "Midnight Primary",
    description: "Midnight primary, Pitch Green accent, Carbon accent-2",
    primary: "#0B1E3C",
    primaryForeground: "#FFFFFF",
    accent: "#043625",
    accentForeground: "#FFFFFF",
    accent2: "#392F36",
    accent2Foreground: "#FFFFFF",
    headerLogo: "/images/logo/wordmark/wordmark-chalk.svg",
    footerLogo: "/images/logo/wordmark/wordmark-midnight.svg",
    headerBg: "#0B1E3C",
    headerText: "#FFFFFF",
  },
  carbon: {
    name: "Carbon Primary",
    description: "Carbon primary, Pitch Green accent, Midnight accent-2",
    primary: "#392F36",
    primaryForeground: "#FFFFFF",
    accent: "#043625",
    accentForeground: "#FFFFFF",
    accent2: "#0B1E3C",
    accent2Foreground: "#FFFFFF",
    headerLogo: "/images/logo/wordmark/wordmark-chalk.svg",
    footerLogo: "/images/logo/wordmark/wordmark-carbon.svg",
    headerBg: "#392F36",
    headerText: "#FFFFFF",
  },
}

// ============================================
// ICONS
// ============================================

interface IconProps {
  className?: string
  style?: React.CSSProperties
}

function SearchIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14 14L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function HeartIcon({ className, style, filled }: IconProps & { filled?: boolean }) {
  return filled ? (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 17.5L8.55 16.175C4.4 12.4 1.75 10 1.75 7C1.75 4.65 3.6 2.75 5.9 2.75C7.15 2.75 8.35 3.35 9.15 4.3L10 5.3L10.85 4.3C11.65 3.35 12.85 2.75 14.1 2.75C16.4 2.75 18.25 4.65 18.25 7C18.25 10 15.6 12.4 11.45 16.175L10 17.5Z"/>
    </svg>
  ) : (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 17.5L8.55 16.175C4.4 12.4 1.75 10 1.75 7C1.75 4.65 3.6 2.75 5.9 2.75C7.15 2.75 8.35 3.35 9.15 4.3L10 5.3L10.85 4.3C11.65 3.35 12.85 2.75 14.1 2.75C16.4 2.75 18.25 4.65 18.25 7C18.25 10 15.6 12.4 11.45 16.175L10 17.5Z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function ShareIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="5" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="15" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7.5 8.75L12.5 5.25M7.5 11.25L12.5 14.75" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function MapPinIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 11C11.1046 11 12 10.1046 12 9C12 7.89543 11.1046 7 10 7C8.89543 7 8 7.89543 8 9C8 10.1046 8.89543 11 10 11Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 18C10 18 16 13 16 9C16 5.68629 13.3137 3 10 3C6.68629 3 4 5.68629 4 9C4 13 10 18 10 18Z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function CalendarIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 2V5M13 2V5M3 8H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function UsersIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 17C2 14.2386 4.23858 12 7 12C9.76142 12 12 14.2386 12 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 12C13.8 12 14.5 12.1 15.2 12.3C16.9 12.8 18 14.3 18 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function ClockIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 6V10L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function CheckIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function StarIcon({ className, style, filled }: IconProps & { filled?: boolean }) {
  return filled ? (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1L12.39 6.26L18 7.27L14 11.14L15.18 17L10 14.27L4.82 17L6 11.14L2 7.27L7.61 6.26L10 1Z"/>
    </svg>
  ) : (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1L12.39 6.26L18 7.27L14 11.14L15.18 17L10 14.27L4.82 17L6 11.14L2 7.27L7.61 6.26L10 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function ChevronLeftIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ChevronRightIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ThumbsUpIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7V14H2C1.44772 14 1 13.5523 1 13V8C1 7.44772 1.44772 7 2 7H4ZM4 7L6.5 7C7.32843 7 8 6.32843 8 5.5V3C8 2.17157 8.67157 1.5 9.5 1.5C10.3284 1.5 11 2.17157 11 3V7H13C14.1046 7 15 7.89543 15 9V12C15 13.1046 14.1046 14 13 14H6.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MenuIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function ArrowUpIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 16V4M10 4L5 9M10 4L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function VerifiedIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 1L9.5 3.5L12.5 3L11.5 6L14 8L11.5 10L12.5 13L9.5 12.5L8 15L6.5 12.5L3.5 13L4.5 10L2 8L4.5 6L3.5 3L6.5 3.5L8 1Z" fill="currentColor"/>
      <path d="M6 8L7.5 9.5L10 6.5" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ============================================
// MOCK DATA
// ============================================

const campImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=800&fit=crop", alt: "Kids playing soccer on field" },
  { id: 2, src: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1200&h=800&fit=crop", alt: "Soccer training drills" },
  { id: 3, src: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&h=800&fit=crop", alt: "Team huddle" },
  { id: 4, src: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=1200&h=800&fit=crop", alt: "Coach instruction" },
  { id: 5, src: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200&h=800&fit=crop", alt: "Soccer field facility" },
]

const coaches = [
  {
    name: "Maria Santos",
    role: "Head Coach",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    credentials: "UEFA A License, 15+ years experience",
    initials: "MS",
  },
  {
    name: "James Chen",
    role: "Assistant Coach",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    credentials: "USSF B License, Former MLS player",
    initials: "JC",
  },
]

const reviews = [
  {
    id: 1,
    author: "Sarah M.",
    avatar: "SM",
    rating: 5,
    date: "2 weeks ago",
    content: "My son had an amazing experience! The coaches were professional and really knew how to engage the kids. He learned so much in just one week.",
    helpful: 12,
  },
  {
    id: 2,
    author: "David K.",
    avatar: "DK",
    rating: 5,
    date: "1 month ago",
    content: "Excellent facilities and well-organized sessions. My daughter came home excited every day. Would definitely recommend to other parents.",
    helpful: 8,
  },
  {
    id: 3,
    author: "Jennifer L.",
    avatar: "JL",
    rating: 4,
    date: "1 month ago",
    content: "Great camp overall. The only minor issue was parking on the first day. Everything else was perfect.",
    helpful: 5,
  },
]

const faqs = [
  {
    question: "What should my child bring?",
    answer: "Please bring a water bottle, sunscreen, comfortable athletic clothing, and appropriate footwear (cleats or turf shoes). Lunch and snacks are provided for full-day camps.",
  },
  {
    question: "What is the coach-to-player ratio?",
    answer: "We maintain a maximum ratio of 1 coach per 8 players to ensure personalized attention and quality instruction for every participant.",
  },
  {
    question: "What is your refund policy?",
    answer: "Full refunds are available up to 14 days before camp starts. Within 14 days, we offer a 50% refund or credit toward a future camp. No refunds within 48 hours of start date.",
  },
  {
    question: "Are there sibling discounts?",
    answer: "Yes! We offer 10% off for the second sibling and 15% off for additional siblings registered for the same camp session.",
  },
  {
    question: "What happens in case of bad weather?",
    answer: "We have indoor facilities available as backup. If conditions are unsafe for any activities, you will be notified via email and SMS with rescheduling options.",
  },
]

const similarCamps = [
  { id: 1, name: "Soccer Elite Training", price: 349, ages: "10-14", rating: 4.9, sport: "Soccer", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=450&fit=crop" },
  { id: 2, name: "Goalkeeper Academy", price: 299, ages: "8-12", rating: 4.8, sport: "Soccer", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=450&fit=crop" },
  { id: 3, name: "Multi-Sport Summer", price: 249, ages: "6-10", rating: 4.7, sport: "Multi-Sport", image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&h=450&fit=crop" },
  { id: 4, name: "Advanced Skills Camp", price: 399, ages: "12-16", rating: 4.9, sport: "Soccer", image: "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=600&h=450&fit=crop" },
]

// ============================================
// MAIN COMPONENT
// ============================================

export default function PaletteOptionsDemo() {
  const [paletteMode, setPaletteMode] = useState<PaletteMode>("pitch-green")
  const [selectedImage, setSelectedImage] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [helpfulCounts, setHelpfulCounts] = useState<Record<number, number>>({
    1: 12,
    2: 8,
    3: 5,
  })
  const [showBackToTop, setShowBackToTop] = useState(false)
  const similarCampsRef = useRef<HTMLDivElement>(null)

  // Draggable palette switcher state
  const [dragPosition, setDragPosition] = useState({ x: 20, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const paletteRef = useRef<HTMLDivElement>(null)

  // Registration modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [registerStep, setRegisterStep] = useState<"form" | "confirmation">("form")
  const [registerForm, setRegisterForm] = useState({
    childName: "",
    childAge: "",
    parentName: "",
    email: "",
    phone: "",
    emergencyContact: "",
    medicalNotes: "",
    agreeTerms: false,
  })

  const palette = palettes[paletteMode]

  // Handle scroll for back-to-top button
  if (typeof window !== "undefined") {
    window.onscroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollSimilarCamps = (direction: "left" | "right") => {
    if (similarCampsRef.current) {
      const scrollAmount = 300
      similarCampsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleHelpful = (reviewId: number) => {
    setHelpfulCounts((prev) => ({
      ...prev,
      [reviewId]: prev[reviewId] + 1,
    }))
  }

  // Drag handlers for palette switcher
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    setDragOffset({
      x: clientX - dragPosition.x,
      y: clientY - dragPosition.y,
    })
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    setDragPosition({
      x: Math.max(0, Math.min(clientX - dragOffset.x, window.innerWidth - 200)),
      y: Math.max(0, Math.min(clientY - dragOffset.y, window.innerHeight - 100)),
    })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Registration modal handlers
  const handleOpenRegisterModal = () => {
    setRegisterStep("form")
    setIsRegisterModalOpen(true)
  }

  const handleRegisterSubmit = () => {
    // In a real app, this would submit to an API
    setRegisterStep("confirmation")
  }

  const handleCloseModal = () => {
    setIsRegisterModalOpen(false)
    // Reset form after modal closes
    setTimeout(() => {
      setRegisterStep("form")
      setRegisterForm({
        childName: "",
        childAge: "",
        parentName: "",
        email: "",
        phone: "",
        emergencyContact: "",
        medicalNotes: "",
        agreeTerms: false,
      })
    }, 300)
  }

  // CSS variables for dynamic theming
  const themeStyles = {
    "--theme-primary": palette.primary,
    "--theme-primary-foreground": palette.primaryForeground,
    "--theme-accent": palette.accent,
    "--theme-accent-foreground": palette.accentForeground,
    "--theme-accent-2": palette.accent2,
    "--theme-accent-2-foreground": palette.accent2Foreground,
  } as React.CSSProperties

  return (
    <div
      className="min-h-screen bg-background"
      style={themeStyles}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* ==================== FLOATING PALETTE SWITCHER ==================== */}
      <div
        ref={paletteRef}
        className={cn(
          "fixed z-[100] bg-card/95 backdrop-blur-sm border rounded-xl shadow-xl p-3 select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{
          left: dragPosition.x,
          top: dragPosition.y,
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center gap-2 mb-2 pb-2 border-b"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          </div>
          <p className="text-caption font-medium text-muted-foreground">Palette</p>
        </div>
        {/* Palette buttons */}
        <div className="flex flex-col gap-1.5">
          {(Object.keys(palettes) as PaletteMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setPaletteMode(mode)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-caption font-medium transition-all text-left",
                paletteMode === mode
                  ? "text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
              style={{
                backgroundColor: paletteMode === mode ? palettes[mode].primary : undefined,
              }}
            >
              <div
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: palettes[mode].primary }}
              />
              {palettes[mode].name.replace(" Primary", "")}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== HEADER ==================== */}
      <header
        className="sticky top-0 z-40 transition-colors duration-300"
        style={{ backgroundColor: palette.headerBg, color: palette.headerText }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Image
                src={palette.headerLogo}
                alt="Tenpo"
                width={120}
                height={40}
              />
              {/* Nav Links */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-body2 opacity-90 hover:opacity-100 transition-opacity">
                  Browse Camps
                </a>
                <a href="#" className="text-body2 opacity-90 hover:opacity-100 transition-opacity">
                  For Academies
                </a>
                <a href="#" className="text-body2 opacity-90 hover:opacity-100 transition-opacity">
                  For Coaches
                </a>
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="opacity-90 hover:opacity-100">
                <SearchIcon className="size-5" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="hidden sm:inline-flex"
              >
                Log In
              </Button>
              <Button
                size="sm"
                className="hidden sm:inline-flex"
                style={{ backgroundColor: palette.accent, color: palette.accentForeground }}
              >
                Sign Up
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden opacity-90 hover:opacity-100">
                <MenuIcon className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Soccer Camps</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Bay Area</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Elite Soccer Skills Camp</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* ==================== ASYMMETRIC HERO SECTION ==================== */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Image Gallery (2/3 width) */}
            <div className="lg:col-span-2">
              {/* Main Cinematic Image */}
              <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden mb-3">
                <Image
                  src={campImages[selectedImage].src}
                  alt={campImages[selectedImage].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Thumbnails - horizontal row */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {campImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden transition-all relative",
                      selectedImage === index
                        ? ""
                        : "opacity-60 hover:opacity-100"
                    )}
                    style={{
                      boxShadow: selectedImage === index ? `0 0 0 2px ${palette.primary}` : undefined,
                    }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Info Sidebar (1/3 width) */}
            <div className="lg:col-span-1 flex flex-col">
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge style={{ backgroundColor: palette.primary, color: palette.primaryForeground }}>
                  Soccer
                </Badge>
                <Badge style={{ backgroundColor: palette.accent2, color: palette.accent2Foreground }}>
                  Intermediate
                </Badge>
                <Badge variant="outline">Ages 8-12</Badge>
                <Badge
                  className="gap-1"
                  style={{ backgroundColor: palette.accent, color: palette.accentForeground }}
                >
                  <VerifiedIcon className="size-3" />
                  Verified
                </Badge>
              </div>

              {/* Bold Title */}
              <h1 className="text-h4 md:text-h3 font-semibold mb-3">Elite Soccer Skills Camp</h1>

              {/* Location & Ratings */}
              <div className="flex flex-wrap items-center gap-4 text-body2 text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="size-4" style={{ color: palette.accent }} />
                  Palo Alto, CA
                </span>
                <span className="flex items-center gap-1.5">
                  <StarIcon className="size-4 text-warning" filled />
                  4.9 (127 reviews)
                </span>
              </div>

              {/* Save/Share Actions */}
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSaved(!isSaved)}
                  className={isSaved ? "text-error" : ""}
                >
                  <HeartIcon className="size-5" filled={isSaved} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button variant="ghost" size="sm">
                  <ShareIcon className="size-5" />
                  Share
                </Button>
              </div>

              {/* Booking Card - Focal Point */}
              <Card className="shadow-lg flex-1 gap-3">
                <CardHeader className="pb-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-h3 font-semibold" style={{ color: palette.primary }}>$349</span>
                      <span className="text-body2 text-muted-foreground"> / camper</span>
                    </div>
                    <Badge variant="outline" className="text-success border-success">
                      8 spots left
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Quick Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-body2">
                      <CalendarIcon className="size-4 shrink-0" style={{ color: palette.primary }} />
                      <span>Jul 15-19, 2025</span>
                    </div>
                    <div className="flex items-center gap-3 text-body2">
                      <ClockIcon className="size-4 shrink-0" style={{ color: palette.accent }} />
                      <span>9:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex items-center gap-3 text-body2">
                      <UsersIcon className="size-4 shrink-0" style={{ color: palette.accent2 }} />
                      <span>Ages 8-12 · Max 24 campers</span>
                    </div>
                    <div className="flex items-center gap-3 text-body2">
                      <MapPinIcon className="size-4 shrink-0" style={{ color: palette.primary }} />
                      <span>Stanford Soccer Fields</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="bg-muted/50 rounded-lg p-3 text-caption">
                    <div className="flex justify-between mb-1">
                      <span>Base price</span>
                      <span>$349</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Service fee</span>
                      <span>$35</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium text-body2">
                      <span>Total</span>
                      <span>$384</span>
                    </div>
                  </div>

                  {/* High-Contrast Register Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    style={{ backgroundColor: palette.primary, color: palette.primaryForeground }}
                    onClick={handleOpenRegisterModal}
                  >
                    Register Now
                  </Button>
                  <Button variant="secondary" className="w-full">
                    Ask a Question
                  </Button>
                  <p className="text-caption text-muted-foreground text-center">
                    Free cancellation up to 14 days before
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-h5 mb-4" style={{ color: palette.primary }}>About This Camp</h2>
              <div className="prose prose-sm max-w-none text-body1 text-muted-foreground">
                <p className="mb-4">
                  Join us for an intensive week of soccer training designed to take young players to the next level.
                  Our Elite Soccer Skills Camp focuses on technical development, tactical understanding, and
                  competitive gameplay in a supportive environment.
                </p>
                <p className="mb-4">
                  Led by experienced coaches with professional backgrounds, campers will receive personalized
                  instruction tailored to their skill level. Whether your child is looking to make a competitive
                  team or simply improve their love for the game, this camp provides the perfect foundation.
                </p>
                <p>
                  Each day includes skill stations, small-sided games, scrimmages, and cool-down activities.
                  Participants are grouped by age and ability to ensure appropriate challenges and maximum growth.
                </p>
              </div>
            </section>

            <Separator />

            {/* Schedule */}
            <section>
              <h2 className="text-h5 mb-4" style={{ color: palette.primary }}>Daily Schedule</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                  <span className="text-caption font-medium w-24 shrink-0 text-center" style={{ color: palette.primary }}>9:00 AM</span>
                  <div>
                    <p className="text-body2 font-medium">Check-in & Warm-up</p>
                    <p className="text-caption text-muted-foreground">Dynamic stretching and ball work</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                  <span className="text-caption font-medium w-24 shrink-0 text-center" style={{ color: palette.accent }}>9:30 AM</span>
                  <div>
                    <p className="text-body2 font-medium">Technical Training</p>
                    <p className="text-caption text-muted-foreground">Dribbling, passing, and ball control drills</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                  <span className="text-caption font-medium w-24 shrink-0 text-center" style={{ color: palette.accent2 }}>11:00 AM</span>
                  <div>
                    <p className="text-body2 font-medium">Small-Sided Games</p>
                    <p className="text-caption text-muted-foreground">3v3 and 4v4 competitive play</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                  <span className="text-caption font-medium w-24 shrink-0 text-center" style={{ color: palette.primary }}>12:00 PM</span>
                  <div>
                    <p className="text-body2 font-medium">Lunch Break</p>
                    <p className="text-caption text-muted-foreground">Provided lunch and rest time</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                  <span className="text-caption font-medium w-24 shrink-0 text-center" style={{ color: palette.accent }}>1:00 PM</span>
                  <div>
                    <p className="text-body2 font-medium">Tactical Sessions</p>
                    <p className="text-caption text-muted-foreground">Positioning, movement, and game awareness</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                  <span className="text-caption font-medium w-24 shrink-0 text-center" style={{ color: palette.accent2 }}>2:30 PM</span>
                  <div>
                    <p className="text-body2 font-medium">Full Scrimmage</p>
                    <p className="text-caption text-muted-foreground">Full-field game to apply learned skills</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-card rounded-lg border">
                  <span className="text-caption font-medium w-24 shrink-0 text-center" style={{ color: palette.primary }}>3:45 PM</span>
                  <div>
                    <p className="text-body2 font-medium">Cool Down & Pickup</p>
                    <p className="text-caption text-muted-foreground">Stretching and parent pickup</p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Location with Map */}
            <section>
              <h2 className="text-h5 mb-4" style={{ color: palette.accent }}>Location</h2>
              <div className="rounded-lg overflow-hidden mb-4 aspect-[16/9]">
                <iframe
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Cagan+Stadium,Stanford,CA&zoom=15"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Camp Location Map"
                />
              </div>
              <div className="text-body2">
                <p className="font-medium">Stanford Soccer Fields</p>
                <p className="text-muted-foreground">789 Campus Drive, Palo Alto, CA 94305</p>
                <p className="text-caption text-muted-foreground mt-2">
                  Free parking available in Lot A. Enter through the main gate on El Camino Real.
                </p>
              </div>
            </section>

            <Separator />

            {/* What's Included */}
            <section>
              <h2 className="text-h5 mb-4" style={{ color: palette.accent2 }}>What&apos;s Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Professional coaching instruction",
                  "Camp t-shirt and participation certificate",
                  "Daily lunch and healthy snacks",
                  "Hydration stations",
                  "All training equipment provided",
                  "End-of-week awards ceremony",
                  "Photo and video highlights",
                  "Post-camp skill report",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckIcon className="size-5 shrink-0" style={{ color: palette.primary }} />
                    <span className="text-body2">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* Policies */}
            <section>
              <h2 className="text-h5 mb-4" style={{ color: palette.primary }}>Policies</h2>
              <div className="space-y-4 text-body2">
                <div>
                  <p className="font-medium mb-1">Cancellation Policy</p>
                  <p className="text-muted-foreground">
                    Full refund up to 14 days before. 50% refund or credit within 14 days. No refunds within 48 hours.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Medical Requirements</p>
                  <p className="text-muted-foreground">
                    Current physical exam and completed health form required. Allergies and medications must be disclosed.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Safety</p>
                  <p className="text-muted-foreground">
                    All coaches are background-checked and CPR/First Aid certified. AED on-site at all times.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-[140px] space-y-6">
              {/* Academy Info */}
              <Card className="gap-2">
                <CardHeader className="pb-0">
                  <CardTitle className="text-subtitle1">Hosted by</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: palette.accent2 }}
                    >
                      BA
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        Bay Area Soccer Academy
                        <VerifiedIcon className="size-4" style={{ color: palette.accent }} />
                      </p>
                      <p className="text-caption text-muted-foreground">
                        Est. 2015 · 50+ camps hosted
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-caption text-muted-foreground">
                    <Badge
                      className="text-xs"
                      style={{ backgroundColor: palette.accent, color: palette.accentForeground }}
                    >
                      4.9 Rating
                    </Badge>
                    <Badge variant="outline" className="text-xs">1,200+ campers</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Coaches */}
              <Card className="gap-2">
                <CardHeader className="pb-0">
                  <CardTitle className="text-subtitle1">Meet the Coaches</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {coaches.map((coach, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={coach.avatar} alt={coach.name} />
                        <AvatarFallback>{coach.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-body2 font-medium">{coach.name}</p>
                        <p
                          className="text-caption font-medium"
                          style={{ color: index === 0 ? palette.primary : palette.accent2 }}
                        >
                          {coach.role}
                        </p>
                        <p className="text-caption text-muted-foreground">{coach.credentials}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Safety Requirements */}
              <Card className="gap-2">
                <CardHeader className="pb-0">
                  <CardTitle className="text-subtitle1">Safety & Requirements</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-caption text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckIcon className="size-4 shrink-0 mt-0.5" style={{ color: palette.accent }} />
                      <span>All coaches background-checked</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckIcon className="size-4 shrink-0 mt-0.5" style={{ color: palette.accent }} />
                      <span>CPR & First Aid certified staff</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckIcon className="size-4 shrink-0 mt-0.5" style={{ color: palette.accent }} />
                      <span>AED available on-site</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckIcon className="size-4 shrink-0 mt-0.5" style={{ color: palette.accent }} />
                      <span>1:8 coach-to-player ratio</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Reviews Section */}
        <section className="mb-8">
          <h2 className="text-h5 mb-4" style={{ color: palette.primary }}>Reviews</h2>

          {/* Rating Summary */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-4 md:items-center">
            <div className="flex items-center gap-2">
              <span className="text-h4 font-medium">4.9</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} className="size-4 text-warning" filled />
                ))}
              </div>
              <span className="text-caption text-muted-foreground">(127)</span>
            </div>
            <div className="flex-1 space-y-1 max-w-md">
              {[
                { stars: 5, count: 110 },
                { stars: 4, count: 12 },
                { stars: 3, count: 3 },
              ].map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="text-caption w-6">{item.stars}</span>
                  <Progress
                    value={(item.count / 127) * 100}
                    className="flex-1 h-1.5"
                  />
                  <span className="text-caption text-muted-foreground w-6">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">{review.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-caption font-medium">{review.author}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <StarIcon
                              key={i}
                              className="size-3"
                              filled={i <= review.rating}
                              style={{ color: i <= review.rating ? "#EF6C00" : "#C0C9D6" }}
                            />
                          ))}
                        </div>
                        <span className="text-caption text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-caption text-muted-foreground hover:text-foreground"
                    onClick={() => handleHelpful(review.id)}
                  >
                    <ThumbsUpIcon className="size-3" />
                    {helpfulCounts[review.id]}
                  </Button>
                </div>
                <p className="text-caption text-muted-foreground">{review.content}</p>
              </div>
            ))}
          </div>

          <Button variant="secondary" size="sm" className="mt-4">
            View All 127 Reviews
          </Button>
        </section>

        <Separator className="my-12" />

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-h5 mb-6" style={{ color: palette.accent }}>Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="max-w-2xl">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <Separator className="my-12" />

        {/* Similar Camps Carousel */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h5" style={{ color: palette.accent2 }}>Similar Camps</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollSimilarCamps("left")}
              >
                <ChevronLeftIcon className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollSimilarCamps("right")}
              >
                <ChevronRightIcon className="size-5" />
              </Button>
            </div>
          </div>
          <div
            ref={similarCampsRef}
            className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {similarCamps.map((camp, index) => (
              <Card
                key={camp.id}
                className="shrink-0 w-72 overflow-hidden"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="aspect-[4/3] relative">
                  <Image
                    src={camp.image}
                    alt={camp.name}
                    fill
                    className="object-cover"
                    sizes="288px"
                  />
                  <Badge
                    className="absolute top-3 left-3 text-xs"
                    style={{
                      backgroundColor: index % 2 === 0 ? palette.accent : palette.accent2,
                      color: index % 2 === 0 ? palette.accentForeground : palette.accent2Foreground,
                    }}
                  >
                    {camp.sport}
                  </Badge>
                </div>
                <CardContent className="pt-4">
                  <h3 className="text-subtitle1 font-medium mb-1">{camp.name}</h3>
                  <div className="flex items-center justify-between text-caption text-muted-foreground mb-3">
                    <span>Ages {camp.ages}</span>
                    <span className="flex items-center gap-1">
                      <StarIcon className="size-3 text-warning" filled />
                      {camp.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-subtitle1 font-medium" style={{ color: palette.primary }}>
                      ${camp.price}
                    </span>
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-subtitle2 font-medium mb-4">For Parents</h4>
              <ul className="space-y-2 text-caption text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Browse Camps</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-subtitle2 font-medium mb-4">For Academies</h4>
              <ul className="space-y-2 text-caption text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">List Your Camp</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-subtitle2 font-medium mb-4">For Coaches</h4>
              <ul className="space-y-2 text-caption text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Join as Coach</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Build Your Profile</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Resources</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-subtitle2 font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-caption text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <Separator className="mb-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Image
                src={palette.footerLogo}
                alt="Tenpo"
                width={100}
                height={32}
              />
              <p className="text-caption text-muted-foreground">
                &copy; 2025 Tenpo. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-4 text-caption text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================== REGISTRATION MODAL ==================== */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {registerStep === "form" ? (
            <>
              <DialogHeader>
                <DialogTitle style={{ color: palette.primary }}>Register for Camp</DialogTitle>
                <DialogDescription>
                  Complete the form below to secure your spot at Elite Soccer Skills Camp.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Camper Information */}
                <div className="space-y-3">
                  <h4 className="text-subtitle2 font-medium" style={{ color: palette.accent }}>
                    Camper Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="childName">Child&apos;s Name *</Label>
                      <Input
                        id="childName"
                        placeholder="Enter name"
                        value={registerForm.childName}
                        onChange={(e) => setRegisterForm({ ...registerForm, childName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Age *</Label>
                      <Select
                        value={registerForm.childAge}
                        onValueChange={(value) => setRegisterForm({ ...registerForm, childAge: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select age" />
                        </SelectTrigger>
                        <SelectContent>
                          {[8, 9, 10, 11, 12].map((age) => (
                            <SelectItem key={age} value={String(age)}>{age} years old</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Parent/Guardian Information */}
                <div className="space-y-3">
                  <h4 className="text-subtitle2 font-medium" style={{ color: palette.accent }}>
                    Parent/Guardian Information
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="parentName">Full Name *</Label>
                      <Input
                        id="parentName"
                        placeholder="Your full name"
                        value={registerForm.parentName}
                        onChange={(e) => setRegisterForm({ ...registerForm, parentName: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@email.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                      <Input
                        id="emergencyContact"
                        placeholder="Name and phone number"
                        value={registerForm.emergencyContact}
                        onChange={(e) => setRegisterForm({ ...registerForm, emergencyContact: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Medical/Additional Info */}
                <div className="space-y-3">
                  <h4 className="text-subtitle2 font-medium" style={{ color: palette.accent2 }}>
                    Additional Information
                  </h4>
                  <div className="space-y-1.5">
                    <Label htmlFor="medicalNotes">Medical Notes / Allergies</Label>
                    <Textarea
                      id="medicalNotes"
                      placeholder="Any allergies, medications, or conditions we should know about..."
                      value={registerForm.medicalNotes}
                      onChange={(e) => setRegisterForm({ ...registerForm, medicalNotes: e.target.value })}
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="text-subtitle2 font-medium">Order Summary</h4>
                  <div className="space-y-1 text-caption">
                    <div className="flex justify-between">
                      <span>Elite Soccer Skills Camp</span>
                      <span>$349.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jul 15-19, 2025 (5 days)</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Service fee</span>
                      <span>$35.00</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium text-body2">
                      <span>Total</span>
                      <span style={{ color: palette.primary }}>$384.00</span>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreeTerms"
                    checked={registerForm.agreeTerms}
                    onCheckedChange={(checked) => setRegisterForm({ ...registerForm, agreeTerms: checked === true })}
                  />
                  <Label htmlFor="agreeTerms" className="font-normal text-muted-foreground leading-snug">
                    I agree to the{" "}
                    <a href="#" className="underline" style={{ color: palette.primary }}>Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="underline" style={{ color: palette.primary }}>Cancellation Policy</a>.
                    I confirm that my child has a current physical examination on file.
                  </Label>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  style={{ backgroundColor: palette.primary, color: palette.primaryForeground }}
                  onClick={handleRegisterSubmit}
                  disabled={!registerForm.agreeTerms || !registerForm.childName || !registerForm.email}
                >
                  Complete Registration - $384
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader className="text-center sm:text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.primary }}>
                  <CheckIcon className="size-8" style={{ color: palette.primaryForeground }} />
                </div>
                <DialogTitle className="text-h5" style={{ color: palette.primary }}>Registration Complete!</DialogTitle>
                <DialogDescription className="text-body2">
                  You&apos;re all set for Elite Soccer Skills Camp
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="size-5" style={{ color: palette.accent }} />
                    <div>
                      <p className="text-caption text-muted-foreground">Dates</p>
                      <p className="text-body2 font-medium">July 15-19, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClockIcon className="size-5" style={{ color: palette.accent }} />
                    <div>
                      <p className="text-caption text-muted-foreground">Time</p>
                      <p className="text-body2 font-medium">9:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="size-5" style={{ color: palette.accent }} />
                    <div>
                      <p className="text-caption text-muted-foreground">Location</p>
                      <p className="text-body2 font-medium">Stanford Soccer Fields, Palo Alto</p>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-caption text-muted-foreground">
                    Confirmation email sent to
                  </p>
                  <p className="text-body2 font-medium" style={{ color: palette.primary }}>
                    {registerForm.email || "parent@email.com"}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-3 text-caption text-muted-foreground">
                  <p className="font-medium mb-1">What&apos;s Next?</p>
                  <ul className="space-y-1">
                    <li>• Complete the online health form (link in email)</li>
                    <li>• Review the camp packing list</li>
                    <li>• Mark your calendar for drop-off at 8:45 AM</li>
                  </ul>
                </div>
              </div>

              <DialogFooter>
                <Button
                  className="w-full"
                  style={{ backgroundColor: palette.primary, color: palette.primaryForeground }}
                  onClick={handleCloseModal}
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== BACK TO TOP ==================== */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 rounded-full shadow-lg transition-all hover:scale-105"
          style={{ backgroundColor: palette.primary, color: palette.primaryForeground }}
          aria-label="Back to top"
        >
          <ArrowUpIcon className="size-5" />
        </Button>
      )}

      {/* ==================== MOBILE STICKY ACTION BAR ==================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-h5 font-medium" style={{ color: palette.primary }}>$349</span>
            <span className="text-caption text-muted-foreground"> / camper</span>
          </div>
          <Button
            className="flex-1 max-w-xs"
            style={{ backgroundColor: palette.primary, color: palette.primaryForeground }}
            onClick={handleOpenRegisterModal}
          >
            Register Now
          </Button>
        </div>
      </div>
    </div>
  )
}
